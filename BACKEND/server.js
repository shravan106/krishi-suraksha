import express from "express";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ================= DATABASE ================= */

const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "pass",
  database: "krishisuraksha",
  port: 3306
});

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "krishi_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

/* ================= ALL DISTRICTS ================= */

const DISTRICTS = {
  "Mumbai":[19.07,72.87],
  "Mumbai Suburban":[19.13,72.88],
  "Thane":[19.21,72.97],
  "Palghar":[19.69,72.76],
  "Raigad":[18.51,73.18],
  "Ratnagiri":[16.99,73.31],
  "Sindhudurg":[16.34,73.55],

  "Pune":[18.52,73.85],
  "Satara":[17.68,74.01],
  "Sangli":[16.85,74.58],
  "Kolhapur":[16.70,74.24],
  "Solapur":[17.65,75.90],

  "Nashik":[19.99,73.78],
  "Ahmednagar":[19.09,74.74],
  "Dhule":[20.90,74.77],
  "Nandurbar":[21.37,74.24],
  "Jalgaon":[21.00,75.56],

  "Aurangabad":[19.87,75.34],
  "Jalna":[19.83,75.88],
  "Beed":[18.98,75.76],
  "Osmanabad":[18.18,76.04],
  "Latur":[18.40,76.56],
  "Nanded":[19.13,77.32],
  "Parbhani":[19.26,76.77],
  "Hingoli":[19.71,77.14],

  "Nagpur":[21.14,79.08],
  "Wardha":[20.74,78.60],
  "Bhandara":[21.16,79.64],
  "Gondia":[21.46,80.19],
  "Chandrapur":[19.96,79.29],
  "Gadchiroli":[20.18,80.00],
  "Amravati":[20.93,77.77],
  "Akola":[20.70,77.02],
  "Washim":[20.11,77.13],
  "Yavatmal":[20.38,78.12],
  "Buldhana":[20.52,76.18]
};

/* ================= MARKET API ================= */

app.get("/api/market", async (req, res) => {

  const { crop, district } = req.query;

  if (!crop || !district) {
    return res.status(400).json({ error: "Crop & district required" });
  }

  try {
    const url =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" +
      `?api-key=${process.env.DATA_GOV_API_KEY}` +
      `&format=json` +
      `&filters[state]=Maharashtra` +
      `&filters[district]=${district}` +
      `&filters[commodity]=${crop}`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {
    console.error("Market error:", error.message);
    res.status(500).json({ error: "Market API failed" });
  }
});

/* ================= WEATHER ================= */

// By District
app.get("/api/weather/:district", async (req, res) => {

  const district = req.params.district;

  if (!DISTRICTS[district]) {
    return res.status(404).json({ error: "District not found" });
  }

  const [lat, lon] = DISTRICTS[district];

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY
        }
      }
    );

    const data = response.data;

    res.json({
      district,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      description: data.weather[0].description
    });

  } catch (error) {
    console.error("Weather error:", error.message);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

// By Coordinates (used in map)
app.get("/api/weather", async (req, res) => {

  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude & Longitude required" });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY
        }
      }
    );

    const data = response.data;

    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      description: data.weather[0].description
    });

  } catch {
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

/* ================= AUTH ================= */

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // VALIDATION
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // CHECK EXISTING USER
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, role]
    );

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ================= ADMIN LOGIN ================= */
    if (email === "admin@krishi.com" && password === "admin123") {
      return res.json({
        id: 0,
        name: "Admin",
        email,
        role: "admin"
      });
    }
    /* =================================================== */

    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not registered" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// SESSION CHECK
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.session.user);
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

/* ================= CROPS ================= */

// ADD
app.post("/api/crops", async (req, res) => {
  try {
    const { farmer_id, crop, quantity, price, district } = req.body;

    // ✅ Validation
    if (!farmer_id || !crop || !quantity || !price || !district) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({ error: "Invalid quantity or price" });
    }

    // ✅ Insert crop with proper defaults
    await db.execute(
      `INSERT INTO crops 
       (farmer_id, crop, quantity, price, district, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'available', NOW())`,
      [farmer_id, crop, quantity, price, district]
    );

    res.json({ success: true, message: "Crop added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add crop" });
  }
});

// GET BY FARMER
app.get("/api/crops/:farmer_id", async (req, res) => {
  try {

    const farmer_id = req.params.farmer_id;

    const [rows] = await db.execute(
      "SELECT * FROM crops WHERE farmer_id = ? ORDER BY id DESC",
      [farmer_id]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

// UPDATE
app.put("/api/crops/:id", async (req, res) => {
  try {

    const id = req.params.id;
    const { crop, quantity, price } = req.body;

    await db.execute(
      "UPDATE crops SET crop=?, quantity=?, price=? WHERE id=?",
      [crop, quantity, price, id]
    );

    res.json({ message: "Updated successfully" });

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE
app.delete("/api/crops/:id", async (req, res) => {
  try {

    const id = req.params.id;

    await db.execute(
      "DELETE FROM crops WHERE id=?",
      [id]
    );

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// FOR BUYERS: GET ALL AVAILABLE CROPS
app.get("/api/all-crops", async (req, res) => {
  try {

    const [rows] = await db.execute(
      "SELECT * FROM crops WHERE status = 'available' AND quantity > 0  ORDER BY id DESC"
    );

    res.json(rows);

  } catch {
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

//BUY
app.put("/api/buy/:id", async (req, res) => {
  try {

    const id = req.params.id;

    await db.execute(
      "UPDATE crops SET status = 'sold' WHERE id = ?",
      [id]
    );

    res.json({ message: "Crop purchased successfully" });

  } catch {
    res.status(500).json({ error: "Purchase failed" });
  }
});

//


/* ================= FORGOT PASSWORD ================= */
app.post("/api/forgot-password", async (req, res) => {
  try {
    let { email, newPassword } = req.body;

    // 🔧 CLEAN INPUT
    email = email.trim().toLowerCase();
    newPassword = newPassword.trim();

    console.log("RESET REQUEST:", email);

    // VALIDATION
    if (!email || !newPassword) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // CHECK USER EXISTS
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: "User not found. Please sign up first."
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // UPDATE PASSWORD
    const [result] = await db.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Password update failed" });
    }

    console.log("Password updated for:", email);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ error: "Reset failed" });
  }
});

/* ================= MARKET DATA ================= */
app.get("/api/market", async (req, res) => {
  try {
    const { district, crop } = req.query;

    const response = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
      ?api-key=${process.env.DATA_GOV_API_KEY}
      &format=json
      &filters[state]=Maharashtra
      &filters[district]=${district}
      &filters[commodity]=${crop}`
    );

    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API failed" });
  }
});
/* ================= ORDERS ================= */
// CREATE ORDER
app.post("/api/orders", async (req, res) => {
  console.log("REQ BODY:", req.body);

  const conn = await db.getConnection();

  try {
    const { buyer_id, crop_id, quantity, address, payment_method, payment_status, transaction_id } = req.body;

    if (!buyer_id || !crop_id || !quantity || !address || !payment_method || !payment_status || !transaction_id) {
      return res.status(400).json({ error: "All fields required" });
    }

    await conn.beginTransaction();

    // 🔥 1. GET CURRENT QUANTITY
    const [rows] = await conn.execute(
      "SELECT quantity FROM crops WHERE id = ? FOR UPDATE",
      [crop_id]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: "Crop not found" });
    }

    const currentQty = rows[0].quantity;

    if (currentQty < quantity) {
      await conn.rollback();
      return res.json({ success: false, error: "Not enough stock" });
    }

    // 🔥 2. INSERT ORDER (YOUR ORIGINAL CODE)
    const [result] = await conn.execute(
      `INSERT INTO orders 
      (buyer_id, crop_id, quantity, address, payment_method, payment_status, transaction_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [buyer_id, crop_id, quantity, address, payment_method, payment_status, transaction_id, "Processing"]
    );

    const orderId = result.insertId;

    // 🔥 3. UPDATE CROP QUANTITY
    const newQty = currentQty - quantity;

    await conn.execute(
      "UPDATE crops SET quantity = ?, status = ? WHERE id = ?",
      [
        newQty,
        newQty === 0 ? "sold" : "available",
        crop_id
      ]
    );

    // 🔥 4. COMMIT TRANSACTION
    await conn.commit();

    // 🔥 AUTO STATUS UPDATE (your existing)
    autoUpdateStatus(orderId);

    res.json({ success: true });

  } catch (err) {
    await conn.rollback();
    console.log(err);
    res.status(500).json({ success: false, error: "Order failed" });
  } finally {
    conn.release();
  }
});

//GET ORDERS
app.get("/api/orders/:buyer_id", async (req, res) => {
  try {
    const buyer_id = req.params.buyer_id;

    const [rows] = await db.execute(`
      SELECT o.*, c.crop, c.price, c.district
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      WHERE o.buyer_id = ?
      ORDER BY o.id DESC
    `, [buyer_id]);

    res.json(rows);

  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
});

//CANCEL ORDER
app.put("/api/orders/cancel/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // 1️⃣ GET ORDER
    const [orders] = await db.execute(
      "SELECT crop_id, quantity, status FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    if (order.status === "Cancelled") {
      return res.json({ success: false, error: "Already cancelled" });
    }

    if (order.status === "Delivered") {
      return res.json({ success: false, error: "Cannot cancel delivered order" });
    }

    // 2️⃣ RESTORE QUANTITY
    await db.execute(
      "UPDATE crops SET quantity = quantity + ?, status='available' WHERE id=?",
      [order.quantity, order.crop_id]
    );

    // 3️⃣ UPDATE ORDER
    await db.execute(
      "UPDATE orders SET status='Cancelled' WHERE id=?",
      [orderId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cancel failed" });
  }
});
//UPDATE ADDRESS
app.put("/api/orders/address/:id", async (req, res) => {
  try {
    const { address } = req.body;

    await db.execute(
      "UPDATE orders SET address = ? WHERE id = ?",
      [address, req.params.id]
    );

    res.json({ message: "Address updated" });

  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

/* ================= AUTO UPDATE ORDER STATUS ================= */
function autoUpdateStatus(orderId) {

  setTimeout(async () => {
    console.log("Updating to Confirmed", orderId);

    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ? AND status != 'Cancelled'",
      ["Confirmed", orderId]
    );

  }, 5000);

  setTimeout(async () => {
    console.log("Updating to Shipped", orderId);

    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ? AND status != 'Cancelled'",
      ["Shipped", orderId]
    );

  }, 10000);

  setTimeout(async () => {
    console.log("Updating to Delivered", orderId);

    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ? AND status != 'Cancelled'",
      ["Delivered", orderId]
    );

  }, 20000);
}

//ADMIN STATS
app.get("/api/admin/stats", async (req, res) => {
  const [farmers] = await db.execute("SELECT COUNT(*) c FROM users WHERE role='farmer'");
  const [buyers] = await db.execute("SELECT COUNT(*) c FROM users WHERE role='buyer'");
  const [orders] = await db.execute("SELECT COUNT(*) c FROM orders");

  const [recent] = await db.execute(`
    SELECT o.*, c.crop FROM orders o
    JOIN crops c ON o.crop_id = c.id
    ORDER BY o.id DESC LIMIT 5
  `);

  const [revenue] = await db.execute(`
    SELECT SUM(c.price * o.quantity) as total
    FROM orders o
    JOIN crops c ON o.crop_id = c.id
    WHERE o.status='Delivered'
  `);

    // COUNT ACTIVE CROP LISTINGS
    const [listings] = await db.execute(
      "SELECT COUNT(*) as count FROM crops WHERE status='available' AND quantity > 0"
    );

  const [chart] = await db.execute(`
    SELECT DATE(created_at) day, COUNT(*) orders
    FROM orders GROUP BY day LIMIT 7
  `);
    const [topCrop] = await db.execute(`
    SELECT crop, COUNT(*) c FROM crops
    GROUP BY crop ORDER BY c DESC LIMIT 1
  `);
  const [topDistrict] = await db.execute(`
    SELECT district, COUNT(*) c FROM crops
    GROUP BY district ORDER BY c DESC LIMIT 1
  `);
  
  res.json({
    farmers: farmers[0].c,
    buyers: buyers[0].c,
    orders: orders[0].c,
    topCrop: topCrop[0]?.crop || "N/A",
    topDistrict: topDistrict[0]?.district || "N/A",
    listings: listings[0].count,
    revenue: revenue[0].total || 0,
    chart,
    recent
  });
});

// ADMIN UPDATE ORDER STATUS
app.put("/api/admin/order/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await db.execute(
      "UPDATE orders SET status=? WHERE id=?",
      [status, req.params.id]
    );

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// ================= ADMIN ORDERS =================
app.get("/api/admin/orders", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT o.*, c.crop, c.price, u.name AS buyer_name
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("ADMIN ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

//ADMIN ALL CROPS
// ================= ADMIN CROPS =================
app.get("/api/admin/crops", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.*, u.name AS farmer_name
      FROM crops c
      JOIN users u ON c.farmer_id = u.id
      ORDER BY c.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

//APPROVE CROPS
app.put("/api/admin/crops/approve/:id", async (req, res) => {
  try {
    await db.execute(
      "UPDATE crops SET status='available' WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Approve failed" });
  }
});

//REJECT CROPS
app.put("/api/admin/crops/reject/:id", async (req, res) => {
  try {
    await db.execute(
      "UPDATE crops SET status='rejected' WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Reject failed" });
  }
});

//ADMIN DELETE CROPS
app.delete("/api/admin/crops/:id", async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM crops WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

//block user
app.put("/api/admin/user/block/:id", async (req, res) => {
  try {
    // get current status
    const [rows] = await db.execute(
      "SELECT status FROM users WHERE id=?",
      [req.params.id]
    );

    const newStatus = rows[0].status === "blocked" ? "active" : "blocked";

    await db.execute(
      "UPDATE users SET status=? WHERE id=?",
      [newStatus, req.params.id]
    );

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Toggle failed" });
  }
});
//ADMIN USERS
// ================= ADMIN USERS =================
app.get("/api/admin/users", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, name, email, role,
      COALESCE(status, 'active') AS status
      FROM users
    `);

    res.json(rows);

  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);  // 👈 IMPORTANT
    res.status(500).json({ error: err.message }); // 👈 SHOW REAL ERROR
  }
});
//delete user
app.delete("/api/admin/user/:id", async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM users WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ================= ADMIN ANALYTICS =================
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const range = req.query.range || "7d";

    let condition = "";

    if (range === "7d") {
      condition = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } 
    else if (range === "30d") {
      condition = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } 
    else if (range === "month") {
      condition = `
        AND YEAR(o.created_at) = YEAR(NOW())
        AND MONTH(o.created_at) = MONTH(NOW())
      `;
    }

    const [revenue] = await db.execute(`
      SELECT DATE(o.created_at) as date,
             SUM(c.price * o.quantity) as total
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      WHERE o.status = 'Delivered'
      ${condition}
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `);

    const [farmers] = await db.execute(`
      SELECT u.name, SUM(o.quantity) as total_sold
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      JOIN users u ON c.farmer_id = u.id
      WHERE o.status = 'Delivered'
      GROUP BY u.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    const [buyers] = await db.execute(`
      SELECT u.name, SUM(o.quantity) as total_bought
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      WHERE o.status = 'Delivered'
      GROUP BY u.id
      ORDER BY total_bought DESC
      LIMIT 5
    `);

    res.json({ farmers, buyers, revenue });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});