const { Place } = require("../models/Place");
const { User } = require("../models/User");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const { City } = require("../models/City");
const { Service } = require("../models/Service");
const _ = require("lodash");
const { Notification } = require("../models/Notification");

exports.countDocsToday = async (req, res, next) => {
  try {
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const places = await Place.find({
      createdAt: { $gte: today },
    });

    res.status(200).send({ places });
  } catch (error) {
    next(error);
  }
};

exports.getPlacesInCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.cityId);
    if (!city) return res.status(404).send("City not found");

    const places = await Place.find({ city: req.params.cityId }).populate(
      "allRates"
    );
    res.status(200).send(places);
  } catch (error) {
    next(error);
  }
};

exports.bestPlaces = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.cityId);
    if (!city) return res.status(404).send("City not found");

    const places = await Place.find({ city: req.params.cityId })
      .sort({
        rating: -1,
      })
      .populate("allRates");
    res.status(200).send(places);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId).populate("allRates");
    if (!place) return res.status(404).send("Place not found");

    res.status(200).send(place);
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    let place;
    if (req.query.search) {
      const text = req.query.search;
      const Regex = new RegExp(text, "gi");
      place = await Place.findOne({
        name: req.query.search == "" ? /^$|/ : Regex,
        city: req.params.cityId,
      }).populate("allRates");
    }
    if (!place) return res.status(400).send("No results found");

    res.status(200).send(place);
  } catch (error) {
    next(error);
  }
};

exports.fetchMedia = async (req, res, next) => {
  try {
    let place = await Place.findById(req.params.placeId);
    if (!place) return res.status(404).send("Place not found");

    res.status(200).send(place.media);
  } catch (error) {
    next(error);
  }
};

exports.nearestPlaces = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.cityId);
    if (!city) return res.status(404).send("city not exist");

    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).send("service not exist");

    let places = await Place.find({
      location: {
        $near: {
          $maxDistance: 1700,
          $geometry: {
            type: req.user.location.type,
            coordinates: req.user.location.coordinates,
          },
        },
      },
    }).populate("allRates");

    res.status(200).send(places);
  } catch (error) {
    next(error);
  }
};

exports.newPlace = async (req, res, next) => {
  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  try {
    req.body.city = req.params.cityId;
    req.body.service = req.params.serviceId;

    const place = new Place({
      ...req.body,
      location: {
        coordinates: [req.body.lng, req.body.lat],
      },
    });
    await place.save();

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(201).send(place);
  } catch (error) {
    next(error);
  }
};

exports.addMedia = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId).populate("allRates");
  if (!place) return res.status(404).send("Place not found");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  try {
    place.media.push(req.body.image);
    await place.save();

    // Send Notification in-app
    const clients = await User.find({ savedPlaces: place._id });
    const targetUsers = clients.map((user) => user.id);
    const notification = await new Notification({
      title: "Rehal",
      body: `new media added to ${place.name}.`,
      user: req.user._id,
      targetUsers: targetUsers,
      subjectType: "Place",
      subject: place._id,
    }).save();

    // push notifications
    const receivers = clients;
    for (let i = 0; i < receivers.length; i++) {
      await receivers[i].sendNotification(
        notification.toFirebaseNotification()
      );
    }

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(200).send(place);
  } catch (error) {
    next(error);
  }
};

exports.editPlace = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId).populate("allRates");
  if (!place) return res.status(404).send("Place not found");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  try {
    delete req.body.city;
    delete req.body.service;

    if (req.body.lng || req.body.lat) {
      req.body.location = {
        coordinates: [req.body.lng, req.body.lat],
      };
    }

    await place
      .set({
        ...req.body,
      })
      .save();
    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(200).send(place);
  } catch (error) {
    next(error);
  }
};

exports.deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId);
    if (!place) return res.status(404).send("Place not found");

    await place.delete();
    res.status(204).send("deleted");
  } catch (error) {
    next(error);
  }
};
