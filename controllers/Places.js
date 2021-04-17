const { Place } = require("../models/Place");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const https = require("https");
const { City } = require("../models/City");
const { Service } = require("../models/Service");
const _ = require("lodash");

exports.getPlacesInCity = async (req, res, next) => {
  const city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  const places = await Place.paginate({ city: req.params.cityId });
  res.status(200).send(places);
};

// exports.bestPlaces = async (req, res, next) => {
//   const city = await City.findById(req.params.cityId);
//   if (!city) return res.status(404).send("City not found");

//   const places = await Place.find({ city: req.params.cityId, rating: {$gt: } });
//   res.status(200).send(city);
// };

exports.getById = async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  res.status(200).send(place);
};

exports.fetchMedia = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  res.status(200).send(place.media);
};

exports.nearestPlaces = async (req, res, next) => {
  const user = req.user;

  const service = await Service.findById(req.params.serviceId);
  if (!service) return res.status(404).send("Service not found");

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${user.location.coordinates[0]},${user.location.coordinates[1]}&radius=1500&type=${service.name}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

  try {
    https
      .get(url, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          let places = JSON.parse(body);
          const locations = places.results;
          res.status(200).json(locations);
        });
      })
      .on("error", () => {
        console.log("error occured");
      });
  } catch (error) {
    next(error);
  }
};

exports.searchPlaces = async (req, res, next) => {
  const user = req.user;

  const service = await Service.findById(req.params.serviceId);
  if (!service) return res.status(404).send("Service not found");

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${user.location.coordinates[0]},${user.location.coordinates[1]}&radius=1500&type=${service.name}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  try {
    https.get(url, (response) => {
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        let places = JSON.parse(body);
        const locations = places.results;

        for (const i in locations) {
          if (
            locations[i].name
              .toLowerCase()
              .includes(req.body.query.toLowerCase())
          ) {
            return res.status(200).json(locations[i]);
          } else {
            return res.status(400).send("Smth went wrong, Please try again");
          }
        }
      });
    });
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

  req.body.city = req.params.cityId;
  req.body.service = req.params.serviceId;

  const place = new Place(req.body);

  await place.save();
  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(201).send(place);
};

exports.addMedia = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  place.media.push(req.body.image);
  await place.save();

  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(200).send(place);
};

exports.editPlace = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  delete req.body.city;
  delete req.body.service;

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  await place.set(req.body).save();
  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(200).send(place);
};

exports.deletePlace = async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  await place.delete();
  res.status(204).send("deleted");
};
