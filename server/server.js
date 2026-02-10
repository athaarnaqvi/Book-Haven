const express = require("express")
const cors = require("cors")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const cron = require("node-cron")
const connectDB = require("./config/db")
const booksRoutes = require("./routes/books")
const readersRoutes = require("./routes/readers")
const readingGoalsRoutes = require("./routes/readingGoals")
const timerRoutes = require("./routes/timer")
const dashboardRoutes = require("./routes/dashboard")
const deleteOldTrash = require("./deleteOldTrash")
const lendingRoutes = require("./routes/lending")
const uploadProfileRoute = require("./routes/uploadProfile")
const adminRoutes = require("./routes/admin")
const tbrRoutes = require("./routes/tbrRoutes")
require("dotenv").config()

const app = express()

// Middleware - ORDER MATTERS!
app.use(express.json())
app.use(cookieParser()) // Parse cookies

// CORS configuration MUST come BEFORE routes
app.use(
  cors({
    origin: ["http://localhost:3000", 'https://book-haven-app-azure.vercel.app','https://book-haven-psi.vercel.app'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  }),
)

// Handle preflight requests
app.options(
  "*",
  cors({
    origin: ["http://localhost:3000", 'https://book-haven-app-azure.vercel.app','https://book-haven-psi.vercel.app' ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  }),
)

app.set("trust proxy", 1);


app.use(
  session({
    name: "bookhaven.sid",
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,        // REQUIRED for HTTPS (Vercel)
      httpOnly: true,
      sameSite: "none",    // REQUIRED for cross-site cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
)


// Add session debugging middleware
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID)
  console.log("Session Data:", req.session)
  next()
})

// Connect to MongoDB
connectDB()

// Routes - AFTER middleware setup
app.use("/book", booksRoutes)
app.use("/reader", readersRoutes)
app.use("/reading-goals", readingGoalsRoutes)
app.use("/timer", timerRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/lending", lendingRoutes)
app.use("/profile-pic", uploadProfileRoute)
app.use("/admin", adminRoutes)
app.use("/tbr", tbrRoutes) // MOVED AFTER CORS setup

// Startup Cleanup
console.log("Running startup trash cleanup...")
deleteOldTrash();

// Start server
app.listen(8000, () => {
  console.log("Server started on port 8000")
})

