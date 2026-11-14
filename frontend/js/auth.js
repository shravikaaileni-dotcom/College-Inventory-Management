
// ==========================================
// CAMPUSSTOCK - AUTHENTICATION
// ==========================================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// ==========================================
// LOGIN
// ==========================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!email || !password || !role) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const result = await loginUser(email, password);

            if (!result.token || !result.user) {
                alert("Login response is missing user or token information. Please contact the backend developer.");
                return;
            }

            // Verify that the selected role matches the account role
            if (result.user.role.toLowerCase() !== role.toLowerCase()) {
                localStorage.removeItem("campusToken");
                localStorage.removeItem("campusUser");

                alert("Selected role does not match your account role.");
                return;
            }

            alert("Login successful!");

            // Redirect according to the authenticated role
            const userRole = result.user.role.toLowerCase();

            if (userRole === "admin") {
                window.location.href = "admin/dashboard.html";
            } else if (userRole === "faculty") {
                window.location.href = "faculty/dashboard.html";
            } else if (userRole === "student") {
                window.location.href = "student/dashboard.html";
            } else {
                alert("Unknown user role.");
            }

        } catch (error) {
            alert(error.message || "Login failed. Please try again.");
        }
    });
}

// ==========================================
// REGISTRATION
// ==========================================

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("regRole").value;
        const department = document.getElementById("department").value.trim();

        if (!name || !email || !password || !confirmPassword || !role || !department) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!["faculty", "student"].includes(role.toLowerCase())) {
            alert("Only Faculty and Student registration is allowed.");
            return;
        }

        try {
            await registerUser({
                name,
                role: role.toLowerCase(),
                email,
                password,
                department
            });

            alert("Registration successful! Please log in.");

            window.location.href = "login.html";

        } catch (error) {
            alert(error.message || "Registration failed. Please try again.");
        }
    });
}
