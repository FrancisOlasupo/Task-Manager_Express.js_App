const mongoose = require("mongoose");

// Define the Task schema
const TaskSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
		},
		category: {
			type: String,
			enum: [
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
			],
			default: "work",
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "critical"],
			default: "medium",
		},
		deadline: {
			type: Date,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		completedAt: {
			type: Date,
		},
	},
	{
		timestamps: true, // Automatically adds `createdAt` and `updatedAt`
	}
);

// Add a static method for calculating time remaining
TaskSchema.statics.calculateTimeRemaining = function (deadline) {
	const now = new Date();
	const timeDiff = deadline - now;
	if (timeDiff <= 0)
		return `Overdue by ${Math.abs(
			Math.floor(timeDiff / (1000 * 60 * 60))
		)} hours`;
	if (timeDiff < 86400000)
		return `${Math.floor(timeDiff / (1000 * 60 * 60))} hours left`;
	return `${Math.floor(timeDiff / (1000 * 60 * 60 * 24))} days left`;
};

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
