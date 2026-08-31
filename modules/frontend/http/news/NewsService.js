const NewsRepository = require("./NewsRepository");
const { mediaWithoutType, singleMediaWithoutType } = require('../traits/mediaButtonHelper');

class NewsService {

  static async index({ page = 1, limit = 10 } = {}) {
    page = parseInt(page);
    limit = parseInt(limit);

    const [cmsData = {}, featuredNews = [], allNewsPaginated] = await Promise.all([
      NewsRepository.findListCms(),
      NewsRepository.findFeatured(),
      NewsRepository.findPaginated({ page, limit }),
    ]);

    const recentNews = await NewsRepository.findRecent({ limit: 6 });

    const allNews = {
      total: allNewsPaginated.count,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(allNewsPaginated.count / limit),
      data: allNewsPaginated.rows,
    };

    return {
      banner_section: this.buildBannerSection(cmsData, featuredNews),
      recents_News_section: this.buildRecentsNewsSection(cmsData, recentNews),
      all_News_section: this.buildAllNewsSection(cmsData, allNews.data),
      get_in_touch_section: this.buildGetInTouchSection(cmsData),
      pagination: {
        total: allNews.total,
        currentPage: allNews.currentPage,
        perPage: allNews.perPage,
        totalPages: allNews.totalPages,
      },
    };
  }



  static buildBannerSection(cmsData, featuredNews) {
    return {
      super_title: cmsData?.banner_super_title ?? "",
      title: cmsData?.banner_title ?? "",
      description: cmsData?.banner_description ?? "",
      list:
        featuredNews.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          reading_time: item?.reading_time ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(
            item,
            "thumbnail",
            "thumbnail_alt"
          ),
        })) || [],
    };
  }

  static buildRecentsNewsSection(cmsData, recentNews) {
    return {
      title: cmsData?.recent_New_title ?? "",
      list:
        recentNews.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          reading_time: item?.reading_time ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(
            item,
            "thumbnail",
            "thumbnail_alt"
          ),
        })) || [],
    };
  }

  static buildAllNewsSection(cmsData, allNews) {
    return {
      title: cmsData?.all_News_title ?? "",
      list:
        allNews.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          reading_time: item?.reading_time ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(
            item,
            "thumbnail",
            "thumbnail_alt"
          ),
        })) || [],
    };
  }

  static buildGetInTouchSection(cmsData) {
    return {
      title: cmsData?.footer_title ?? "",
      description: cmsData?.description ?? "",

    };
  }



  static async show(slug) {
    const cmsData = await NewsRepository.findDetailCms();
    const New = await NewsRepository.findBySlug(slug);

    if (!New) {
      throw new Error("New not found");
    }

    // Extract and clean keywords
    const words = New.title
      .toLowerCase()
      .split(" ")
      .filter(w => w.length > 3)
      .map(w => w.trim());

    const similarNews = await NewsRepository.findSimilar({
      keywords: words,
      excludeId: New.id,
      limit: 3,
    });

    return {
      New_details_section: this.buildNewDetailSection(New),
      similar_section: this.buildSimilarSection(similarNews),
      get_in_touch_section: this.buildGetInTouchDetailSection(cmsData),
    };
  }

  static buildNewDetailSection(New) {
    return {
      title: New?.title ?? "",
      slug: New?.slug ?? "",
      description: New?.description ?? "",
      reading_time: New?.reading_time ?? "",
      published_on: New?.published_on ?? "",
      media: mediaWithoutType(
        New,
        "banner_media_desktop_path",
        "banner_media_mobile_path",
        "banner_media_alt",
      ),
      sub_description: New?.sub_description ?? "",

    };
  }



  static buildSimilarSection(similarNews) {
    return {
      title: "Similar News",
      list:
        similarNews.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          reading_time: item?.reading_time ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(
            item,
            "thumbnail",
            "thumbnail_alt"
          ),
        })) || [],
    };
  }

  static buildGetInTouchDetailSection(cmsData) {
    return {
      title: cmsData?.footer_title ?? "",
      description: cmsData?.description ?? "",

    };
  }
}

module.exports = NewsService;
