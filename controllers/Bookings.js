const { Booking } = require("../models/Booking");

exports.getAll = async (req, res, next) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).send(bookings);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).send("Booking not found");

    res.status(200).send(booking);
  } catch (error) {
    next(error);
  }
};

exports.newBooking = async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.place = req.params.placeId;

  let booking = await Booking.findOne({
    user: req.user.id,
    place: req.params.placeId,
  });
  if (booking)
    return res.status(400).send("you have already booked your place");

  booking = new Booking(req.body);
  await booking.save();

  res.status(201).send(booking);
};

exports.editBooking = async (req, res, next) => {
  let booking = await Booking.findById(req.params.bookingId);
  if (!booking) return res.status(404).send("Booking not found");

  try {
    delete req.body.user;
    delete req.body.place;

    await booking.set(req.body).save();
    res.status(200).send(booking);
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).send("Booking not found");

    await booking.delete();
    res.status(204).send("deleted");
  } catch (error) {
    next(error);
  }
};
