const express = require("express");
const route = express.Router();
const {
	getUser,
	deleteUser,
	updateUserInfo,
	updatePassword,
	updateRole,
} = require("../controller/user.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

route.get("/users/:id", authenticate, getUser);

route.delete("/delete", authenticate, deleteUser);

route.put("/update", authenticate, updateUserInfo);

route.put("/password", authenticate, updatePassword);

route.put(
	"/change-role/:id",
	authenticate,
	authorize(["Admin", "SuperAdmin"]),
	updateRole
);

module.exports = route;
