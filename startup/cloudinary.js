const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.apiKey,
  api_secret: process.env.apiSecret,
});

exports.cloudUpload = (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({ image: result.url });
      },
      { resource_type: "auto" }
    );
  });
};
