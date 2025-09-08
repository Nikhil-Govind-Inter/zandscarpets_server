const express = require("express");
const dotenv = require("dotenv");
const { sequelize } = require("./models/index");
const apiBackendRoutes = require("./routes/backend/index");
const apiFrontendRoutes = require("./routes/frontend/index");
const errorMiddleware = require("./middlewares/errorMiddleware");
const Logger = require("./services/logger");
const path = require("path");
const cors = require("cors");
const expressListEndpoints = require("express-list-endpoints");
const cookieParser = require("cookie-parser");
const { specs, swaggerUi } = require("./config/swagger");

const { createAdminUser } = require("./seeders/adminUser");
const { createSiteSettings } = require("./seeders/siteSettings");
const { policyData } = require("./seeders/policy");
const { seedMetaTags } = require("./seeders/metaTags");
const { createClient } = require("redis");

const allowedOrigins = [
  "http://localhost:3000", // your frontend dev URL
  "http://localhost:3000", // your frontend dev URL
  "http://localhost:8080", // your frontend dev URL
];

dotenv.config();
const app = express();

// app.use(cors());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ⬇️ Initialize Redis client and attach to app
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => {
    Logger.info("✅ Redis connected");
    app.set("redisClient", redisClient);
  })
  .catch((err) => {
    Logger.error("❌ Redis connection failed:", err.message);
  });

// ⬇️ Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Xpress Health API Documentation",
  })
);

// ⬇️ Routes
app.use("/api/backend", apiBackendRoutes);
app.use("/api/frontend", apiFrontendRoutes);

// ⬇️ Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    Logger.info("✅ Database connected and synced");

    await createAdminUser();
    await createSiteSettings();
    await policyData();
    await seedMetaTags();
    //
    app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      const endpoints = expressListEndpoints(app);
      Logger.info("📋 Registered Endpoints:");
      endpoints.forEach((e) => {
        Logger.info(`${e.methods.join(", ").padEnd(10)} ${e.path}`);
      });
    });
  } catch (error) {
    Logger.error("❌ Failed to start server: " + error.message);
    console.error("Error details:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await sequelize.close();
  process.exit(0);
});
