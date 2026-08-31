const BlogRepository = require("./BlogRepository");
const { mediaWithoutType, singleMediaWithoutType } = require('../traits/mediaButtonHelper');

class BlogService {

  static async index({ page = 1, limit = 10 } = {}) {
    page = parseInt(page);
    limit = parseInt(limit);

    const [cmsData = {}, featuredBlogs = [], allBlogsPaginated] = await Promise.all([
      BlogRepository.findCms(),
      BlogRepository.findFeatured(),
      BlogRepository.findPaginated({ page, limit }),
    ]);

    const recentBlogs = await BlogRepository.findRecent({ limit: 6 });

    const allBlogs = {
      total: allBlogsPaginated.count,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(allBlogsPaginated.count / limit),
      data: allBlogsPaginated.rows,
    };

    return {
      banner_section: this.buildBannerSection(cmsData, featuredBlogs),
      recents_blogs_section: this.buildRecentsBlogsSection(cmsData, recentBlogs),
      all_blogs_section: this.buildAllBlogsSection(cmsData, allBlogs.data),
      get_in_touch_section: this.buildGetInTouchSection(cmsData),
      pagination: {
        total: allBlogs.total,
        currentPage: allBlogs.currentPage,
        perPage: allBlogs.perPage,
        totalPages: allBlogs.totalPages,
      },
    };
  }



  static buildBannerSection(cmsData, featuredBlogs) {
    return {
      super_title: cmsData?.banner_super_title ?? "",
      title: cmsData?.banner_title ?? "",
      description: cmsData?.banner_description ?? "",
      list:
        featuredBlogs.map((item) => ({
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

  static buildRecentsBlogsSection(cmsData, recentBlogs) {
    return {
      title: cmsData?.recent_blog_title ?? "",
      list:
        recentBlogs.map((item) => ({
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

  static buildAllBlogsSection(cmsData, allBlogs) {
    return {
      title: cmsData?.all_blogs_title ?? "",
      list:
        allBlogs.map((item) => ({
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
    const cmsData = await BlogRepository.findCms();
    const blog = await BlogRepository.findBySlug(slug);

    if (!blog) {
      throw new Error("Blog not found");
    }

    // Extract and clean keywords
    const words = blog.title
      .toLowerCase()
      .split(" ")
      .filter(w => w.length > 3)
      .map(w => w.trim());

    const similarBlogs = await BlogRepository.findSimilar({
      keywords: words,
      excludeId: blog.id,
      limit: 3,
    });

    return {
      blog_details_section: this.buildBlogDetailSection(blog),
      similar_section: this.buildSimilarSection(similarBlogs),
      get_in_touch_section: this.buildGetInTouchDetailSection(cmsData),
    };
  }

  static buildBlogDetailSection(blog) {
    return {
        title: blog?.title ?? "",
          slug: blog?.slug ?? "",
          description: blog?.description ?? "",
          reading_time: blog?.reading_time ?? "",
          published_on: blog?.published_on ?? "",
          media: mediaWithoutType(
            blog,
            "banner_media_desktop_path",
            "banner_media_mobile_path",
            "banner_media_alt",
          ),
          sub_description: blog?.sub_description ?? "",

    };
  }



  static buildSimilarSection(similarBlogs) {
    return {
      title: "Similar Blogs",
      list:
        similarBlogs.map((item) => ({
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

module.exports = BlogService;
