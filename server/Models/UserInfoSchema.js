const mongoose = require("mongoose");
const User = require("./UserSchema");

const UserInfo = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  address_line: {
    type: String,
    trim: true,
    require: [true, "Address is required"],
  },
  pin: {
    type: String,
    trim: true,
    require: [true, "Pin code is required"],
    validate: {
      validator: function (value) {
        return /^[0-9]+$/.test(value);
      },
      message: (props) => "Invalid format for Pin Code" + props,
    },
  },
  country: {
    type: String,
    trim: true,
    require: [true, "Address is required"],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z]+$/.test(value);
      },
      message: (props) => "Invalid format for Pin Code" + props,
    },
  },
  city: {
    type: String,
    trim: true,
    require: [true, "Address is required"],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z]+$/.test(value);
      },
      message: (props) => "Invalid format for Pin Code" + props,
    },
  },
  profile_picture: {
    type: String,
    require: [true, "Profile picture  is required"],
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Info", UserInfo);
