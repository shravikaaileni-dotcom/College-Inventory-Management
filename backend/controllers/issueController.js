
const db = require("../config/db");

// ISSUE ITEM
const issueItem = async (req, res) => {
    let connection;

    try {
        const { itemId, issuedTo, issueDate } = req.body;
        const issuedBy = req.user.userId;

        if (!itemId || !issuedTo || !issueDate) {
            return res.status(400).json({
                message: "Item ID, user ID and issue date are required"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [items] = await connection.query(
            `SELECT itemId, name, availableQuantity
             FROM Items
             WHERE itemId = ? AND status = 'active'
             FOR UPDATE`,
            [itemId]
        );

        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Active item not found"
            });
        }

        if (items[0].availableQuantity <= 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Item is currently out of stock"
            });
        }

        const [users] = await connection.query(
            `SELECT userId FROM Users
             WHERE userId = ? AND status = 'active'`,
            [issuedTo]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Active user not found"
            });
        }

        const [result] = await connection.query(
            `INSERT INTO IssueRecords
             (itemId, issuedTo, issuedBy, issueDate, status)
             VALUES (?, ?, ?, ?, 'issued')`,
            [itemId, issuedTo, issuedBy, issueDate]
        );

        await connection.query(
            `UPDATE Items
             SET availableQuantity = availableQuantity - 1
             WHERE itemId = ?`,
            [itemId]
        );

        await connection.commit();

        res.status(201).json({
            message: "Item issued successfully",
            issueId: result.insertId,
            item: items[0].name,
            issuedTo,
            issuedBy
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Issue Item Error:", error.message);
        res.status(500).json({
            message: "Failed to issue item"
        });

    } finally {
        if (connection) connection.release();
    }
};


// RETURN ITEM
const returnItem = async (req, res) => {
    let connection;

    try {
        const { issueId, returnDate } = req.body;

        if (!issueId) {
            return res.status(400).json({
                message: "Issue ID is required"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [records] = await connection.query(
            `SELECT issueId, itemId, status
             FROM IssueRecords
             WHERE issueId = ?
             FOR UPDATE`,
            [issueId]
        );

        if (records.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Issue record not found"
            });
        }

        if (records[0].status === "returned") {
            await connection.rollback();
            return res.status(400).json({
                message: "Item has already been returned"
            });
        }

        await connection.query(
            `UPDATE IssueRecords
             SET status = 'returned',
                 returnDate = COALESCE(?, CURDATE())
             WHERE issueId = ?`,
            [returnDate || null, issueId]
        );

        await connection.query(
            `UPDATE Items
             SET availableQuantity = availableQuantity + 1
             WHERE itemId = ?`,
            [records[0].itemId]
        );

        await connection.commit();

        res.status(200).json({
            message: "Item returned successfully",
            issueId,
            itemId: records[0].itemId,
            status: "returned"
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Return Item Error:", error.message);
        res.status(500).json({
            message: "Failed to return item"
        });

    } finally {
        if (connection) connection.release();
    }
};


// GET ALL ISSUE RECORDS (ADMIN)
const getAllIssueRecords = async (req, res) => {
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
             JOIN Items i ON ir.itemId = i.itemId
             JOIN Users u ON ir.issuedTo = u.userId
             JOIN Users admin ON ir.issuedBy = admin.userId
             ORDER BY ir.issueId DESC`
        );

        res.status(200).json({
            count: records.length,
            records
        });

    } catch (error) {
        console.error("Get All Issue Records Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch issue records"
        });
    }
};


// GET LOGGED-IN USER'S ISSUE HISTORY
const getMyIssueHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [records] = await db.query(
            `SELECT
                ir.issueId,
                ir.itemId,
                i.name AS itemName,
                ir.issuedTo,
                ir.issuedBy,
                admin.name AS issuedByName,
                ir.issueDate,
                ir.returnDate,
                ir.status
             FROM IssueRecords ir
             JOIN Items i ON ir.itemId = i.itemId
             JOIN Users admin ON ir.issuedBy = admin.userId
             WHERE ir.issuedTo = ?
             ORDER BY ir.issueId DESC`,
            [userId]
        );

        res.status(200).json({
            count: records.length,
            records
        });

    } catch (error) {
        console.error("Get User Issue History Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch your issue history"
        });
    }
};


// EXPORT FUNCTIONS
module.exports = {
    issueItem,
    returnItem,
    getAllIssueRecords,
    getMyIssueHistory
};
