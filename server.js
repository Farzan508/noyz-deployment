const cloudinary = require("cloudinary").v2;
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const app = express();

const port = process.env.port || 5000;

// mongodb connection
mongoose
  .connect(process.env.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected with database.");
  })
  .catch((err) => {
    console.log(`Connection failed.`);
  });

//setting cloudinary config's
cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.apiKey,
  api_secret: process.env.apiSecretKey,
});

// json parser
app.use(express.json());

// Route towards the router file
require("./routes/routes")(app);

// Just to check the response
app.get("/check", (req, res) => {
  return res.json({
    msg: "Ready to roll !!",
  });
});

// server listening on the port
app.listen(port, () => {
  console.log(`Server started at port : ${port}`);
});
