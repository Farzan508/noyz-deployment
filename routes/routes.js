const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/user");
const authRoutes = require("../routes/auth");
const musicRoutes = require("../routes/music");
const express = require("express");

module.exports = (app) => {
  app.use(express.json());
  app.use(cookieParser());
  app.use("/noyz/auth", authRoutes);
  app.use("/noyz/user", userRoutes);
  app.use("/noyz/music", musicRoutes);
};
