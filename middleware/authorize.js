const authorize = (roles = []) => {
	return (req, res, next) => {
		// If roles is a string, convert it to an array
		if (typeof roles === "string") {
			roles = [roles];
		}

		const userRole = req.user.role; // Get the user's role from the request
		if (!roles.includes(userRole)) {
			return res.status(403).json({ message: "Access denied." }); // Deny access if user role is not allowed
		}

		next(); // Move to the next middleware or route handler
	};
};

module.exports = authorize;
