const { cloudinaryUpload } = require("../helpers/cloudinaryUpload");
const user = require("../models/user");

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: "Please upload a file.",
        data: [],
      });
    }
    //cloudinary upload helper function.
    const image = cloudinaryUpload(req, res);

    //finding user who's uploading image and saving the image in the users
    const _user = await user.findOne({
      email: req.userData.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "Not a valid user.",
        data: [],
      });
    }
    _user.image = (await image).secure_url;
    await _user.save();
    return res.json({
      success: true,
      data: _user,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
