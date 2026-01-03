const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const templateRoutes = require("./routes/templateRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/org", organizationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/templates", templateRoutes);

app.get("/", (req, res) => {
  res.send("Certiflow Backend Running");
});

module.exports = app;

