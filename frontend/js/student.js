// STUDENT DASHBOARD

document.addEventListener("DOMContentLoaded", function () {

    const dateElement = document.getElementById("studentCurrentDate");

    if (!dateElement) return;

    dateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

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

    document.getElementById("studentAvailable").textContent = available;
    document.getElementById("studentIssued").textContent = activeIssues.length;
    document.getElementById("studentLowStock").textContent = lowStock;

});
// STUDENT MY ISSUED ITEMS PAGE

document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.getElementById("studentItemsTableBody");

    if (!tableBody) return;

    const searchInput = document.getElementById("studentItemsSearch");
    const emptyMessage = document.getElementById("studentItemsEmptyMessage");

    const issues = JSON.parse(localStorage.getItem("campusIssues")) || [];

    function displayStudentItems() {

        const searchText = searchInput.value.toLowerCase();

        // Email-based filtering will be added after backend authentication.
        const filteredIssues = issues.filter(issue =>
            String(issue.itemName || "").toLowerCase().includes(searchText)
        );

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
                issue.quantity,
                issue.issueDate,
                issue.returnDate,
                issue.status
            ];

            values.forEach((value, index) => {

                const cell = document.createElement("td");
                cell.textContent = value ?? "";

                if (index === 4) {
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

    searchInput.addEventListener("input", displayStudentItems);

    displayStudentItems();
});