const User = require("../Models/UserSchema");
const Info = require("../Models/UserInfoSchema");
const Photo = require("../Models/PhotoSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const cloudinary = require("cloudinary").v2;
const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: process.env.PRIVATE_API_KEY,
  domain: process.env.DOMAIN,
});
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

class UserController {
  constructor() {
    console.log("UserController init");
  }

  /**
   * @SIGNUP
   * @API:
   */
  SignUp(req, res) {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    } else {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: "Opps! something went wrong" });
        } else {
          if (user) {
            return res.status(400).json({ msg: "Email already taken" });
          } else {
            bcrypt.hash(password, 10, (err, hash) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                const newUser = User({
                  _id: new mongoose.Types.ObjectId(),
                  firstname: firstname,
                  lastname: lastname,
                  email: email,
                  password: hash,
                });
                newUser
                  .save()
                  .then((user) =>
                    res.status(201).json({ msg: "Successfully SignUp" })
                  )
                  .catch((err) => {
                    res.status(400).json({ msg: err.message });
                  });
              }
            });
          }
        }
      });
    }
  }

  /**
   * @SIGNIN
   */
  SignIn(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "All fields are required", status: false });
    } else {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: err.message, status: false });
        } else {
          if (!user) {
            return res.status(400).json({
              msg: "User doesn't exists. Please Register yourself first",
              status: false,
            });
          } else {
            bcrypt.compare(password, user.password, (err, result) => {
              if (err) {
                return res
                  .status(400)
                  .json({ msg: err.message, status: false });
              } else {
                if (!result) {
                  return res.status(400).json({
                    msg: "Password & Email did not match",
                    status: false,
                  });
                } else {
                  const token = jwt.sign(
                    {
                      _id: User._id,
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email,
                    },
                    process.env.SECRET_KEY,
                    { expiresIn: "7d" }
                  );
                  res.status(200).json({
                    msg: "Sucessfully SignIn",
                    token: token,
                    userId: user._id,
                    status: true,
                  });
                }
              }
            });
          }
        }
      });
    }
  }

  /**
   * @FORGET_PASSWORD
   */
  ForgetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Email field is required" });
    } else {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: err.message });
        } else {
          if (!user) {
            return res.status(400).json({ msg: "User does not exist" });
          } else {
            const resetToken = jwt.sign(
              { _id: user._id },
              process.env.RESET_KEY,
              { expiresIn: "1h" }
            );
            const data = {
              from: "noreply@test.com",
              to: email,
              subject: "Reset Password link",
              html: `
           <p>Click on the given below link to reset your password. This link is valid for next 1hour.</p>
           <p>${process.env.CLIENT_URL}/resetpassword/${resetToken}</p>
          `,
            };
            return User.updateOne({ resetLink: resetToken }, (err, result) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                mg.messages().send(data, (err, body) => {
                  if (err) {
                    return res.status(400).json({ msg: err.message });
                  } else {
                    return res.status(200).json({
                      msg: "Email has been sent. Please follow the instructions",
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  }

  ResetPassword(req, res) {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ msg: "New Password value is required" });
    } else {
      User.findOne({ resetLink: req.query.resetLink }, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: err.message });
        } else {
          if (!user) {
            return res.status(401).json({ msg: "Authentication error" });
          } else {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                const userObj = {
                  password: hash,
                };
                user = _.extend(user, userObj);
                user
                  .save()
                  .then((user) =>
                    res
                      .status(200)
                      .json({ msg: "Hurray! Your password has been updated" })
                  )
                  .catch((err) => {
                    res.status(400).json({ msg: err.message });
                  });
              }
            });
          }
        }
      });
    }
  }

  /**
   * @RESET_PASSWORD
   */
  updateProfile(req, res) {
    const file = req.files.profile_picture;
    const { address_line, pin, country, city, userId } = req.body;
    User.findById(userId, (err, user) => {
      if (err) {
        return res.status(400).json({ msg: err.message });
      } else {
        if (!user) {
          return res.status(400).json({ msg: "User not found" });
        } else {
          cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            //console.log(err, result);
            const newUserInfo = Info({
              _id: new mongoose.Types.ObjectId(),
              address_line: address_line,
              pin: pin,
              country: country,
              city: city,
              userId: userId,
              profile_picture: result.url,
            });
            newUserInfo
              .save()
              .then((result) => {
                res.status(200).json({ msg: "Update Successfully" });
              })
              .catch((err) => {
                res.status(400).json({ msg: err.message });
              });
          });
        }
      }
    });
  }

  /**
   * @GET_USER_PROFILE
   */
  getProfile(req, res) {
    if (!req.params.id) {
      return res.status(400).json({ msg: "User ID is not present" });
    } else {
      User.findById(req.params.id, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: err.message });
        } else {
          if (!user) {
            return res.status(400).json({ msg: "User not found" });
          } else {
            Info.findOne({ userId: req.params.id }, (err, info) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                res.status(200).json({ user, info });
              }
            });
          }
        }
      });
    }
  }

  /**
   * @UPLOAD_IMAGE
   */
  uploadPhoto(req, res) {
    const file = req.files.image;
    const { title, description, catagory } = req.body;
    if (!req.params.id || !req.query.token) {
      return res.status(401).json({ msg: "Invalid user authentication" });
    } else {
      User.findById(req.params.id, (err, user) => {
        if (err || !user) {
          return res.status(400).json({ msg: "User not found" });
        } else {
          cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ msg: "Error in photo uploading process" });
            } else {
              const newPhoto = Photo({
                _id: new mongoose.Types.ObjectId(),
                title: title,
                description: description,
                userId: req.params.id,
                catagory: catagory,
                image: result.url,
              });
              newPhoto
                .save()
                .then((result) => {
                  res
                    .status(201)
                    .json({ msg: "Photo successfully uploaded", newPhoto });
                })
                .catch((err) => {
                  res.status(400).json({ msg: err.message });
                });
            }
          });
        }
      });
    }
  }

  /**
   * @GET_SPECIFIC_USER_GALLERY
   */
  getSpecificUserPhoto(req, res) {
    if (!req.params.id || !req.query.token) {
      return res.status(401).json({ msg: "User authentication error" });
    } else {
      Photo.find({ userId: req.params.id }, (err, photos) => {
        if (err) {
          return res.status(400).json({ msg: err.message });
        } else {
          res.status(200).json(photos);
        }
      })
        .limit(req.query.limit * 1)
        .skip((req.query.page - 1) * req.query.limit);
    }
  }

  /**
   * @GET_ALL_IMAGES
   */
  getAllPhotos(req, res) {
    if (!req.params.id || !req.query.token) {
      return res.status(401).json({ msg: "Authentication error" });
    } else {
      User.findById(req.params.id, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: err.message });
        } else {
          if (!user) {
            return res.status(400).json({ msg: "User not found" });
          } else {
            Photo.find({}, (err, photos) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                res.status(200).json(photos);
              }
            })
              .limit(req.query.limit * 1)
              .skip((req.query.page - 1) * req.query.limit);
          }
        }
      });
    }
  }

  /**
   * @SEARCH_IMAGE_BY_TITLE
   */
  searchByTitle(req, res) {
    if (!req.query.token) {
      return res.status(401).json({ msg: "Authentication error" });
    } else {
      const searchField = req.body.title;
      Photo.find({ title: { $regex: searchField, $options: "$i" } })
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.status(400).json({ msg: err.message });
        });
    }
  }

  /**
   *@SEARCH_IMAGE_BY_CATAGORY
   */
  searchImageByCatagory(req, res) {
    const { catagory } = req.body;
    Photo.find({ catagory: catagory }, (err, photos) => {
      if (err) {
        return res.status(400).json({ meg: err.message });
      } else {
        res.status(200).json(photos);
      }
    })
      .limit(req.query.limit * 1)
      .skip((req.query.page - 1) * req.query.limit);
  }

  /**
   * @DELETE_IMAGE
   */
  deletePhoto(req, res) {
    Photo.findById(req.params.photoId, (err, photo) => {
      if (err) {
        return res.status(400).json({ msg: err.message });
      } else {
        if (!photo) {
          return res.status(400).json({ msg: "Photo is not found" });
        } else {
          if (`${photo.userId}` === req.params.userId) {
            Photo.findByIdAndDelete(req.params.photoId, (err, result) => {
              if (err) {
                return res.status(400).json({ msg: err.message });
              } else {
                return res
                  .status(200)
                  .json({ msg: "Photo successfully deleted" });
              }
            });
          }
        }
      }
    });
  }
}

module.exports = new UserController();
