const jwt = require("jsonwebtoken");
const userModel = require("../models/auth.model");

function generateToken(id, email, role) {}
async function registerUser(req, res) {
  const {userName: {firstName, lastName} = {}, email, password} = req.body;

  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(400).json({message: "All fields are required"});
  }

  const userExist = await userModel.findOne({email});

  if (userExist) {
    return res
      .status(400)
      .json({success: false, message: "User already exists"});
  }

  
}

async function loginUser() {}

module.exports = {loginUser, registerUser};
