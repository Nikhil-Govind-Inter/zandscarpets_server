const MetaTagRepository = require("./MetaTagRepository");

const VALID_TYPES = ["blog", "news", "common-page"];

class MetaTagService {
  static async index(type, slug) {
    if (!VALID_TYPES.includes(type)) {
      return null;
    }

    let data = await MetaTagRepository.findByTypeAndSlug(type, slug);

    // fallback meta values
    const defaultMeta = {
      meta_title: "Go Ec",
      meta_description:
        "Welcome to Go Ec",
      meta_keywords: "Go Ec",
      targeted_keywords: "Go Ec",
      other_meta_tags: "<meta name='author' content='Go Ec'>",
      canonical_url: "/",
    };

    if (!data) {
      return defaultMeta;
    }

    data = data.toJSON();
    Object.keys(defaultMeta).forEach((key) => {
      if (!data[key]) {
        data[key] = defaultMeta[key];
      }
    });

    return data;
  }
}

module.exports = MetaTagService;
