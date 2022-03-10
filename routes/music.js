const { tokenVerifier } = require("../middlewares/tokenVerifier");
const { upload } = require("../middlewares/multer");
const musicController = require("../controllers/music");
const express = require("express");
const router = express.Router();

// -------------------------------------------  Music routes...

router.post(
  "/upload",
  tokenVerifier,
  upload.single("audio"),
  musicController.uploadMusic
);
// router.post("/music/like/:musicId", tokenVerifier, likeMusic);

module.exports = router;
