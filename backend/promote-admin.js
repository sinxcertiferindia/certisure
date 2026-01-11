const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const email = process.argv[2];

if (!email) {
    console.log("Usage: node promote-admin.js <email>");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { role: "SUPER_ADMIN" },
            { new: true }
        );
        if (user) {
            console.log(`Success: User ${email} has been promoted to SUPER_ADMIN.`);
            console.log("You can now log in and access the Master Dashboard.");
        } else {
            console.log(`Error: User with email ${email} not found.`);
        }
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
