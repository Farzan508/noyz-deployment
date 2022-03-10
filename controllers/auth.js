const { linkGenerator } = require("../helpers/signupConfirmationLinkGenerator");
const { cloudinaryUpload } = require("../helpers/cloudinaryUpload");
const fieldsValidator = require("../helpers/fieldsValidator");
const { validationResult } = require("express-validator");
const genUsername = require("unique-username-generator");
const { sendMail } = require("../helpers/nodemailer");
const cloudinary = require("cloudinary").v2;
const Formidable = require("formidable");
const validator = require("validator");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  try {
    let createUsername; // holds the auto-generated username;
    const routeString = `noyz/auth/confirm`;
    const emailSubject = `Email Verification NOYZ`;
    const emailBody = `You registered an account on NOYZ , before being able to use your account you need to verify that this is your email address by clicking here:`;

    //Validating basic input fields for signup (username, password, email).
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    //Password length validator.
    if (req.body.password.length < 8) {
      return res.json({
        success: false,
        message: "Password length should be greater or equal to 8.",
        data: [],
      });
    }

    //Genre length validator
    if (req.body.genre && req.body.genre.length > 3) {
      return res.json({
        success: false,
        message: "Maximum 3 music genre can be selected.",
        data: [],
      });
    }

    //If all inputs go well, run the signup process.
    if (validator.isEmail(req.body.email)) {
      createUsername = genUsername.generateFromEmail(`${req.body.email}`, 3);
      // return res.send(createUsername);
      const _user = await user.find({
        $or: [
          { username: createUsername },
          { email: req.body.email },
          { walletAddress: req.body.walletAddress },
        ],
      });

      //checking if user exists or not.
      if (_user.length < 1) {
        //if user not found, create a new one.
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
          if (err) {
            return res.json({
              success: false,
              message: err.message,
              data: [],
            });
          }
          const confirmationCode = linkGenerator();
          const newUser = new user({
            fullName: req.body.fullName,
            username: createUsername,
            email: req.body.email,
            password: hash,
            genre: req.body.genre,
            walletAddress: req.body.walletAddress,
            emailConfirmationCode: confirmationCode,
          });
          sendMail(
            req.body.email,
            createUsername,
            confirmationCode,
            routeString,
            emailSubject,
            emailBody
          );
          await newUser.save();
          return res.json({
            success: true,
            message: "User created successfully.",
            data: newUser,
          });
        });
      } else {
        // return res if user exists.
        return res.json({
          success: false,
          message: "User with this email or wallet address already exists.",
          data: [],
        });
      }
    } else {
      // response if the email is not a valid one.
      return res.json({
        success: false,
        message: "Entered email is not valid.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }
    // login for wallet holder
    if (req.body.walletAddress && !(req.body.input, req.body.password)) {
      const _user = await user.findOne({
        walletAddress: req.body.walletAddress,
      });

      //if user not exists.
      if (!_user) {
        return res.json({
          success: false,
          message: "User with this wallet address not exists.",
          data: [],
        });
      }

      //if user exists, allocate a signin token.
      const token = jwt.sign(
        {
          id: _user.id,
          email: _user.email,
          username: _user.username,
          walletAddress: _user.walletAddress,
        },
        process.env.jwtKey,
        {
          expiresIn: "24h",
        }
      );
      return res.json({
        success: true,
        message: "User logged in successfully.",
        data: { ..._user._doc, token },
      });
    } else if (
      // if wallet not connected, signup using username and password
      !req.body.walletAddress &&
      (req.body.input, req.body.password)
    ) {
      const _user = await user.findOne({
        $or: [{ username: req.body.input }, { email: req.body.input }],
      });
      if (!_user) {
        return res.json({
          success: false,
          message: "User with these credentials not exists.",
          data: [],
        });
      }

      //compare passwords adn create a token.
      bcrypt.compare(req.body.password, _user.password, (err, result) => {
        if (err) {
          return res.json({
            success: false,
            message: "Invalid credentials.",
            data: [],
          });
        }
        const token = jwt.sign(
          {
            id: _user.id,
            email: _user.email,
            username: _user.username,
            walletAddress: _user.walletAddress,
          },
          process.env.jwtKey,
          {
            expiresIn: "24h",
          }
        );
        return res.json({
          success: true,
          message: "User logged in successfully.",
          data: { ..._user._doc, token },
        });
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.emailVerification = async (req, res) => {
  try {
    const _elm = await user.findOne({
      email: req.params.email,
      isEmailVerified: false,
    });
    if (!_elm) {
      return res.json({
        success: false,
        message: "Email confirmation failed.",
        data: [],
      });
    }
    if (_elm.emailConfirmationCode == req.params.confirmationCode) {
      _elm.isEmailVerified = true;
      await _elm.save();
      return res.json({
        success: true,
        message: "Email verification successfull.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }
    const { oldPassword, newPassword } = req.body;
    const _user = await user.findOne({ _id: req.userData.id });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    bcrypt.compare(oldPassword, _user.password, (err, result) => {
      if (err || result == false) {
        return res.json({
          success: false,
          message: "old password is not correct.",
          data: [],
        });
      }
      if (result) {
        bcrypt.hash(newPassword, 10, async (err, hash) => {
          if (err) {
            return res.json({
              success: false,
              message: "Password updation failed.",
              data: [],
            });
          }
          _user.password = hash;
          await _user.save();
          return res.json({
            success: true,
            message: "Password updated successfully.",
            data: [],
          });
        });
      }
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const routeString = `noyz/auth/confirm/reset/password`;
    const emailSubject = `Forget account password NOYZ`;
    const emailBody = `Your password reset request was generated for NOYZ account, please persue by clicking here:`;

    const { email } = req.body;
    const _user = await user.findOne({ email: email });
    if (!_user) {
      return res.json({
        success: false,
        message: "Email not found.",
        data: [],
      });
    }
    const createResetToken = jwt.sign(
      {
        id: _user.id,
        email: _user.email,
        username: _user.username,
        walletAddress: _user.walletAddress,
      },
      process.env.jwtKey,
      {
        expiresIn: "24h",
      }
    );
    _user.passwordResetToken = createResetToken;
    await _user.save();
    sendMail(
      _user.email,
      _user.username,
      _user.passwordResetToken,
      routeString,
      emailSubject,
      emailBody
    );
    return res.json({
      success: true,
      message: "Please check provided email to reset Password.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const _user = await user.findOne({
      email: req.params.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not exists.",
        data: [],
      });
    }
    if (_user.passwordResetToken == req.params.resetToken) {
      return res.json({
        success: true,
        message: "You can now update the password.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.resettingPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _user = await user.findOne({
      email: req.params.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    if (req.body.password == req.body.confirmPassword) {
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          return res.json({
            successs: false,
            message: err.message,
            data: [],
          });
        }
        _user.password = hash;
        await _user.save();
        return res.json({
          success: true,
          message: "Password updated successfully.",
          data: _user,
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Password and confirm passwords do not match.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.ifEmailExists = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _email = await user.findOne({ email: req.body.email });
    if (_email) {
      return res.json({
        success: false,
        message: "Entered email is already registered.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Email not exists. You can signup with this email.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.ifUsernameExists = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _username = await user.findOne({ username: req.body.username });
    if (_username) {
      return res.json({
        success: false,
        message: "Username already exists.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Username not exists, you can signup using this username.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
