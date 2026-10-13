const { Op } = require("sequelize");
const { models } = require("../database/models");
const { deleteOldFile } = require("../modules/admin/http/middleware/multerMiddleware");

// Media rows nothing references yet: uploaded through the picker but never
// attached to a detail item (e.g. the admin closed the modal without
// saving). No cron library exists in this codebase, so this is exposed as
// an admin-triggered endpoint (POST /details/media/cleanup-orphans)
// instead of introducing a new background-job dependency.
const findOrphanMedia = async ({ olderThanHours = 24 } = {}) => {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  return models.Media.findAll({
    where: {
      createdAt: { [Op.lt]: cutoff },
    },
    include: [
      {
        model: models.DetailItems,
        as: "detailItems",
        required: false,
        attributes: ["id"],
      },
    ],
  }).then((rows) => rows.filter((row) => row.detailItems.length === 0));
};

const deleteOrphanMedia = async ({ olderThanHours = 24 } = {}) => {
  const orphans = await findOrphanMedia({ olderThanHours });

  for (const media of orphans) {
    await deleteOldFile(media.location);
    if (media.thumbnail_location) await deleteOldFile(media.thumbnail_location);
    await media.destroy();
  }

  return { deleted: orphans.length, ids: orphans.map((m) => m.id) };
};

module.exports = { findOrphanMedia, deleteOrphanMedia };
