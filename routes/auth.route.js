const express = require("express");
const route = express.Router();
const {
	register,
	loginUser,
	logout,
	authRegister,
} = require("../controller/auth.controller");

const {
	validateUserRegistration,
	checkValidationResults,
} = require("../middleware/validateInput");

route.post(
	"/register",
	validateUserRegistration,
	checkValidationResults,
	register
);
route.post("/login", authenticate, loginUser);
route.post("/logout", authenticate, logout);
route.post("/auth", authRegister);

module.exports = route;
