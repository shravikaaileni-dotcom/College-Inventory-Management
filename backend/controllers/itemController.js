
const db = require("../config/db");

// ADD ITEM (ADMIN)
const addItem = async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            purchaseDate,
            itemCondition,
            threshold
        } = req.body;

        if (!name || !category || quantity === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Valid name, category and quantity are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO Items
            (name, category, quantity, availableQuantity,
             purchaseDate, itemCondition, threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                category,
                Number(quantity),
                Number(quantity),
                purchaseDate || null,
                itemCondition || null,
                threshold === undefined ? 5 : threshold
            ]
        );

        res.status(201).json({
            message: "Item added successfully",
            itemId: result.insertId
        });

    } catch (error) {
        console.error("Add Item Error:", error.message);
        res.status(500).json({
            message: "Failed to add item"
        });
    }
};


// GET ALL ACTIVE ITEMS
const getAllItems = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT * FROM Items
             WHERE status = 'active'
             ORDER BY itemId DESC`
        );

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Get Items Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch items"
        });
    }
};


// GET ITEM BY ID
const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const [items] = await db.query(
            `SELECT * FROM Items
             WHERE itemId = ? AND status = 'active'`,
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json(items[0]);

    } catch (error) {
        console.error("Get Item Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch item"
        });
    }
};


// UPDATE ITEM (ADMIN)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            category,
            quantity,
            purchaseDate,
            itemCondition,
            threshold
        } = req.body;

        if (!name || !category || quantity === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Valid name, category and quantity are required"
            });
        }

        const [items] = await db.query(
            `SELECT quantity, availableQuantity
             FROM Items
             WHERE itemId = ? AND status = 'active'`,
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const issuedQuantity =
            items[0].quantity - items[0].availableQuantity;

        if (Number(quantity) < issuedQuantity) {
            return res.status(400).json({
                message: "Quantity cannot be less than currently issued stock"
            });
        }

        const availableQuantity =
            Number(quantity) - issuedQuantity;

        await db.query(
            `UPDATE Items
             SET name = ?,
                 category = ?,
                 quantity = ?,
                 availableQuantity = ?,
                 purchaseDate = ?,
                 itemCondition = ?,
                 threshold = ?
             WHERE itemId = ?`,
            [
                name,
                category,
                Number(quantity),
                availableQuantity,
                purchaseDate || null,
                itemCondition || null,
                threshold === undefined ? 5 : threshold,
                id
            ]
        );

        res.status(200).json({
            message: "Item updated successfully",
            availableQuantity
        });

    } catch (error) {
        console.error("Update Item Error:", error.message);
        res.status(500).json({
            message: "Failed to update item"
        });
    }
};


// DEACTIVATE ITEM (ADMIN)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `UPDATE Items
             SET status = 'inactive'
             WHERE itemId = ? AND status = 'active'`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Active item not found"
            });
        }

        res.status(200).json({
            message: "Item deactivated successfully"
        });

    } catch (error) {
        console.error("Delete Item Error:", error.message);
        res.status(500).json({
            message: "Failed to deactivate item"
        });
    }
};


// GET LOW STOCK ITEMS
const getLowStockItems = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT * FROM Items
             WHERE status = 'active'
             AND availableQuantity <= threshold
             ORDER BY availableQuantity ASC`
        );

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Low Stock Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch low stock items"
        });
    }
};


// EXPORT FUNCTIONS
module.exports = {
    addItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    getLowStockItems
};
