const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/org", require("./routes/organizationRoutes"));
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
// Master Dashboard Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use("/api/plans", require("./routes/planRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

