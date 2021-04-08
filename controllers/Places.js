const { Place } = require("../models/Place");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const { City } = require("../models/City");

exports.getPlacesInCity = async (req, res, next) => {
  const city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  const places = await Place.paginate({ city: req.params.cityId });
  res.status(200).send(places);
};

exports.getById = async (req, res, next) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  res.status(200).send(place);
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
