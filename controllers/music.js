const { cloudinaryUpload } = require("../helpers/cloudinaryUpload");
const { fieldsValidator } = require("../helpers/fieldsValidator");
const user = require("../models/user");
const music = require("../models/music");

exports.uploadMusic = async (req, res) => {
  try {
    //Checking fields name
    const errors = fieldsValidator(["musicName"], req.body);
    if (errors.length > 0) {
      return res.json({ errors });
    }

    //Checking if file is uploaded or not
    if (!req.file) {
      return res.json({
        success: false,
        message: "Please upload a file.",
        data: [],
      });
    }

    //checking if music exists before or not?
    const _music = await music.findOne({ musicName: req.body.musicName });
    if (_music) {
      return res.json({
        success: false,
        message: "Music with this name already exists.",
        data: [],
      });
    }

    //uploading to cloudinary
    const audio = await cloudinaryUpload(req, res);

    //creating a new document
    const newMusic = new music({
      artistId: req.userData.id,
      musicName: req.body.musicName,
      musicLink: audio.secure_url,
    });
    await newMusic.save();

    return res.json({
      success: true,
      message: "Audio uploaded successfully.",
      data: newMusic,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
exports.likeMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const _music = await music.findOne({ _id: musicId });
    if (!_music) {
      return res.json({
        success: false,
        message: "This music is not available.",
        data: [],
      });
    }
    _music.likes.push(req.userData.id);
    await _music.save();
    const _user = await user.findOne({ _id: req.userData.id });
    // _user.
    return res.json({
      success: true,
      message: "Song added to your likes.",
      data: _music,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
