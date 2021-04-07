function errorHandler(req, res, next) {
  const error = new Error("Route Not found");
  error.status = 404;
  next(error);
}

function serverErrorHandler(error, req, res, next) {
  res.status(error.status || 500).send(error.message);
}

module.exports.errorHandler = errorHandler;
module.exports.serverErrorHandler = serverErrorHandler;
