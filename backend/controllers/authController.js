
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// USER REGISTRATION
const register = async (req, res) => {
    try {
        const { name, role, email, password, department } = req.body;

        // Validate required fields
        if (!name || !role || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Only faculty and students can register publicly
        if (!["faculty", "student"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Check whether email already exists
        const [existingUser] = await db.query(
            "SELECT userId FROM Users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.query(
            `INSERT INTO Users (name, role, email, password, department)
             VALUES (?, ?, ?, ?, ?)`,
            [
                name.trim(),
                role,
                email.trim().toLowerCase(),
                hashedPassword,
                department || null
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Registration Error:", error.message);

        res.status(500).json({
            message: "Registration failed"
        });
    }
};

// USER LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        // Find user by email
        const [users] = await db.query(
            "SELECT * FROM Users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check account status
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.userId,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
};

// Export both functions
module.exports = { register, login };
