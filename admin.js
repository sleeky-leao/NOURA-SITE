const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const password = document.querySelector("#admin-password").value;

    try {
        const response = await fetch("https://noura-backend-7e1g.onrender.com/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // Save the authentication token
sessionStorage.setItem("adminToken", data.token);

// Redirect to the dashboard
window.location.href = "dashboard.html";

    } catch (error) {

        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";

    }

});