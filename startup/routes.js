const cors = require("cors");
const express = require("express");
const user = require("../routes/users");

module.exports = function (app) {
  app.use(cors());
  app.use("uploads", express.static("uploads"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/users", user);
};
