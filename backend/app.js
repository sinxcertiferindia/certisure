const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const templateRoutes = require("./routes/templateRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

app.use(cors({
  origin: true, // Allow all origins for now to prevent CORS issues in production
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/org", organizationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/team", teamRoutes);

app.get("/", (req, res) => {
  res.send("Certiflow Backend Running");
});

module.exports = app;

