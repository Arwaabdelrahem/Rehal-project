const { Service } = require("../models/Service");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const _ = require("lodash");
const { City } = require("../models/City");

exports.getAll = async (req, res, next) => {
  try {
    const services = await Service.find({});
    res.status(200).send(services);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).send("Service not found");

    res.status(200).send(service);
  } catch (error) {
    next(error);
  }
};

exports.newService = async (req, res, next) => {
  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  try {
    const service = new Service(req.body);
    await service.save();

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(201).send(service);
  } catch (error) {
    next(error);
  }
};

exports.editService = async (req, res, next) => {
  let service = await Service.findById(req.params.serviceId);
  if (!service) return res.status(404).send("Service not found");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  try {
    await service.set(req.body).save();
    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(200).send(service);
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  let service = await Service.findById(req.params.serviceId);
  if (!service) return res.status(404).send("Service not found");

  let cities = await City.find({ services: req.params.serviceId }).populate([
    { path: "services", select: "name" },
  ]);

  try {
    for (const i in cities) {
      const serviceId = parseInt(req.params.serviceId);
      const cityService = _.findKey(cities[i].services, (s) => {
        if (s._id === serviceId) return "index";
      });

      if (cityService) {
        cities[i].services.splice(cityService, 1);
        await cities[i].save();
      }
    }
    await service.delete();
    res.status(204).send("deleted");
  } catch (error) {
    next(error);
  }
};
