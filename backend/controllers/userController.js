
const db = require("../config/db");

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT userId, name, role, email, department, status
             FROM Users
             ORDER BY userId DESC`
        );

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get Users Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT userId, name, role, email, department, status
             FROM Users
             WHERE userId = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(users[0]);

    } catch (error) {
        console.error("Get User Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch user"
        });
    }
};

// UPDATE USER
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, email, department } = req.body;

        const validRoles = ["admin", "faculty", "student"];

        if (!name || !email || !role || !validRoles.includes(role)) {
            return res.status(400).json({
                message: "Valid name, email and role are required"
            });
        }

        const [result] = await db.query(
            `UPDATE Users
             SET name = ?, role = ?, email = ?, department = ?
             WHERE userId = ?`,
            [name, role, email, department || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully"
        });

    } catch (error) {
        console.error("Update User Error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                message: "Status must be active or inactive"
            });
        }

        const [result] = await db.query(
            `UPDATE Users
             SET status = ?
             WHERE userId = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: `User ${status} successfully`
        });

    } catch (error) {
        console.error("User Status Error:", error.message);
        res.status(500).json({
            message: "Failed to update user status"
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus
};
