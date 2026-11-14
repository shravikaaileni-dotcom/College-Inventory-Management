
const db = require("../config/db");

// GET DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
    try {
        const [totalItems] = await db.query(
            `SELECT COUNT(*) AS totalItems
             FROM Items WHERE status = 'active'`
        );

        const [totalStock] = await db.query(
            `SELECT COALESCE(SUM(quantity), 0) AS totalStock
             FROM Items WHERE status = 'active'`
        );

        const [availableStock] = await db.query(
            `SELECT COALESCE(SUM(availableQuantity), 0) AS availableStock
             FROM Items WHERE status = 'active'`
        );

        const [issuedItems] = await db.query(
            `SELECT COUNT(*) AS totalIssued
             FROM IssueRecords WHERE status = 'issued'`
        );

        const [returnedItems] = await db.query(
            `SELECT COUNT(*) AS totalReturned
             FROM IssueRecords WHERE status = 'returned'`
        );

        const [lowStockItems] = await db.query(
            `SELECT COUNT(*) AS lowStockCount
             FROM Items
             WHERE status = 'active'
             AND availableQuantity <= threshold`
        );

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            dashboard: {
                totalItems: Number(totalItems[0].totalItems),
                totalStock: Number(totalStock[0].totalStock),
                availableStock: Number(availableStock[0].availableStock),
                totalIssued: Number(issuedItems[0].totalIssued),
                totalReturned: Number(returnedItems[0].totalReturned),
                lowStockCount: Number(lowStockItems[0].lowStockCount)
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

// GET CATEGORY-WISE STOCK REPORT
const getCategoryReport = async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT
                category,
                COUNT(*) AS totalItems,
                COALESCE(SUM(quantity), 0) AS totalStock,
                COALESCE(SUM(availableQuantity), 0) AS availableStock
             FROM Items
             WHERE status = 'active'
             GROUP BY category
             ORDER BY category`
        );

        res.status(200).json({
            message: "Category-wise report fetched successfully",
            categories
        });

    } catch (error) {
        console.error("Category Report Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch category report"
        });
    }
};

// GET ISSUE AND RETURN HISTORY REPORT
const getIssueReturnReport = async (req, res) => {
    try {
        const [records] = await db.query(
            `SELECT
                ir.issueId,
                ir.itemId,
                i.name AS itemName,
                ir.issuedTo,
                u.name AS issuedToName,
                ir.issuedBy,
                admin.name AS issuedByName,
                ir.issueDate,
                ir.returnDate,
                ir.status
             FROM IssueRecords ir
             INNER JOIN Items i ON ir.itemId = i.itemId
             INNER JOIN Users u ON ir.issuedTo = u.userId
             INNER JOIN Users admin ON ir.issuedBy = admin.userId
             ORDER BY ir.issueId DESC`
        );

        res.status(200).json({
            message: "Issue and return report fetched successfully",
            count: records.length,
            records
        });

    } catch (error) {
        console.error("Issue Return Report Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch issue and return report"
        });
    }
};

// GET LOW STOCK REPORT
const getLowStockReport = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT
                itemId,
                name,
                category,
                quantity,
                availableQuantity,
                threshold,
                CASE
                    WHEN availableQuantity = 0 THEN 'Out of Stock'
                    ELSE 'Low Stock'
                END AS stockStatus
             FROM Items
             WHERE status = 'active'
             AND availableQuantity <= threshold
             ORDER BY availableQuantity ASC`
        );

        res.status(200).json({
            message: "Low stock report fetched successfully",
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Low Stock Report Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch low stock report"
        });
    }
};

module.exports = {
    getDashboardStats,
    getCategoryReport,
    getIssueReturnReport,
    getLowStockReport
};
