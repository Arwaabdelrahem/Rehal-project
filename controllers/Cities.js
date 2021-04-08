const { City } = require("../models/City");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const { Service } = require("../models/Service");

exports.getAll = async (req, res, next) => {
  const cities = await City.paginate({});
  res.status(200).send(cities);
};

exports.getCity = async (req, res, next) => {
  let city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  res.status(200).send(city);
};

exports.cityServices = async (req, res, next) => {
  let city = await City.findById(req.params.cityId).populate([
    { path: "services", select: "name" },
  ]);
  if (!city) return res.status(404).send("City not found");

  res.status(200).send(city.services);
};

exports.newCity = async (req, res, next) => {
  let city = await City.findOne({ postalCode: req.body.postalCode });
  if (city) return res.status(400).send("City already exits");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  city = new City(req.body);
  await city.save();

  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(201).send(city);
};

exports.addServiceToCity = async (req, res, next) => {
  let city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  let service = await Service.findById(req.params.serviceId);
  if (!service) return res.status(404).send("Service not found");

  if (city.services.indexOf(req.params.serviceId) !== -1)
    return res.status(400).send("Service already exists");

  city.services.push(service._id);
  await city.save();
  await City.populate(city, [{ path: "services", select: "name" }]);
  res.status(200).send(city);
};

exports.editCity = async (req, res, next) => {
  let city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  await city.set(req.body).save();
  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(200).send(city);
};

exports.deleteCity = async (req, res, next) => {
  let city = await City.findById(req.params.cityId);
  if (!city) return res.status(404).send("City not found");

  await city.delete();
  res.status(204).send("deleted");
};
