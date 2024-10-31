const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
	const token = req.cookies.user_token; // Extract token from cookies
	if (!token) {
		return res
			.status(401)
			.json({ message: "Access denied, no token provided." });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
		req.user = decoded; // Attach user data to request object
		next(); // Move to the next middleware or route handler
	} catch (err) {
		res.status(400).json({ message: "Invalid token." }); // Handle token errors
	}
};

module.exports = authenticate;
