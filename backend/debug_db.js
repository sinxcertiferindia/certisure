const mongoose = require("mongoose");
require("dotenv").config();
const { Organization } = require("./models");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for debugging");
    try {
      const count = await Organization.countDocuments();
      console.log(`Organization count: ${count}`);
      const org = await Organization.findOne({});
      console.log("First Organization:", JSON.stringify(org, null, 2));
    } catch (e) {
      console.error("Error querying organizations:", e);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
