
// ==========================================
// 1. DASHBOARD DATE
// ==========================================

const dateElement = document.getElementById("currentDate");

if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// ==========================================
// 2. INVENTORY CHART
// ==========================================

const chartElement = document.getElementById("inventoryChart");

if (chartElement && typeof Chart !== "undefined") {
    new Chart(chartElement, {
        type: "doughnut",

        data: {
            labels: ["Available", "Issued", "Low Stock"],

            datasets: [{
                data: [890, 320, 40],
                backgroundColor: [
                    "#168b8b",
                    "#f59e0b",
                    "#dc3545"
                ],
                borderWidth: 0,
                hoverOffset: 7
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            cutout: "68%"
        }
    });
}


// ==========================================
// 3. ADD NEW ITEM FUNCTIONALITY
// ==========================================

const addItemForm = document.getElementById("addItemForm");

if (addItemForm) {

    addItemForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const message = document.getElementById("formMessage");

        const item = {
            name: document.getElementById("itemName").value.trim(),
            code: document.getElementById("itemCode").value.trim(),
            category: document.getElementById("category").value,
            quantity: Number(document.getElementById("quantity").value),
            location: document.getElementById("location").value.trim(),
            minStock: Number(document.getElementById("minStock").value),
            purchaseDate: document.getElementById("purchaseDate").value,
            description: document.getElementById("description").value.trim()
        };

        // Validate item details

        if (
            !item.name ||
            !item.code ||
            !item.category ||
            !item.location ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0 ||
            !Number.isInteger(item.minStock) ||
            item.minStock < 0
        ) {
            message.textContent = "Please enter all required details correctly.";
            message.style.color = "#dc3545";
            return;
        }

        try {

            // Get previously saved items

            const items = JSON.parse(
                localStorage.getItem("campusItems") || "[]"
            );

            // Check duplicate item code

            const duplicate = items.some(function (existing) {
                return existing.code.toLowerCase() === item.code.toLowerCase();
            });

            if (duplicate) {
                message.textContent = "This item code already exists!";
                message.style.color = "#dc3545";
                return;
            }

            // Save new item

            items.push(item);

            localStorage.setItem(
                "campusItems",
                JSON.stringify(items)
            );

            // Display success message

            message.textContent = "Item added successfully!";
            message.style.color = "#168b5b";

            // Clear form

            addItemForm.reset();

        } catch (error) {

            console.error("Error saving item:", error);

            message.textContent = "Unable to save item. Please try again.";
            message.style.color = "#dc3545";

        }

    });

}


// ==========================================
// 4. MANAGE ITEMS FUNCTIONALITY
// ==========================================

const itemsTableBody = document.getElementById("itemsTableBody");

if (itemsTableBody) {

    const searchInput = document.getElementById("searchItem");
    const categoryFilter = document.getElementById("categoryFilter");
    const itemCount = document.getElementById("itemCount");
    const emptyMessage = document.getElementById("emptyMessage");

    function displayItems() {

        const items = JSON.parse(
            localStorage.getItem("campusItems") || "[]"
        );

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        const filteredItems = items.filter(function (item) {

            const matchesSearch =
                item.name.toLowerCase().includes(searchText) ||
                item.code.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "" ||
                item.category === selectedCategory;

            return matchesSearch && matchesCategory;

        });

        // Clear previous table rows

        itemsTableBody.innerHTML = "";

        itemCount.textContent = filteredItems.length + " Items";

        emptyMessage.hidden = filteredItems.length !== 0;

        // Display items

        filteredItems.forEach(function (item) {

            const isLowStock =
                Number(item.quantity) <= Number(item.minStock);

            const row = document.createElement("tr");

            const values = [
                item.name,
                item.code,
                item.category,
                item.quantity,
                item.location
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value ?? "";

                row.appendChild(cell);

            });

            // Stock status

            const statusCell = document.createElement("td");

            const status = document.createElement("span");

            status.className = isLowStock
                ? "status-badge status-low"
                : "status-badge status-available";

            status.textContent = isLowStock
                ? "Low Stock"
                : "Available";

            statusCell.appendChild(status);

            row.appendChild(statusCell);

            // Delete button

            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";

            deleteButton.className = "delete-item-btn";

            deleteButton.type = "button";

            deleteButton.addEventListener("click", function () {

                const confirmed = confirm(
                    "Are you sure you want to delete " + item.name + "?"
                );

                if (confirmed) {
                    deleteItem(item.code);
                }

            });

            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);

            itemsTableBody.appendChild(row);

        });

    }


    // Delete item

    function deleteItem(itemCode) {

        const items = JSON.parse(
            localStorage.getItem("campusItems") || "[]"
        );

        const updatedItems = items.filter(function (item) {

            return item.code !== itemCode;

        });

        localStorage.setItem(
            "campusItems",
            JSON.stringify(updatedItems)
        );

        displayItems();

    }


    // Search items

    searchInput.addEventListener("input", displayItems);


    // Filter items

    categoryFilter.addEventListener("change", displayItems);


    // Load items when page opens

    displayItems();

}
// ==========================================
// 5. ISSUE AND RETURN FUNCTIONALITY
// ==========================================

const issueItemForm = document.getElementById("issueItemForm");

if (issueItemForm) {

    const issueItemSelect = document.getElementById("issueItem");
    const issueQuantityInput = document.getElementById("issueQuantity");
    const issueDateInput = document.getElementById("issueDate");
    const returnDateInput = document.getElementById("returnDate");

    const issueTableBody = document.getElementById("issueTableBody");
    const issueEmptyMessage = document.getElementById("issueEmptyMessage");
    const issueMessage = document.getElementById("issueMessage");


    // Get saved inventory items

    function getInventoryItems() {
        return JSON.parse(
            localStorage.getItem("campusItems") || "[]"
        );
    }


    // Get issue records

    function getIssueRecords() {
        return JSON.parse(
            localStorage.getItem("campusIssues") || "[]"
        );
    }


    // Set today's date

    const today = new Date().toISOString().split("T")[0];

    issueDateInput.value = today;
    issueDateInput.min = today;

    returnDateInput.min = today;


    // Load inventory items into dropdown

    function loadInventoryDropdown() {

        const items = getInventoryItems();

        issueItemSelect.innerHTML =
            '<option value="">Select inventory item</option>';

        items.forEach(function (item) {

            const quantity = Number(item.quantity);

            if (quantity > 0) {

                const option = document.createElement("option");

                option.value = item.code;

                option.textContent =
                    item.name + " (" + quantity + " available)";

                issueItemSelect.appendChild(option);

            }

        });

    }


    // Issue an item

    issueItemForm.addEventListener("submit", function (event) {

        event.preventDefault();

        try {

            const borrowerName =
                document.getElementById("borrowerName").value.trim();

            const borrowerEmail =
                document.getElementById("borrowerEmail").value.trim();

            const borrowerRole =
                document.getElementById("borrowerRole").value;

            const itemCode = issueItemSelect.value;

            const quantity = Number(issueQuantityInput.value);

            const issueDate = issueDateInput.value;

            const expectedReturnDate = returnDateInput.value;


            if (!itemCode || !borrowerName || !borrowerEmail ||
                !borrowerRole || !issueDate || !expectedReturnDate) {

                issueMessage.textContent =
                    "Please complete all required fields.";

                issueMessage.style.color = "#dc3545";

                return;

            }


            if (!Number.isInteger(quantity) || quantity <= 0) {

                issueMessage.textContent =
                    "Please enter a valid quantity.";

                issueMessage.style.color = "#dc3545";

                return;

            }


            if (expectedReturnDate < issueDate) {

                issueMessage.textContent =
                    "Return date cannot be before issue date.";

                issueMessage.style.color = "#dc3545";

                return;

            }


            const items = getInventoryItems();

            const itemIndex = items.findIndex(function (item) {
                return item.code === itemCode;
            });


            if (itemIndex === -1) {

                issueMessage.textContent =
                    "Selected inventory item was not found.";

                issueMessage.style.color = "#dc3545";

                return;

            }


            const selectedItem = items[itemIndex];


            if (quantity > Number(selectedItem.quantity)) {

                issueMessage.textContent =
                    "Not enough stock available! Available quantity: " +
                    selectedItem.quantity;

                issueMessage.style.color = "#dc3545";

                return;

            }


            // Reduce available quantity

            selectedItem.quantity =
                Number(selectedItem.quantity) - quantity;


            // Create issue record

            const issues = getIssueRecords();

            const newIssue = {

                id: Date.now(),

                borrowerName: borrowerName,

                borrowerEmail: borrowerEmail,

                borrowerRole: borrowerRole,

                itemCode: selectedItem.code,

                itemName: selectedItem.name,

                quantity: quantity,

                issueDate: issueDate,

                expectedReturnDate: expectedReturnDate,

                status: "Issued"

            };


            issues.push(newIssue);


            // Save updated inventory and issue history

            localStorage.setItem(
                "campusItems",
                JSON.stringify(items)
            );

            localStorage.setItem(
                "campusIssues",
                JSON.stringify(issues)
            );


            issueMessage.textContent =
                "Item issued successfully!";

            issueMessage.style.color = "#168b5b";


            issueItemForm.reset();

            issueDateInput.value = today;
            issueDateInput.min = today;
            returnDateInput.min = today;

            loadInventoryDropdown();

            displayIssueRecords();

        } catch (error) {

            console.error("Issue error:", error);

            issueMessage.textContent =
                "Unable to issue item. Please try again.";

            issueMessage.style.color = "#dc3545";

        }

    });


    // Display issue history

    function displayIssueRecords() {

        const issues = getIssueRecords();

        issueTableBody.innerHTML = "";

        issueEmptyMessage.hidden = issues.length !== 0;


        issues.forEach(function (issue) {

            const row = document.createElement("tr");


            const borrowerCell = document.createElement("td");

            borrowerCell.textContent =
                issue.borrowerName + " (" + issue.borrowerRole + ")";

            row.appendChild(borrowerCell);


            const itemCell = document.createElement("td");

            itemCell.textContent = issue.itemName;

            row.appendChild(itemCell);


            const quantityCell = document.createElement("td");

            quantityCell.textContent = issue.quantity;

            row.appendChild(quantityCell);


            const issueDateCell = document.createElement("td");

            issueDateCell.textContent = issue.issueDate;

            row.appendChild(issueDateCell);


            const returnDateCell = document.createElement("td");

            returnDateCell.textContent = issue.expectedReturnDate;

            row.appendChild(returnDateCell);


            // Status

            const statusCell = document.createElement("td");

            const statusBadge = document.createElement("span");

            if (issue.status === "Returned") {

                statusBadge.className = "returned-status";

                statusBadge.textContent = "Returned";

            } else {

                statusBadge.className = "issued-status";

                statusBadge.textContent = "Issued";

            }

            statusCell.appendChild(statusBadge);

            row.appendChild(statusCell);


            // Return button

            const actionCell = document.createElement("td");

            if (issue.status === "Issued") {

                const returnButton = document.createElement("button");

                returnButton.type = "button";

                returnButton.textContent = "Return Item";

                returnButton.className = "return-item-btn";

                returnButton.addEventListener("click", function () {

                    returnIssuedItem(issue.id);

                });

                actionCell.appendChild(returnButton);

            } else {

                actionCell.textContent = "Completed";

            }

            row.appendChild(actionCell);

            issueTableBody.appendChild(row);

        });

    }


    // Return an issued item

    function returnIssuedItem(issueId) {

        const confirmed = confirm(
            "Are you sure you want to mark this item as returned?"
        );

        if (!confirmed) {
            return;
        }


        const issues = getIssueRecords();

        const issueIndex = issues.findIndex(function (record) {

            return record.id === issueId;

        });


        if (issueIndex === -1 ||
            issues[issueIndex].status === "Returned") {

            return;

        }


        const items = getInventoryItems();

        const itemIndex = items.findIndex(function (item) {

            return item.code === issues[issueIndex].itemCode;

        });


        if (itemIndex === -1) {

            alert("Inventory item not found. Return was not recorded.");

            return;

        }


        // Increase available stock

        items[itemIndex].quantity =
            Number(items[itemIndex].quantity) +
            Number(issues[issueIndex].quantity);


        // Update issue status

        issues[issueIndex].status = "Returned";

        issues[issueIndex].returnedDate =
            new Date().toISOString().split("T")[0];


        // Save changes

        localStorage.setItem(
            "campusItems",
            JSON.stringify(items)
        );

        localStorage.setItem(
            "campusIssues",
            JSON.stringify(issues)
        );


        alert("Item returned successfully!");

        loadInventoryDropdown();

        displayIssueRecords();

    }


    // Initial page loading

    loadInventoryDropdown();

    displayIssueRecords();

}
// ==========================================
// 6. REPORTS PAGE FUNCTIONALITY
// ==========================================

const reportTotalItems = document.getElementById("reportTotalItems");

if (reportTotalItems) {

    const reportAvailable = document.getElementById("reportAvailable");
    const reportIssued = document.getElementById("reportIssued");
    const reportLowStock = document.getElementById("reportLowStock");

    const totalIssueRecords = document.getElementById("totalIssueRecords");
    const activeIssueRecords = document.getElementById("activeIssueRecords");
    const returnedIssueRecords = document.getElementById("returnedIssueRecords");

    const lowStockTableBody = document.getElementById("lowStockTableBody");
    const lowStockEmpty = document.getElementById("lowStockEmpty");

    const downloadReport = document.getElementById("downloadReport");

    let categoryChart = null;


    function generateInventoryReport() {

        const items = JSON.parse(
            localStorage.getItem("campusItems") || "[]"
        );

        const issues = JSON.parse(
            localStorage.getItem("campusIssues") || "[]"
        );


        // Calculate inventory statistics

        const totalTypes = items.length;

        const availableQuantity = items.reduce(function (total, item) {
            return total + Number(item.quantity);
        }, 0);

        const issuedQuantity = issues.reduce(function (total, issue) {

            if (issue.status === "Issued") {
                return total + Number(issue.quantity);
            }

            return total;

        }, 0);

        const lowStockItems = items.filter(function (item) {

            return Number(item.quantity) <= Number(item.minStock);

        });


        // Display summary cards

        reportTotalItems.textContent = totalTypes;

        reportAvailable.textContent = availableQuantity;

        reportIssued.textContent = issuedQuantity;

        reportLowStock.textContent = lowStockItems.length;


        // Transaction summary

        totalIssueRecords.textContent = issues.length;

        activeIssueRecords.textContent = issues.filter(function (issue) {
            return issue.status === "Issued";
        }).length;

        returnedIssueRecords.textContent = issues.filter(function (issue) {
            return issue.status === "Returned";
        }).length;


        // Display low-stock items

        lowStockTableBody.innerHTML = "";

        lowStockEmpty.hidden = lowStockItems.length !== 0;

        lowStockItems.forEach(function (item) {

            const row = document.createElement("tr");

            [
                item.name,
                item.code,
                item.quantity,
                item.minStock
            ].forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            const statusCell = document.createElement("td");

            const badge = document.createElement("span");

            badge.className = "status-badge status-low";

            badge.textContent = "Low Stock";

            statusCell.appendChild(badge);

            row.appendChild(statusCell);

            lowStockTableBody.appendChild(row);

        });


        // Prepare category chart data

        const categoryCounts = {};

        items.forEach(function (item) {

            const category = item.category || "Other";

            categoryCounts[category] =
                (categoryCounts[category] || 0) + 1;

        });


        const chartElement = document.getElementById("reportCategoryChart");

        if (chartElement && typeof Chart !== "undefined") {

            if (categoryChart) {
                categoryChart.destroy();
            }

            categoryChart = new Chart(chartElement, {

                type: "doughnut",

                data: {

                    labels: Object.keys(categoryCounts),

                    datasets: [{

                        data: Object.values(categoryCounts),

                        backgroundColor: [
                            "#168b8b",
                            "#f59e0b",
                            "#5478a5",
                            "#dc3545",
                            "#8064a2",
                            "#45a56a"
                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            });

        }

    }


    // Download inventory report as CSV

    downloadReport.addEventListener("click", function () {

        const items = JSON.parse(
            localStorage.getItem("campusItems") || "[]"
        );

        const headers = [
            "Item Name",
            "Item Code",
            "Category",
            "Available Quantity",
            "Minimum Stock",
            "Location",
            "Status"
        ];

        const rows = items.map(function (item) {

            const status =
                Number(item.quantity) <= Number(item.minStock)
                    ? "Low Stock"
                    : "Available";

            return [
                item.name,
                item.code,
                item.category,
                item.quantity,
                item.minStock,
                item.location,
                status
            ];

        });

        const escapeCSV = function (value) {

            return '"' + String(value ?? "").replace(/"/g, '""') + '"';

        };

        const csvContent = [
            headers,
            ...rows
        ].map(function (row) {

            return row.map(escapeCSV).join(",");

        }).join("\n");


        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "CampusStock_Inventory_Report.csv";

        link.click();

        URL.revokeObjectURL(url);

    });


    // Generate report when page opens

    generateInventoryReport();

}