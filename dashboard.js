// Get the admin token
const token = sessionStorage.getItem("adminToken");

// Redirect to login if there is no token
if (!token) {
    window.location.href = "admin.html";
}

// Get dashboard elements
const totalOrders = document.querySelector("#total-orders");
const pendingOrders = document.querySelector("#pending-orders");
const completedOrders = document.querySelector("#completed-orders");
const ordersTable = document.querySelector("#orders-table");
const logoutBtn = document.querySelector("#logout-btn");
const statusMessage = document.querySelector("#status-message");

const deleteModal = document.querySelector("#delete-modal");
const cancelDelete = document.querySelector("#cancel-delete");
const confirmDelete = document.querySelector("#confirm-delete");

let selectedOrderId = null;
// Fetch customer orders
async function fetchOrders() {

    try {
        const response = await fetch("http://localhost:5000/api/admin/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("adminToken");
            window.location.href = "admin.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch orders.");
        }

        const orders = await response.json();

        // Update statistics
        totalOrders.textContent = orders.length;

        pendingOrders.textContent = orders.filter(
            order => order.status === "Pending"
        ).length;

        completedOrders.textContent = orders.filter(
            order => order.status === "Delivered"
        ).length;

        // Display orders
        displayOrders(orders);

    } catch (error) {
        console.error("Error fetching orders:", error);

        ordersTable.innerHTML = `
            <tr>
                <td colspan="8">Unable to load orders. Please try again.</td>
            </tr>
        `;
    }
}

// Display customer orders
function displayOrders(orders) {

    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="8">No orders received yet.</td>
            </tr>
        `;
        return;
    }

    ordersTable.innerHTML = orders.map(order => {

        const products = order.items.map(item =>
            `${item.name} (${item.quantity})`
        ).join(", ");

        return `
            <tr>
                <td>#${order.id}</td>
                <td>${escapeHTML(order.customer_name)}</td>
                <td>${escapeHTML(order.customer_phone)}</td>
                <td>${escapeHTML(order.customer_location)}</td>
                <td>${escapeHTML(products)}</td>
                <td>KSh ${Number(order.total).toLocaleString()}</td>
                <td>
    <select class="status-select status-${order.status.toLowerCase()}" data-order-id="${order.id}">
        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
    </select>
</td>
<td>
    <a
        class="whatsapp-btn"
        href="https://wa.me/${formatPhone(order.customer_phone)}?text=${encodeURIComponent(
            `Hello ${order.customer_name}, this is NOURA regarding your order #${order.id}. We would like to discuss your order with you.`
        )}"
        target="_blank"
        rel="noopener noreferrer"
    >
        WhatsApp
    </a>

    ${
        order.status === "Delivered"
            ? `<button class="delete-order-btn" data-order-id="${order.id}">
                Delete
               </button>`
            : ""
    }
</td>
            </tr>
        `;

    }).join("");
}
// Update order status
ordersTable.addEventListener("change", async function (event) {

    if (!event.target.classList.contains("status-select")) {
        return;
    }

    const orderId = event.target.dataset.orderId;
    const status = event.target.value;

    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        statusMessage.textContent = "Order status updated successfully!";
statusMessage.style.color = "green";

setTimeout(() => {
    statusMessage.textContent = "";
}, 3000);

        fetchOrders();

    } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.style.color = "red";
        fetchOrders();
    }
});
// Delete delivered orders
// Open delete confirmation modal
ordersTable.addEventListener("click", function (event) {

    if (!event.target.classList.contains("delete-order-btn")) {
        return;
    }

    selectedOrderId = event.target.dataset.orderId;

    deleteModal.style.display = "flex";
});

// Cancel deletion
cancelDelete.addEventListener("click", function () {
    deleteModal.style.display = "none";
    selectedOrderId = null;
});

// Confirm deletion
confirmDelete.addEventListener("click", async function () {

    if (!selectedOrderId) return;

    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/orders/${selectedOrderId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        deleteModal.style.display = "none";
        selectedOrderId = null;

        statusMessage.textContent = "Order deleted successfully!";
        statusMessage.style.color = "green";

        fetchOrders();

    } catch (error) {
        deleteModal.style.display = "none";
        statusMessage.textContent = error.message;
        statusMessage.style.color = "red";
    }
});

// Prevent customer data from being interpreted as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}
// Format Kenyan phone numbers for WhatsApp
function formatPhone(phone) {
    let number = String(phone).replace(/\D/g, "");

    if (number.startsWith("0")) {
        number = "254" + number.slice(1);
    }

    return number;
}

// Logout
logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem("adminToken");
    window.location.href = "admin.html";
});

// Load orders when dashboard opens
fetchOrders();