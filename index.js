require("dotenv").config();
const express = require("express");
const app = express();

require("./startup/DB")();
require("./startup/routes")(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});
