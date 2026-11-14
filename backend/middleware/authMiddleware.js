
const jwt = require("jsonwebtoken");

// VERIFY JWT TOKEN
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Token required."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store user details in request
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// ROLE-BASED AUTHORIZATION
const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Please authenticate first"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
