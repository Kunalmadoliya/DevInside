const jwt = require("jsonwebtoken");
const userModel = require("../models/auth.model");
const bcrypt = require("bcrypt");
const redis = require("../db/redis");

function generateToken(id, email, role) {
  return jwt.sign({id, email, role}, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function registerUser(req, res) {
  try {
    const {userName, fullName, email, password} = req.body;
    const {firstName, lastName} = fullName || {};

    if (
      !userName ||
      !fullName ||
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({message: "All fields are required"});
    }

    const userExist = await userModel.findOne({email});
    if (userExist) {
      return res
        .status(409)
        .json({success: false, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS) || 10
    );

    const user = await userModel.create({
      userName,
      fullName: {firstName, lastName},
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id, user.email, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match JWT
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        userName: user.userName,
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName.firstName,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Server Error", details: error.message});
  }
}

async function loginUser(req, res) {
  try {
    const {email, password} = req.body;
    if (!email || !password)
      return res.status(400).json({message: "Email and Password are required"});

    const user = await userModel.findOne({email}).select("+password");
    if (!user)
      return res.status(401).json({message: "Invalid email or password"});

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword)
      return res.status(401).json({message: "Invalid email or password"});

    const token = generateToken(user._id, user.email, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        userName: user.userName,
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Server Error", details: error.message});
  }
}

async function logoutUser(req, res) {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (token && global.redis && typeof redis.set === "function") {
      try {
        await redis.set(`blacklist:${token}`, "true", "EX", 24 * 60 * 60);
      } catch (err) {
        console.warn("⚠️ Redis unavailable during logout, skipping...");
      }
    }

    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      expires: new Date(0),
    });

    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", details: error.message });
  }
}


async function updateUser(req, res) {
  const {userName , password ,  } = req.body 
  
}

async function deleteUser(req, res) {
  // Implement user deletion logic here
  return res.status(501).json({message: "Delete user not implemented yet"});
}

module.exports = {loginUser, registerUser, updateUser, deleteUser, logoutUser};
