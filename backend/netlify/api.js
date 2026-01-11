const serverless = require("serverless-http");
const mongoose = require("mongoose");
const app = require("../app");
require("dotenv").config();

// Cache the database connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log("MongoDB Connected via Serverless");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};

// Match server.js routes that might be missing or different in app.js
app.use("/api/certificate", require("../routes/certificateRoutes"));
app.use("/api/users", require("../routes/userRoutes"));
app.use("/api/audit-logs", require("../routes/auditLogRoutes"));
app.use("/api/plans", require("../routes/planRoutes"));

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Prevent the function from waiting for the event loop to empty (e.g. open DB connections)
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDB();

    return handler(event, context);
};
