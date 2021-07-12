const { Place } = require("../models/Place");
const { Rate } = require("../models/Rate");

exports.countDocsToday = async (req, res, next) => {
  try {
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const rates = await Rate.find({
      createdAt: { $gte: today },
    });

    res.status(200).send({ rates });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let rates = await Rate.find({ place: req.params.placeId })
      .select("rating user place createdAt updatedAt")
      .sort("-createdAt")
      .populate([
        { path: "user", select: "name" },
        { path: "place", select: "name rating" },
      ]);

    res.status(200).send(rates);
  } catch (error) {
    next(error);
  }
};

exports.newRate = async (req, res, next) => {
  let place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).send("Place not found");

  let rate = await Rate.findOne({
    user: req.user._id,
    place: place._id,
  });

  if (rate) {
    await rate.set(req.body).save();
  } else {
    req.body.rating = parseInt(req.body.rating);
    req.body.user = req.user._id;
    req.body.place = place._id;
    rate = new Rate(req.body);
    await rate.save();
  }

  try {
    let countRate = [];
    let numberOfRates = 0;
    let rating, count;
    for (let i = 1; i <= 5; i++) {
      rating = await Rate.countDocuments({
        place: place._id,
        rating: i,
      });
      countRate.push(rating);

      count = i * countRate[i - 1];
      numberOfRates += count;
    }

    let countAll = await Rate.countDocuments({
      place: place._id,
    });

    let newRating = numberOfRates / countAll;

    place.rating = newRating;
    place.reviews = countAll;
    await place.save();

    await Rate.populate(rate, [
      { path: "user", select: "name" },
      { path: "place", select: "name rating" },
    ]);
    res.status(200).send(rate);
  } catch (error) {
    next(error);
  }
};
