
// ==========================================
// CAMPUSSTOCK - API CONNECTION
// ==========================================

// Backend API URL
const API_BASE_URL = "http://localhost:5000/api";

// Send API requests
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("campusToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    // Attach JWT token for protected APIs
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || data.error || "API request failed");
        }

        return data;

    } catch (error) {
        console.error("CampusStock API Error:", error.message);
        throw error;
    }
}

// ==========================================
// AUTHENTICATION API FUNCTIONS
// ==========================================

// Register user
async function registerUser(userData) {
    return await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}

// Login user
async function loginUser(email, password) {
    const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    // Save JWT and user information
    if (result.token) {
        localStorage.setItem("campusToken", result.token);
    }

    if (result.user) {
        localStorage.setItem("campusUser", JSON.stringify(result.user));
    }

    return result;
}

// Logout user
function logoutUser() {
    localStorage.removeItem("campusToken");
    localStorage.removeItem("campusUser");

    window.location.href = "../login.html";
}

// Get currently logged-in user
function getCurrentUser() {
    const user = localStorage.getItem("campusUser");

    return user ? JSON.parse(user) : null;
}

// ==========================================
// INVENTORY API FUNCTIONS
// ==========================================

// Get all inventory items
async function getAllItems() {
    return await apiRequest("/items");
}

// Get item by ID
async function getItemById(id) {
    return await apiRequest(`/items/${id}`);
}

// Add new item
async function addInventoryItem(itemData) {
    return await apiRequest("/items", {
        method: "POST",
        body: JSON.stringify(itemData)
    });
}

// Update item
async function updateInventoryItem(id, itemData) {
    return await apiRequest(`/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(itemData)
    });
}

// Deactivate item
async function deactivateInventoryItem(id) {
    return await apiRequest(`/items/${id}`, {
        method: "DELETE"
    });
}

// Get low-stock items
async function getLowStockItems() {
    return await apiRequest("/items/low-stock");
}
