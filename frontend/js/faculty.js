
// FACULTY DASHBOARD

document.addEventListener("DOMContentLoaded", function () {

    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    const items = JSON.parse(localStorage.getItem("campusItems")) || [];
    const issues = JSON.parse(localStorage.getItem("campusIssues")) || [];

    const available = items.reduce(
        (total, item) => total + Number(item.quantity || 0), 0
    );

    const lowStock = items.filter(
        item => Number(item.quantity) <= Number(item.minStock)
    ).length;

    const activeIssues = issues.filter(
        issue => issue.status !== "Returned"
    );

    document.getElementById("facultyAvailable").textContent = available;
    document.getElementById("facultyIssued").textContent = activeIssues.length;
    document.getElementById("facultyLowStock").textContent = lowStock;

    const activityTable = document.getElementById("facultyActivityTable");

    if (activityTable) {
        activityTable.innerHTML = "";

        if (items.length === 0) {
            activityTable.innerHTML =
                '<tr><td colspan="4">No inventory items available.</td></tr>';
        } else {
            items.forEach(item => {
                const row = document.createElement("tr");

                const values = [
                    item.itemName,
                    item.category,
                    item.quantity,
                    Number(item.quantity) <= Number(item.minStock)
                        ? "Low Stock"
                        : "Available"
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";
                    row.appendChild(cell);
                });

                activityTable.appendChild(row);
            });
        }
    }
});
// FACULTY INVENTORY PAGE

document.addEventListener("DOMContentLoaded", function () {

    const inventoryTable = document.getElementById("inventoryTableBody");

    // Run only on the Browse Inventory page
    if (!inventoryTable) return;

    const searchInput = document.getElementById("inventorySearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const emptyMessage = document.getElementById("inventoryEmptyMessage");

    const items = JSON.parse(localStorage.getItem("campusItems")) || [];

    // Load categories
    const categories = [...new Set(
        items.map(item => item.category).filter(Boolean)
    )];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    function displayInventory() {

        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredItems = items.filter(item => {

            const matchesSearch =
                String(item.itemName || "").toLowerCase().includes(searchText) ||
                String(item.itemCode || "").toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "" ||
                item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        inventoryTable.innerHTML = "";

        if (filteredItems.length === 0) {
            emptyMessage.style.display = "block";
            return;
        }

        emptyMessage.style.display = "none";

        filteredItems.forEach(item => {

            const row = document.createElement("tr");

            const isLowStock =
                Number(item.quantity) <= Number(item.minStock);

            const values = [
                item.itemName,
                item.itemCode,
                item.category,
                item.quantity,
                item.location,
                isLowStock ? "Low Stock" : "Available"
            ];

            values.forEach((value, index) => {

                const cell = document.createElement("td");
                cell.textContent = value ?? "";

                if (index === 5) {
                    cell.className = isLowStock ? "low-stock" : "available";
                }

                row.appendChild(cell);
            });

            inventoryTable.appendChild(row);
        });
    }

    searchInput.addEventListener("input", displayInventory);
    categoryFilter.addEventListener("change", displayInventory);

    displayInventory();
});
// FACULTY MY ISSUED ITEMS PAGE

document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.getElementById("myItemsTableBody");

    // Run only on My Issued Items page
    if (!tableBody) return;

    const searchInput = document.getElementById("myItemsSearch");
    const emptyMessage = document.getElementById("myItemsEmptyMessage");

    const issues = JSON.parse(localStorage.getItem("campusIssues")) || [];

    function displayMyItems() {

        const searchText = searchInput.value.toLowerCase();

        // Display issue records in the browser.
        // Email-based filtering will be added when login is connected.
        const filteredIssues = issues.filter(issue => {

            const itemName = String(issue.itemName || "").toLowerCase();
            const borrowerName = String(issue.borrowerName || "").toLowerCase();

            return itemName.includes(searchText) ||
                   borrowerName.includes(searchText);
        });

        tableBody.innerHTML = "";

        if (filteredIssues.length === 0) {
            emptyMessage.style.display = "block";
            return;
        }

        emptyMessage.style.display = "none";

        filteredIssues.forEach(issue => {

            const row = document.createElement("tr");

            const values = [
                issue.itemName,
                issue.borrowerName,
                issue.quantity,
                issue.issueDate,
                issue.returnDate,
                issue.status
            ];

            values.forEach((value, index) => {

                const cell = document.createElement("td");
                cell.textContent = value ?? "";

                if (index === 5) {
                    cell.className =
                        issue.status === "Returned"
                        ? "returned-status"
                        : "issued-status";
                }

                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener("input", displayMyItems);

    displayMyItems();
});