const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());
// Import routes
const authRoutes = require("./routes/authRoutes");
const syncRoutes = require("./routes/syncRoutes");

// Use routes
app.use("/auth", authRoutes);
app.use("/sync", syncRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
