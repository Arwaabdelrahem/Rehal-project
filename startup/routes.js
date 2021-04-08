const cors = require("cors");
const express = require("express");
const user = require("../routes/users");
const cities = require("../routes/cities");
const services = require("../routes/services");
const places = require("../routes/places");
const { errorHandler, serverErrorHandler } = require("../middlewares/error");

module.exports = function (app) {
  app.use(cors());
  app.use("uploads", express.static("uploads"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/users", user);
  app.use("/cities", cities);
  app.use("/services", services);
  app.use("/places", places);
  app.use(errorHandler);
  app.use(serverErrorHandler);
};
