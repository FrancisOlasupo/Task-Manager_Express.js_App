const Task = require("../models/taskSchema");

// Create a new task
const createTask = async (req, res) => {
	try {
		const { title, description, category, deadline, completed, priority } =
			req.body;
		if (!title || !description) {
			return res
				.status(400)
				.json({ error: "Title and description are required." });
		}
		const task = new Task({
			user: req.user.userId,
			title,
			description,
			category,
			deadline,
			completed: completed || false,
			priority: priority || "medium",
		});
		await task.save();
		res.status(201).json({ message: "Task created successfully", task });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Helper function for calculating remaining time
var calculateTimeRemaining = (deadline) => {
	const now = new Date();
	const timeDiff = deadline - now;
	if (timeDiff <= 0)
		return `Overdue by ${Math.abs(
			Math.floor(timeDiff / (1000 * 60 * 60))
		)} hours`;
	if (timeDiff < 86400000)
		return `${Math.floor(timeDiff / (1000 * 60 * 60))} hours left`; // Less than a day
	return `${Math.floor(timeDiff / (1000 * 60 * 60 * 24))} days left`;
};

// Get tasks with dynamic time-based filters
const getTasks = async (req, res) => {
	try {
		const {
			id,
			category,
			status,
			dueDate,
			createdAt,
			startDate,
			endDate,
			priority,
			page = 1,
			all,
		} = req.query;

		if (id) {
			const task = await Task.findOne({ _id: id, user: req.user.userId });
			if (!task) return res.status(404).json({ error: "Task not found" });
			task.timeRemaining = calculateTimeRemaining(task.deadline); // Add time remaining dynamically
			return res.status(200).json({
				...task._doc, // Spread the task document properties
				timeRemaining: task.timeRemaining, // Add time remaining to the response
			});
		}

		const query = { user: req.user.userId };
		if (category) query.category = category;
		if (status) query.completed = status === "true";
		if (dueDate) {
			const date = new Date(dueDate);
			const startOfDay = new Date(date.setHours(0, 0, 0, 0));
			const endOfDay = new Date(date.setHours(23, 59, 59, 999));
			query.deadline = { $gte: startOfDay, $lte: endOfDay };
		}
		if (createdAt) query.createdAt = { $eq: new Date(createdAt) };
		if (startDate && endDate)
			query.deadline = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		if (priority) query.priority = priority;

		const usePagination = all !== "true";
		const limit = 10;
		const parsedPage = parseInt(page, 10) || 1;

		let tasks, totalTasks;
		if (usePagination) {
			tasks = await Task.find(query)
				.sort({ createdAt: -1 })
				.skip((parsedPage - 1) * limit)
				.limit(limit);
			totalTasks = await Task.countDocuments(query);
		} else {
			tasks = await Task.find(query).sort({ createdAt: -1 });
			totalTasks = tasks.length;

			return res.status(200).json({
				message: `Here are all your tasks so far: ${totalTasks} total tasks.`,
				tasks: tasks.map((task) => ({
					...task._doc,
					timeRemaining: calculateTimeRemaining(task.deadline),
				})),
			});
		}

		res.status(200).json({
			tasks: tasks.map((task) => ({
				...task._doc,
				timeRemaining: calculateTimeRemaining(task.deadline),
			})),
			totalTasks,
			totalPages: usePagination ? Math.ceil(totalTasks / limit) : 1,
			currentPage: usePagination ? parsedPage : 1,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update a task
const updateTask = async (req, res) => {
	try {
		const {
			title,
			description,
			category,
			deadline,
			completed,
			priority,
			completedAt,
		} = req.body;
		if (!title || !description)
			return res
				.status(400)
				.json({ error: "Title and description are required." });
		const task = await Task.findOneAndUpdate(
			{ _id: req.params.id, user: req.user.userId },
			{
				title,
				description,
				category,
				deadline,
				completed,
				priority,
				completedAt,
			},
			{ new: true, runValidators: true }
		);
		if (!task) return res.status(404).json({ msg: "Task not found." });
		task.timeRemaining = calculateTimeRemaining(task.deadline); // Update time remaining
		res.status(200).json(task);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete a task
const deleteTask = async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			user: req.user.userId,
		});
		if (!task) return res.status(404).json({ msg: "Task not found." });
		res.status(200).json({ msg: "Task deleted successfully." });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createTask,
	getTasks,
	updateTask,
	deleteTask,
};
