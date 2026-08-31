const { models } = require("../../../../database/models");
const { Op } = require("sequelize");
const BaseRepository = require("../shared/BaseRepository");

class BlogRepository {
  constructor() {
    this.blogCms = new BaseRepository(models.BlogCms);
    this.blogs = new BaseRepository(models.Blogs);
  }

  findCms(options = {}) {
    return this.blogCms.findOne({}, options);
  }

  findFeatured({ order = [["sort_order", "ASC"]] } = {}) {
    return this.blogs.findAll({
      where: { status: true, is_featured_active: true },
      order,
    });
  }

  findRecent({ limit = 6 } = {}) {
    return this.blogs.findAll({
      where: { status: true },
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  findPaginated({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    return this.blogs.findAndCountAll({
      where: { status: true },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  findBySlug(slug) {
    return this.blogs.findOne({ slug, status: true });
  }

  // Keyword search with AND -> OR -> recent-fill fallback, used to find "similar" blogs
  // for a given blog's title keywords. Reused as-is by NewsRepository.findSimilar.
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
      results = await this.blogs.findAll({
        where: {
          status: true,
          id: { [Op.ne]: excludeId },
          [Op.and]: buildOrConditions(),
        },
        limit,
        order: [["createdAt", "DESC"]],
      });

      if (results.length < limit) {
        results = await this.blogs.findAll({
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
      const excludeIds = [excludeId, ...results.map((b) => b.id)];
      const filler = await this.blogs.findAll({
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

module.exports = new BlogRepository();
