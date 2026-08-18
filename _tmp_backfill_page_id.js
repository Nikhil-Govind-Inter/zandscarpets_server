const dotenv = require("dotenv");
dotenv.config();
const { sequelize } = require("./database/models");

(async () => {
  try {
    await sequelize.query(`ALTER TABLE meta_data ADD COLUMN IF NOT EXISTS page_id INTEGER;`);

    const [result] = await sequelize.query(`
      UPDATE meta_data md
      SET page_id = p.id
      FROM pages p
      WHERE md.page_slug = p.page_slug
        AND md.page_id IS NULL
      RETURNING md.id, md.page_slug, md.page_id;
    `);
    console.log("Backfilled rows:", JSON.stringify(result, null, 2));

    const [remaining] = await sequelize.query(`SELECT id, page_slug FROM meta_data WHERE page_id IS NULL;`);
    console.log("Still NULL page_id after backfill:", JSON.stringify(remaining, null, 2));
  } catch (e) {
    console.error("ERR", e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
