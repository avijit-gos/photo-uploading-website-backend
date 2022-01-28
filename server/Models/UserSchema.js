const mongoose = require("mongoose");
const { isEmail } = require("validator");
const Info = require("./UserInfoSchema");
const Photo = require("./PhotoSchema");

const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    firstname: {
      type: String,
      trim: true,
      require: [true, "First name is required"],
      minlength: [3, "Minimum 3 characters are required for First name"],
      maxlength: [32, "Atmost 32 characters for First name"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z]+$/.test(value);
        },
        message: (props) => "Invalid format for First name" + props,
      },
    },
    lastname: {
      type: String,
      trim: true,
      require: [true, "Last name is required"],
      minlength: [3, "Minimum 3 characters are required for Last name"],
      maxlength: [32, "Atmost 32 characters for Last name"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z]+$/.test(value);
        },
        message: (props) => "Invalid format for Last name" + props,
      },
    },
    email: {
      type: String,
      trim: true,
      unique: [true, "Email already taken"],
      require: [true, "Email is required"],
      minlength: [10, "Minimum 10 characters are required for Email"],
      maxlength: [50, "Atmost 50 characters for Email"],
      validate: [isEmail, "Email format is not correct"],
    },
    password: {
      type: String,
      trim: true,
      require: [true, "Password is required"],
      minlength: [8, "Minimum 8 characters are required for Password"],
      validate: {
        validator: function (value) {
          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value);
        },
        message: (props) => "Invalid format for Password",
      },
    },
    resetLink: { data: String, default: "" },
    infoID: { type: mongoose.Schema.Types.ObjectId, ref: "Info" },
    photoID: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
