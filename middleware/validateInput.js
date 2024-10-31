const { body, validationResult } = require("express-validator");

// Validation rules for user registration
const validateUserRegistration = [
	body("userName").notEmpty().withMessage("User name is required."),
	body("email").isEmail().withMessage("Invalid email."),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters."),
	body("age")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Age must be a positive number."),
	body("gender")
		.optional()
		.isIn(["Male", "Female", "Other"])
		.withMessage("Gender is invalid."),
];

// Validation rules for task creation
const validateTaskCreation = [
	body("title").notEmpty().withMessage("Title is required."),
	body("description").notEmpty().withMessage("Description is required."),
	body("category")
		.optional()
		.isIn([
			"work",
			"personal",
			"study",
			"shopping",
			"fitness",
			"finance",
			"social",
			"chores",
			"hobbies",
			"urgent",
		])
		.withMessage("Category is invalid."),
	body("priority")
		.optional()
		.isIn(["low", "medium", "high", "critical"])
		.withMessage("Priority is invalid."),
];

// Middleware to check validation results
const checkValidationResults = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() }); // Return validation errors
	}
	next(); // Proceed if there are no validation errors
};

module.exports = {
	validateUserRegistration,
	validateTaskCreation,
	checkValidationResults,
};
