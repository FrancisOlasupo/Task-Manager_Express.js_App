const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
// configuring dotenv
dotenv.config();
const mongoose = require("mongoose");
const connectDB = require("./config/db.config");
const cookieParser = require("cookie-parser");
const route = require("./routes/user.route");
const port = process.env.PORT || 5000;
const authRoute = require("./routes/auth.route");
const taskRoute = require("./routes/task.route");

//Import middleware
const errorHandler = require("./middleware/errorhandler.middleware");

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies
app.use(errorHandler());

// Connect to MongoDB
connectDB();

// MongoDB connection
mongoose
	.connect(process.env.MONGO_URL)
	.then(() => console.log("Mongoose is connected"))
	.catch((err) => console.log("Error", err));

// Route setup
app.use(route);
app.use(authRoute);
app.use(taskRoute);

// Server startup
app.listen(port, () => {
	console.log(`App is running on port ${port}`);
});
