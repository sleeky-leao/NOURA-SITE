require("dotenv").config();
const pool = require("./db");
const products = require("./products");
// Import Express
const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
// Create an Express application
const app = express();
// Allow our frontend to communicate with the backend
app.use(express.json());
const cors = require("cors");

const allowedOrigins = [
    "https://sleeky-leao.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: "draft-8",
    legacyHeaders: false
});

// Define our server port
const PORT = process.env.PORT || 5000;
// Create our first route
app.get("/", (req, res) => {
    res.send("NOURA Backend is running!");
});
// Test Neon database connection
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "NOURA database connected successfully!",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});
// Receive customer orders
app.post("/api/orders",loginLimiter, async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            customerLocation,
            items
        } = req.body;

        // Validate customer information
        if (
    typeof customerName !== "string" ||
    !customerName.trim() ||
    customerName.trim().length > 100 ||

    typeof customerPhone !== "string" ||
    !customerPhone.trim() ||
    customerPhone.trim().length > 20 ||

    typeof customerLocation !== "string" ||
    !customerLocation.trim() ||
    customerLocation.trim().length > 500 ||

    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 50
) {
            return res.status(400).json({
                message: "Please provide valid customer information and order items."
            });
        }

        // Validate products and quantities using our official catalogue
        const verifiedItems = [];

        for (const item of items) {

            const product = products[item.name];

            const quantity = Number(item.quantity);
            if (!item || typeof item !== "object" || Array.isArray(item)) {
    return res.status(400).json({
        message: "Invalid order item."
    });
}

            if (
                !product ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 100
            ) {
                return res.status(400).json({
                    message: "Invalid product or quantity."
                });
            }

            verifiedItems.push({
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        // Calculate the total using trusted backend prices
        const total = verifiedItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Save the verified order in Neon
        const result = await pool.query(
            `INSERT INTO orders
            (customer_name, customer_phone, customer_location, items, total)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                customerName.trim(),
                customerPhone.trim(),
                customerLocation.trim(),
                JSON.stringify(verifiedItems),
                total
            ]
        );

        res.status(201).json({
            message: "Order placed successfully!",
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Order error:", error);

        res.status(500).json({
            message: "Something went wrong while placing your order."
        });
    }
});
// Admin login
app.post("/api/admin/login", async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password."
            });
        }

        const token = jwt.sign(
            { role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Admin login successful!",
            token
        });

    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});
// Verify admin authentication
function verifyAdminToken(req, res, next) {

    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please log in."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required."
            });
        }

        req.admin = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
}
// Get all customer orders (Admin only)
app.get("/api/admin/orders", verifyAdminToken, async (req, res) => {

    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY created_at DESC"
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Fetch orders error:", error);

        res.status(500).json({
            message: "Failed to retrieve orders."
        });
    }
});// Update customer order status (Admin only)
app.patch("/api/admin/orders/:id/status", verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = Number(req.params.id);

        const allowedStatuses = ["Pending", "Processing", "Delivered"];

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                message: "Invalid order ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status."
            });
        }

        const result = await pool.query(
            `UPDATE orders
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        res.json({
            message: "Order status updated successfully!",
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            message: "Failed to update order status."
        });
    }
});
// Delete a delivered order (Admin only)
app.delete("/api/admin/orders/:id", verifyAdminToken, async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                message: "Invalid order ID."
            });
        }

        const result = await pool.query(
            `DELETE FROM orders
             WHERE id = $1 AND status = 'Delivered'
             RETURNING *`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found or has not been delivered."
            });
        }

        res.json({
            message: "Delivered order deleted successfully!"
        });

    } catch (error) {
        console.error("Delete order error:", error);

        res.status(500).json({
            message: "Failed to delete order."
        });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});