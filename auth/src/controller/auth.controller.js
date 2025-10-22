const jwt = require("jsonwebtoken");
const userModel = require("../models/auth.model");
const bcrypt = require("bcrypt");

function generateToken(id, email, role) {
  return jwt.sign({id, email, role}, process.env.JWT_SECRET, {expiresIn: "7d"});
}

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

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT_ROUNDS) || 10
  );

  const user = await userModel.create({
    userName: {firstName, lastName},
    email,
    password: hashedPassword,
  });

  const token = generateToken(user.id, user.email, user.role);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(201).json({
    success: true,
    message: "User register Success",
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.fullName.firstName,
    },
  });
}

async function loginUser(req, res) {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({message: "Email and Password are require!!"});
    }

    const user = await userModel.findOne({email}).select("+password");

    if (!user) {
      return res.status(400).json({message: "Invalid email or password"});
    }

    const isPassword = bcrypt.compare(password, user.password);

    if (!isPassword)
      return res.status(400).json({message: "Invalid email or password!"});

    const token = generateToken(user.id, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.fullName.firstName,
      },
    });
  } catch (error) {
    res.status(500).json({message: "Sever Error", details: error.message});
  }
}

async function updateUser(){

}

async function  deleteUser() {
  
}

async function logoutUser(){

}

module.exports = {loginUser, registerUser , updateUser , deleteUser, logoutUser};
