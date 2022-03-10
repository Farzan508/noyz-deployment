const { tokenVerifier } = require("../middlewares/tokenVerifier");
const userController = require("../controllers/user");
const { upload } = require("../middlewares/multer");
const express = require("express");
const router = express.Router();

// -------------------------------------------  User routes...

router.post(
  "/profile/picture",
  tokenVerifier,
  upload.single("image"),
  userController.uploadProfilePicture
);

module.exports = router;
