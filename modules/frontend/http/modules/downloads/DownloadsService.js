const { QueryTypes } = require("sequelize");
const { models, sequelize } = require("../../../../../database/models");
const { withVisibility } = require("../../traits/sectionHelpers");
const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const MetaTagService = require("../metaTag/MetaTagService");

const text = (value) => value ?? "";
const { BASE_URL } = require("../../../../../constants");
const absoluteUrl = (relativePath) => (relativePath ? `${BASE_URL}/${relativePath}` : null);

// Same convention as the home / about APIs: both languages per field, flat list, no pagination
// (a handful of catalogue/brochure PDFs — no need for Load More here).
class DownloadsService {
  static async page() {
    const [banner = [], otherMeta, rows] = await Promise.all([
      models.Banners.findAll({
        include: [
          {
            model: models.Page,
            as: "page",
            required: true,
            attributes: [],
            where: { is_active: true, page_slug: "downloads" },
          },
        ],
      }),
      MetaTagService.getOtherMetaForPage("downloads"),
      sequelize.query(
        `SELECT id, title, title_ar, description, description_ar, file_path,
                file_original_filename, file_size_bytes
         FROM downloads
         WHERE is_active = true AND deleted_at IS NULL
         ORDER BY sort_order ASC, id ASC`,
        { type: QueryTypes.SELECT },
      ),
    ]);

    const bannerSection = {
      title: text(banner[0]?.title),
      title_ar: text(banner[0]?.title_ar),
      sub_title: text(banner[0]?.sub_title),
      sub_title_ar: text(banner[0]?.sub_title_ar),
      media: singleMediaWithoutType(banner[0] ?? {}, "media_path", "media_alt", "media_alt_ar"),
    };

    return {
      data: {
        other_meta: otherMeta.other_meta,
        other_meta_ar: otherMeta.other_meta_ar,
        banner_section: withVisibility(bannerSection),
        downloads: rows.map((row) => ({
          id: row.id,
          title: text(row.title),
          title_ar: text(row.title_ar),
          description: text(row.description),
          description_ar: text(row.description_ar),
          file: {
            url: absoluteUrl(row.file_path),
            filename: text(row.file_original_filename),
            size_bytes: row.file_size_bytes ?? null,
          },
        })),
      },
    };
  }
}

module.exports = DownloadsService;
