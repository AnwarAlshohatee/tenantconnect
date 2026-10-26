// Load environment variables from .env.
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const authRoutes = require("./routes/authRoutes");
// const { requireAuth } = require("./middleware/authMiddleware");

const meetingRoutes = require("./routes/meetingRoutes");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

// Configure EJS as our template engine.
app.set("view engine", "ejs");

// Parse data submitted through HTML forms.
app.use(express.urlencoded({ extended: true }));

// Serve CSS and other public files.
app.use(express.static(path.join(__dirname, "public")));

// Configure login sessions.
// Session data is stored in MongoDB, not server memory.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// Temporary homepage.
app.get("/", (req, res) => {
  res.render("index");
});

// Use the authentication routes.
app.use("/", authRoutes);

// Use the meeting routes.
app.use("/",meetingRoutes);

// Connect to MongoDB before accepting requests.
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`TenantConnect running at http://localhost:${PORT}`);
  });
}

startServer();