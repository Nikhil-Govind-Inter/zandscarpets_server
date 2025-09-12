const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');
const { Op } = require("sequelize");

class BlogService {

  static async index({ page = 1, limit = 10 } = {}) {
    try {
      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;

      const [cmsData = {}, blogs = [], allBlogsPaginated] = await Promise.all([
        models.BlogCms.findOne(),

        // Featured blogs
        models.Blogs.findAll({
          where: { status: true, is_featured_active: true },
          order: [["sort_order", "ASC"]],
        }),

        // Paginated all blogs
        models.Blogs.findAndCountAll({
          where: { status: true },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        }),
      ]);

      const featuredBlogs = blogs;

      const recentBlogs = await models.Blogs.findAll({
        where: { status: true },
        order: [["createdAt", "DESC"]],
        limit: 6,
      });

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
        all_blogs_section: this.buildAllBlogsSection(cmsData, allBlogs.data), // ✅ use rows
        get_in_touch_section: this.buildGetInTouchSection(cmsData),
        pagination: {
          total: allBlogs.total,
          currentPage: allBlogs.currentPage,
          perPage: allBlogs.perPage,
          totalPages: allBlogs.totalPages,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching blog listing page data: ${error.message}`);
    }
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
    try {
      const cmsData = await models.BlogCms.findOne();
      const blog = await models.Blogs.findOne({
        where: { slug, status: true },
      });

      if (!blog) {
        throw new Error("Blog not found");
      }

      let similarBlogs = [];

      // Extract and clean keywords
      const words = blog.title
        .toLowerCase()
        .split(" ")
        .filter(w => w.length > 3)
        .map(w => w.trim());

      if (words.length > 0) {
        // Try AND conditions first
        const andConditions = words.map(word => ({
          [Op.or]: [
            { title: { [Op.iLike]: `%${word}%` } },
            { description: { [Op.iLike]: `%${word}%` } }
          ]
        }));

        similarBlogs = await models.Blogs.findAll({
          where: {
            status: true,
            id: { [Op.ne]: blog.id },
            [Op.and]: andConditions,
          },
          limit: 3,
          order: [["createdAt", "DESC"]],
        });

        // Fallback to OR conditions if needed
        if (similarBlogs.length < 3) {
          const orConditions = words.map(word => ({
            [Op.or]: [
              { title: { [Op.iLike]: `%${word}%` } },
              { description: { [Op.iLike]: `%${word}%` } }
            ]
          }));

          similarBlogs = await models.Blogs.findAll({
            where: {
              status: true,
              id: { [Op.ne]: blog.id },
              [Op.or]: orConditions,
            },
            limit: 3,
            order: [["createdAt", "DESC"]],
          });
        }
      }

      // Final fallback: just get recent blogs
      if (similarBlogs.length < 3) {
        const remainingLimit = 3 - similarBlogs.length;
        const excludeIds = [blog.id, ...similarBlogs.map(b => b.id)];

        const recentBlogs = await models.Blogs.findAll({
          where: {
            status: true,
            id: { [Op.notIn]: excludeIds },
          },
          limit: remainingLimit,
          order: [["createdAt", "DESC"]],
        });

        similarBlogs = [...similarBlogs, ...recentBlogs];
      }

      return {
        blog_details_section: this.buildBlogDetailSection(blog),
        similar_section: this.buildSimilarSection(similarBlogs),
        get_in_touch_section: this.buildGetInTouchDetailSection(cmsData),
      };
    } catch (error) {
      throw new Error(`Error fetching blog detail: ${error.message}`);
    }
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
