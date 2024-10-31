const bcrypt = require("bcryptjs");
const userModel = require("../models/usersSchema");
const jwt = require("jsonwebtoken");

// Create user
const register = async (req, res) => {
	try {
		const {
			userName,
			email,
			password,
			age,
			gender,
			role = "User",
		} = req.body; // Default role to 'User'

		// Check if the user already exists
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Ensure name is provided
		if (!userName) {
			return res.status(400).json({ message: "Name is required" });
		}

		// Hash the password before saving
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(password, salt);

		// Create and save the new user
		const savedUser = await userModel.create({
			userName,
			email,
			password: hashedPassword, // Store the hashed password
			age,
			gender,
			role,
		});

		// Respond with the registered user info
		res.status(201).json({
			message: "User registered successfully",
			user: {
				id: savedUser._id,
				userName: savedUser.userName,
				email: savedUser.email,
				age: savedUser.age,
				gender: savedUser.gender,
				role: savedUser.role,
			},
		});
	} catch (err) {
		res.status(500).json({ error: "Unable to create user" });
		console.log(err);
	}
};

// Login user
const loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		// Checking if email matches
		const userInfo = await userModel.findOne({ email });
		if (!userInfo) {
			return res.status(404).json({ message: "Unable to find user" });
		}

		// If it's a credential account, skip the password check
		if (userInfo.credentialAccount) {
			// Create JWT payload
			const aboutUser = { userId: userInfo.id, role: userInfo.role };
			const token = jwt.sign(aboutUser, process.env.JWT_SECRET, {
				expiresIn: "12h",
			});

			// Set cookie with additional security
			res.cookie("user_token", token, {
				httpOnly: true,
				secure: true,
				sameSite: "Strict",
			});
			return res
				.status(200)
				.json({
					message: "Successfully logged in via credential account",
				});
		}

		// For regular users, ensure password is provided
		if (!password) {
			return res.status(400).json({ message: "Password is required" });
		}

		// Checking if password matches
		const isPasswordValid = await bcrypt.compare(
			password,
			userInfo.password
		);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Password does not match" });
		}

		// Create JWT payload
		const aboutUser = {
			userId: userInfo.id,
			role: userInfo.role,
		};

		// Generate JWT with expiration
		const token = jwt.sign(aboutUser, process.env.JWT_SECRET, {
			expiresIn: "12h",
		});
		const decoded = jwt.decode(token);
		console.log(decoded);

		// Set cookie with additional security
		res.cookie("user_token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
		});

		res.status(200).json({ message: "Successfully logged in" });
	} catch (err) {
		res.status(500).json({ error: "Failed to login" });
		console.error(err);
	}
};

// Logout user
const logout = async (req, res) => {
	try {
		// Clear the user_token cookie with proper options
		res.clearCookie("user_token", {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
		});

		return res.status(200).json({
			message: "Successfully logged out. See you soon!",
		});
	} catch (error) {
		console.error("Logout Error:", error); // Log the error for debugging
		res.status(500).json({
			error: "Logout failed. Please try again.",
		});
	}
};

// Authenticate and register
const authRegister = async (req, res) => {
	const { userName, email, gender } = req.body;

	// Validate required fields
	if (!userName || !email || !gender) {
		return res
			.status(400)
			.json({ message: "All required fields must be provided" });
	}

	try {
		// Check if the user already exists
		const existingUser = await userModel.findOne({ email });

		if (existingUser) {
			// If the user exists and is a credential account, return an error
			if (existingUser.credentialAccount) {
				return res.status(400).json({
					message:
						"Illegal parameters: User already exists as a credential account",
				});
			}

			// If the user exists and is not a credential account, log them in
			const aboutUser = {
				userId: existingUser.id,
				role: existingUser.role,
			};
			const token = jwt.sign(aboutUser, process.env.JWT_SECRET, {
				expiresIn: "12h",
			});
			res.cookie("user_token", token, {
				httpOnly: true,
				sameSite: "strict",
			});
			return res.status(200).json({ message: "Login successful" });
		}

		// Create a new user
		const newUser = new userModel({
			userName,
			email,
			gender,
			credentialAccount: true, // Mark this as a credential account
		});

		const savedUser = await newUser.save();

		// Create a token for the newly registered user
		const aboutUser = { userId: savedUser.id, role: savedUser.role };
		const token = jwt.sign(aboutUser, process.env.JWT_SECRET, {
			expiresIn: "12h",
		});

		// Set the cookie securely
		res.cookie("user_token", token, { httpOnly: true, sameSite: "strict" });

		return res
			.status(201)
			.json({ message: "User created and login successful" });
	} catch (error) {
		console.error(error); // Log the error for debugging
		return res
			.status(500)
			.json({ message: "Server error. Please try again later." });
	}
};

module.exports = { register, loginUser, logout, authRegister };
