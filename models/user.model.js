const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User schema
const userSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			required: function () {
				return !this.credentialAccount; // Password is required if not using a credential account
			},
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		credentialAccount: {
			type: Boolean,
			default: false,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
			required: function () {
				return !this.credentialAccount; // Gender is required if not using a credential account
			},
		},
		age: {
			type: Number,
			required: function () {
				return !this.credentialAccount; // Age is required if not using a credential account
			},
		},
		role: {
			type: String,
			enum: ["User", "Admin", "SuperAdmin"],
			default: "User",
		},
	},
	{ timestamps: true }
);

// Index for better querying
userSchema.index({ createdAt: -1 });

// Instance method for password comparison
userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
