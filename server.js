const express = require("express");
const dotenv = require("dotenv");
const { sequelize } = require("./database/models");
const backendApi = require("./modules/admin/routes/index");
const frontendApi = require("./modules/frontend/routes/index");
const errorMiddleware = require("./modules/admin/http/middleware/errorMiddleware");
const Logger = require("./config/logger");
const path = require("path");
const cors = require("cors");
const expressListEndpoints = require("express-list-endpoints");
const cookieParser = require("cookie-parser");
const { createAdminUser } = require("./database/seeders/adminUser");
const { createSiteSettings } = require("./database/seeders/siteSettings");
const { policyData } = require("./database/seeders/policy");
const { seedMetaTags } = require("./database/seeders/metaTags");
const { createClient } = require("redis");

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`CORS policy does not allow access from: ${origin}`),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient
  .connect()
  .then(() => {
    Logger.info("✅ Redis connected");
    app.set("redisClient", redisClient);
  })
  .catch((err) => Logger.error("❌ Redis connection failed:", err.message));

app.use("/api/backend", backendApi);
app.use("/api/frontend", frontendApi);
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

    app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      expressListEndpoints(app).forEach((e) => {
        Logger.info(`${e.methods.join(", ").padEnd(10)} ${e.path}`);
      });
    });
  } catch (error) {
    Logger.error("❌ Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await sequelize.close();
  process.exit(0);
});
