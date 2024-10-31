// Middleware for centralized error handling
app.use((err, req, res, next) => {
	console.error(err.stack); // Log the error stack for debugging
	res.status(err.status || 500).json({
		message: err.message || "Something went wrong!",
		errors: err.errors || [], // Return validation errors if any
	});
});
