const bcrypt = require("bcrypt");
const AdminUser = require("../models").models.AdminUser;


const createAdminUser = async () => {
  try {
    const existingAdmin = await AdminUser.findOne({
      where: { username: "admin@intersmart.in" },
    });

    console.log("Existing admin user:", existingAdmin);

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await AdminUser.create({
      username: "admin@intersmart.in",
      email: "admin@intersmart.in",
      password: hashedPassword,
      role: "admin",
      is_active: true
    });
  } catch (error) {
    console.error("❌ Failed to create admin user:", error.message);
  }
};

module.exports = { createAdminUser };
