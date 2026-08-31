const { models } = require("../../../../database/models");
const BaseRepository = require("../shared/BaseRepository");

const META_ATTRIBUTES = [
  "meta_title",
  "meta_description",
  "meta_keywords",
  "targeted_keywords",
  "other_meta_tags",
  "canonical_url",
];

class MetaTagRepository {
  constructor() {
    this.blogs = new BaseRepository(models.Blogs);
    this.news = new BaseRepository(models.News);
    this.metaTags = new BaseRepository(models.MetaTags);
  }

  // Polymorphic lookup: which model/column to query depends on the page `type`.
  findByTypeAndSlug(type, slug) {
    switch (type) {
      case "blog":
        return this.blogs.findOne({ slug }, { attributes: META_ATTRIBUTES });
      case "news":
        return this.news.findOne({ slug }, { attributes: META_ATTRIBUTES });
      case "common-page":
        return this.metaTags.findOne({ page: slug }, { attributes: META_ATTRIBUTES });
      default:
        return null;
    }
  }
}

module.exports = new MetaTagRepository();
