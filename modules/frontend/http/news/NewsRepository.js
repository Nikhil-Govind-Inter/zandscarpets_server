const { models } = require("../../../../database/models");
const { Op } = require("sequelize");
const BaseRepository = require("../shared/BaseRepository");

class NewsRepository {
  constructor() {
    // NOTE: mirrors a pre-existing typo in the original NewsService.show() which read
    // `models.NewCms` instead of `models.NewsCms` — preserved as-is to keep behavior
    // unchanged during this migration (see plan's "known gap, not fixed" callout).
    this.newCms = new BaseRepository(models.NewCms);
    this.newsCms = new BaseRepository(models.NewsCms);
    this.news = new BaseRepository(models.News);
  }

  findListCms(options = {}) {
    return this.newsCms.findOne({}, options);
  }

  // Preserves the original typo'd model reference used by the detail page.
  findDetailCms(options = {}) {
    return this.newCms.findOne({}, options);
  }

  findFeatured({ order = [["sort_order", "ASC"]] } = {}) {
    return this.news.findAll({
      where: { status: true, is_featured_active: true },
      order,
    });
  }

  findRecent({ limit = 6 } = {}) {
    return this.news.findAll({
      where: { status: true },
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  findPaginated({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    return this.news.findAndCountAll({
      where: { status: true },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  findBySlug(slug) {
    return this.news.findOne({ slug, status: true });
  }

  // Same AND -> OR -> recent-fill fallback shape as BlogRepository.findSimilar.
  async findSimilar({ keywords, excludeId, limit = 3 }) {
    const words = keywords.filter((w) => w.length > 3);
    const buildOrConditions = () =>
      words.map((word) => ({
        [Op.or]: [
          { title: { [Op.iLike]: `%${word}%` } },
          { description: { [Op.iLike]: `%${word}%` } },
        ],
      }));

    let results = [];
    if (words.length > 0) {
      results = await this.news.findAll({
        where: {
          status: true,
          id: { [Op.ne]: excludeId },
          [Op.and]: buildOrConditions(),
        },
        limit,
        order: [["createdAt", "DESC"]],
      });

      if (results.length < limit) {
        results = await this.news.findAll({
          where: {
            status: true,
            id: { [Op.ne]: excludeId },
            [Op.or]: buildOrConditions(),
          },
          limit,
          order: [["createdAt", "DESC"]],
        });
      }
    }

    if (results.length < limit) {
      const excludeIds = [excludeId, ...results.map((n) => n.id)];
      const filler = await this.news.findAll({
        where: {
          status: true,
          id: { [Op.notIn]: excludeIds },
        },
        limit: limit - results.length,
        order: [["createdAt", "DESC"]],
      });
      results = [...results, ...filler];
    }

    return results;
  }
}

module.exports = new NewsRepository();
