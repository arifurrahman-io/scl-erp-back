require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const routes = require("./routes/index");

// Initialize App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(morgan("dev")); // Logging
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/api", routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

app.use((err, req, res, next) => {
  console.error("DEBUG ERROR:", err); // This prints the error in your VS Code terminal

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
