
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

// MIDDLEWARE
const {
    authenticateToken,
    authorizeRoles
} = require("./middleware/authMiddleware");

const app = express();

// GENERAL MIDDLEWARE
app.use(cors());
app.use(express.json());

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("College Inventory Management Backend Running Successfully!");
});

// DATABASE TEST ROUTE
app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS databaseName"
        );

        res.json({
            message: "Database connected successfully!",
            database: rows[0].databaseName
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// AUTHENTICATION ROUTES
app.use("/api/auth", authRoutes);

// INVENTORY AND ISSUE ROUTES
app.use("/api/items", itemRoutes);

// DASHBOARD AND REPORT ROUTES
app.use("/api/reports", reportRoutes);

// USER MANAGEMENT ROUTES
app.use("/api/users", userRoutes);

// PROTECTED TEST ROUTE
app.get(
    "/api/protected",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Access granted! Token verified successfully.",
            user: req.user
        });
    }
);

// ADMIN ONLY TEST ROUTE
app.get(
    "/api/admin",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin! Access granted."
        });
    }
);

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
