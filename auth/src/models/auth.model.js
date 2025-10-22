const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
       unique: true
    },
    fullName: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {type: String},
    role: {type: String, enum: ["user", "admin"], default: "user"},
  },
  {timestamps: true}
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
