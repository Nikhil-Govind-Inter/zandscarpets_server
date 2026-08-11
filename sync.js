const { sequelize } = require("./database/models");
const Logger = require("./config/logger");

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();

    const tables = Object.values(sequelize.models).map((model) =>
      model.getTableName(),
    );

    await sequelize.sync({ alter: true });

    Logger.info("📋 Tables modified:");
    tables.forEach((table) => Logger.info(`  - ${table}`));
    Logger.info(`🔢 Total tables modified: ${tables.length}`);
    Logger.info("✅ Database connected and synced");
    process.exit(0);
  } catch (error) {
    Logger.error("❌ Failed to sync database: " + error.message);
    process.exit(1);
  }
};

syncDatabase();
