const fs = require("fs");
const path = require("path");
const SiteSettings = require("../models").models.SiteSettings;

const copyFile = (src, dest) => {
  fs.copyFileSync(src, dest);
  console.log(`📁 Copied file from ${src} to ${dest}`);
};

const createSiteSettings = async () => {
  try {
    const existingSettings = await SiteSettings.findOne();

    if (existingSettings) {
      console.log("✅ Site settings already exist");
      return;
    }

    const sourcePath = path.join(__dirname, "../assets");
    const destPath = path.join(__dirname, "../uploads");

    // Make sure destination exists
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });

    // Files to copy and store with upload path
    const files = {
      logo: "logo.svg",
      favicon: "logo.svg",
      footer_logo: "footer-logo.svg",
    };

    // Copy files to uploads folder
    Object.values(files).forEach((filename) => {
      copyFile(path.join(sourcePath, filename), path.join(destPath, filename));
    });

    // File paths to store in DB
    const filePaths = {
      logo: `uploads/${files.logo}`,
      favicon: `uploads/${files.favicon}`,
      footer_logo: `uploads/${files.footer_logo}`,
    };

    // Insert DB record
    await SiteSettings.create({
      address: "Park West Enterprise Centre, Unit 47, Lavery Ave, Dublin 12, Ireland",
      email: "info@xpresshealth.ie",
      phone: "+353 1 2118883",
      logo: filePaths.logo,
      logo_alt: "Xpress Logo",
      favicon: filePaths.favicon,
      footer_logo: filePaths.footer_logo,
      footer_description: "Xpress Health is not a regular staffing agency, we are a technology based nursing agency that improves a healthcare workers overall experience using AI! Enabling them to find the highest paying shifts!",
    });

    console.log("✅ Default site settings created");
  } catch (error) {
    console.error("❌ Failed to create site settings:", error.message);
  }
};

module.exports = { createSiteSettings };
