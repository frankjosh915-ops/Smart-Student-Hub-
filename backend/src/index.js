require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const portfolioRoutes = require("./routes/portfolio");
const analyticsRoutes = require("./routes/analytics");
const categoryWeightRoutes = require("./routes/categoryWeights");
const notificationRoutes = require("./routes/notifications");
const integrationRoutes = require("./routes/integrations");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smart-student-hub-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/category-weights", categoryWeightRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/integrations", integrationRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Student Hub backend running on http://localhost:${PORT}`));
