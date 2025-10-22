const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controller/auth.controller");

const {
  registerUserValidations,
  loginUserValidations,
} = require("../middleware/validate.middleware");
const router = express.Router();

router.post("/register", registerUserValidations, registerUser);
router.post("/login", loginUserValidations, loginUser);
router.post("/logout", logoutUser);

module.exports = router;
