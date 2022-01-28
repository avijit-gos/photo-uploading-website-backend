const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    trim: true,
    require: [true, "Title is required"],
    minlength: [5, "Minimum 5 characters are required"],
    maxlength: [50, "Maximum 50 characters are needed"],
  },
  description: {
    type: String,
    trim: true,
    require: [true, "Title is required"],
    minlength: [5, "Minimum 5 characters are required"],
    maxlength: [500, "Maximum 500 characters are needed"],
  },
  catagory: {
    type: String,
    require: [true, "Title is required"],
  },
  image: {
    type: String,
    require: [true, "Profile picture is required"],
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Photo", PhotoSchema);
