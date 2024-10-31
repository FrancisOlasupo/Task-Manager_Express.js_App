const express = require("express");
const route = express.Router();
const authenticate = require("../middleware/auth.middleware");
const {
	createTask,
	updateTask,
	deleteTask,
	getTasks,
} = require("../controller/task.controller");
const {
	validateTaskCreation,
	checkValidationResults,
} = require("../middleware/validateInput");

route.use(authenticate); // Protect all task routes

route.post("/tasks", validateTaskCreation, checkValidationResults, createTask);

route.get("/tasks", getTasks);

route.put(
	"/tasks/:id",
	validateTaskCreation,
	checkValidationResults,
	updateTask
);

route.delete("/tasks/:id", deleteTask);

module.exports = route;
