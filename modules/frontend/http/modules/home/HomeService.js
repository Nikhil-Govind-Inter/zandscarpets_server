const sanitizeHtml = require("sanitize-html");
const { models } = require("../../../../../database/models");
const { link } = require("../../../routes/home");
const { singleMediaWithType, singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const MetaTagService = require("../metaTag/MetaTagService");

const orderedActive = { where: { is_active: true }, order: [["sort_order", "ASC"]] };
const homeBannerAttributes = [
  "id",
  "title",
  "title_ar",
  "description",
  "description_ar",
  "media_type",
  "media_path",
  "thumbnail",
  "media_alt",
  "media_alt_ar",
  "sort_order",
  "is_active",
];
const commonMilestonesAttributes = [
  "id",
  "media_path",
  "media_alt",
  "media_alt_ar",
  "value",
  "value_ar",
  "label",
  "label_ar",
  "sort_order",
  "is_active",
  "show_in_home",
];

const homeCategoryAttributes = ["id", "slug", "title", "title_ar", "media_path", "sort_order"];

const homeIndustryAttributes = ["id", "slug", "title", "title_ar", "description", "description_ar", "sort_order"];
const industryCategoryAttributes = ["id", "slug", "title", "title_ar", "media_path", "sort_order"];

const homeTestimonialAttributes = [
  "id",
  "profile_media_path",
  "name",
  "name_ar",
  "designation",
  "designation_ar",
  "message",
  "message_ar",
  "sort_order",
];

const homeBrandAttributes = ["id", "media_path", "media_alt", "media_alt_ar", "sort_order"];

const homeFaqAttributes = ["id", "question", "question_ar", "answer", "answer_ar", "sort_order"];
const homeSideImageAttributes = [
  "id",
  "before_media_path",
  "after_media_path",
  "before_media_alt",
  "before_media_alt_ar",
  "after_media_alt",
  "after_media_alt_ar",
  "sort_order",
];

const commonListAttributes = ["id", "title", "title_ar", "description", "description_ar", "sort_order"];

const homeProductAttributes = [
  "id",
  "slug",
  "title",
  "title_ar",
  "short_description",
  "short_description_ar",
  "price",
  "list_media_path",
  "list_media_alt",
  "list_media_alt_ar",
  "sort_order",
];

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

// Adds `is_visible` so the client can skip a section: sections with a list need at least one item,
// text-only sections (premium, cta, side) need a title or description in either language.
const withVisibility = (section) => {
  const isVisible = Array.isArray(section.list)
    ? section.list.length > 0
    : ["title", "title_ar", "description", "description_ar"].some((key) => stripHtml(section[key]));
  return { ...section, is_visible: isVisible };
};

// Banner heading/description are authored in a rich text editor ("<p>Line one<br>Line two</p>").
// They render inside <h1>/<h2>, so paragraphs become line breaks and only inline formatting
// (bold/italic/underline/line break/colour) is kept.
const inlineRichText = (html) =>
  sanitizeHtml(String(html ?? "").replace(/<\/p>\s*<p[^>]*>/gi, "<br>"), {
    allowedTags: ["br", "strong", "b", "em", "i", "u", "span"],
    allowedAttributes: { span: ["style"] },
    allowedStyles: { span: { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i] } },
  }).trim();

class HomeService {
  static async index() {
    const [cmsData, commonContent] = await Promise.all([models.HomeCms.findOne({}), models.CommonContent.findOne({})]);
    if (!cmsData) {
      throw new Error("No CMS data found for About page");
    }
    const [
      homeBanners = [],
      milestones = [],
      homeCategories = [],
      industries = [],
      testimonials = [],
      brands = [],
      faqs = [],
      sideImages = [],
      features = [],
      howItWorks = [],
      residentialProducts = [],
      otherMeta,
    ] = await Promise.all([
      models.HomeBanner.findAll({
        ...orderedActive,
        attributes: homeBannerAttributes,
        include: [
          {
            model: models.Industry,
            as: "industry",
            attributes: ["id", "slug", "title", "title_ar", "link"],
            where: { is_active: true },
            required: true,
          },
        ],
      }),
      models.CommonMilestones.findAll({
        attributes: commonMilestonesAttributes,
        where: { is_active: true, show_in_home: true },
        order: [["sort_order", "ASC"]],
      }),
      models.ProductCategories.findAll({
        attributes: homeCategoryAttributes,
        where: { is_active: true, show_in_home: true },
        order: [["sort_order", "ASC"]],
      }),
      models.Industry.findAll({
        attributes: homeIndustryAttributes,
        where: { is_active: true },
        include: [
          {
            model: models.ProductCategories,
            as: "categories",
            attributes: industryCategoryAttributes,
            where: { is_active: true },
            required: false,
            through: { attributes: [] },
          },
        ],
        order: [
          ["sort_order", "ASC"],
          [{ model: models.ProductCategories, as: "categories" }, "sort_order", "ASC"],
        ],
      }),
      models.HomeTestimonials.findAll({ ...orderedActive, attributes: homeTestimonialAttributes }),
      models.HomeBrands.findAll({ ...orderedActive, attributes: homeBrandAttributes }),
      models.Faqs.findAll({
        attributes: homeFaqAttributes,
        where: { is_active: true, product_id: null },
        order: [["sort_order", "ASC"]],
      }),
      models.HomeSideImages.findAll({ ...orderedActive, attributes: homeSideImageAttributes }),
      models.CommonFeatures.findAll({ ...orderedActive, attributes: commonListAttributes }),
      models.CommonHowItWorks.findAll({ ...orderedActive, attributes: commonListAttributes }),
      models.Products.findAll({
        attributes: homeProductAttributes,
        where: { is_active: true, show_in_home: true },
        include: [{ model: models.ProductLabels, as: "badge", attributes: ["id", "slug", "title", "title_ar"], required: false }],
        order: [["sort_order", "ASC"]],
      }),
      MetaTagService.getOtherMetaForPage("home"),
    ]);

    const sections = {
      banner_section: this.buildBannerSection(homeBanners),
      milestones_section: this.buildMilestonesSection(milestones),
      discover_section: this.buildCategoriesSection(cmsData, homeCategories),
      industries_section: this.buildIndustriesSection(industries),
      testimonials_section: this.buildTestimonialsSection(testimonials, cmsData),
      brands_section: this.buildBrandsSection(brands, cmsData),
      faqs_section: this.buildFaqsSection(faqs, cmsData),
      side_images_section: this.buildSideImagesSection(sideImages),
      premium_section: this.buildPremiumSection(cmsData),
      features_section: this.buildFeaturesSection(features, commonContent),
      side_section: this.buildSideSection(commonContent),
      how_it_works_section: this.buildHowItWorksSection(howItWorks, commonContent),
      residential_section: this.buildResidentialSection(residentialProducts, cmsData),
      cta_section: this.buildCtaSection(cmsData),
    };

    return {
      other_meta: otherMeta.other_meta,
      other_meta_ar: otherMeta.other_meta_ar,
      ...Object.fromEntries(Object.entries(sections).map(([key, section]) => [key, withVisibility(section)])),
    };
  }

  static buildBannerSection(homeBanners) {
    console.log(
      "homeBanners",
      (homeBanners ?? []).map((b) => ({
        title: b.title,
        title_ar: b.title_ar,
        industry: b.industry
          ? { id: b.industry.id, slug: b.industry.slug, title: b.industry.title, title_ar: b.industry.title_ar, link: b.industry.link }
          : null,
      })),
    );

    return {
      list: homeBanners.map((item) => ({
        id: item?.id,
        title: inlineRichText(item?.title),
        title_ar: inlineRichText(item?.title_ar),
        description: inlineRichText(item?.description),
        description_ar: inlineRichText(item?.description_ar),
        media: singleMediaWithType(item, "media_type", "media_path", "media_alt", "media_alt_ar"),
        thumbnail: singleMediaWithoutType(item, "thumbnail", "media_alt", "media_alt_ar"),
        industry: item?.industry
          ? {
              id: item.industry.id,
              slug: item.industry.slug,
              title: item.industry.title ?? "",
              title_ar: item.industry.title_ar ?? "",
              link: item.industry.link ?? "",
            }
          : null,
      })),
    };
  }

  static buildMilestonesSection(milestones) {
    return {
      list: milestones.map((item) => ({
        id: item?.id,
        value: item?.value ?? "",
        value_ar: item?.value_ar ?? "",
        label: item?.label ?? "",
        label_ar: item?.label_ar ?? "",
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }

  static buildCategoriesSection(cmsData, homeCategories) {
    return {
      title: cmsData?.discover_title ?? "",
      title_ar: cmsData?.discover_title_ar ?? "",
      list: homeCategories.map((item) => ({
        id: item?.id,
        slug: item?.slug ?? "",
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        link: `products?category=${item?.slug}`,
        media: singleMediaWithoutType(item, "media_path"),
      })),
    };
  }

  static buildIndustriesSection(industries) {
    return {
      list: industries.map((item) => ({
        id: item?.id,
        slug: item?.slug ?? "",
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        description: item?.description ?? "",
        description_ar: item?.description_ar ?? "",
        link: item?.link ?? "",
        categories: (item?.categories ?? []).map((cat) => ({
          id: cat?.id,
          slug: cat?.slug ?? "",
          title: cat?.title ?? "",
          title_ar: cat?.title_ar ?? "",
          media: singleMediaWithoutType(cat, "media_path"),
        })),
      })),
    };
  }

  static buildTestimonialsSection(testimonials, cmsData) {
    return {
      title: cmsData?.testimonial_title ?? "",
      title_ar: cmsData?.testimonial_title_ar ?? "",
      list: testimonials.map((item) => ({
        id: item?.id,
        name: item?.name ?? "",
        name_ar: item?.name_ar ?? "",
        designation: item?.designation ?? "",
        designation_ar: item?.designation_ar ?? "",
        message: item?.message ?? "",
        message_ar: item?.message_ar ?? "",
        profile: singleMediaWithoutType(item, "profile_media_path"),
      })),
    };
  }

  static buildBrandsSection(brands, cmsData) {
    return {
      title: cmsData?.brand_title ?? "",
      title_ar: cmsData?.brand_title_ar ?? "",
      list: brands.map((item) => ({
        id: item?.id,
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }

  static buildFaqsSection(faqs, cmsData) {
    return {
      title: cmsData?.faq_title ?? "",
      title_ar: cmsData?.faq_title_ar ?? "",
      list: faqs.map((item) => ({
        id: item?.id,
        question: item?.question ?? "",
        question_ar: item?.question_ar ?? "",
        answer: item?.answer ?? "",
        answer_ar: item?.answer_ar ?? "",
      })),
    };
  }

  static buildSideImagesSection(sideImages) {
    return {
      list: sideImages.map((item) => ({
        id: item?.id,
        before: singleMediaWithoutType(item, "before_media_path", "before_media_alt", "before_media_alt_ar"),
        after: singleMediaWithoutType(item, "after_media_path", "after_media_alt", "after_media_alt_ar"),
      })),
    };
  }

  static buildPremiumSection(cmsData) {
    return {
      title: cmsData?.premium_title ?? "",
      title_ar: cmsData?.premium_title_ar ?? "",
      description: cmsData?.premium_description ?? "",
      description_ar: cmsData?.premium_description_ar ?? "",
    };
  }

  static buildFeaturesSection(features, commonContent) {
    return {
      title: commonContent?.why_choose_title ?? "",
      title_ar: commonContent?.why_choose_title_ar ?? "",
      list: features.map((item) => ({
        id: item?.id,
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        description: item?.description ?? "",
        description_ar: item?.description_ar ?? "",
      })),
    };
  }

  static buildHowItWorksSection(howItWorks, commonContent) {
    return {
      title: commonContent?.how_section_title ?? "",
      title_ar: commonContent?.how_section_title_ar ?? "",
      list: howItWorks.map((item) => ({
        id: item?.id,
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        description: item?.description ?? "",
        description_ar: item?.description_ar ?? "",
      })),
    };
  }

  static buildSideSection(commonContent) {
    return {
      title: commonContent?.side_section_title ?? "",
      title_ar: commonContent?.side_section_title_ar ?? "",
      description: commonContent?.side_section_description ?? "",
      description_ar: commonContent?.side_section_description_ar ?? "",
      button: {
        text: commonContent?.button_text ?? "",
        text_ar: commonContent?.button_text_ar ?? "",
        link: commonContent?.button_link ?? "#",
      },
    };
  }

  static buildCtaSection(cmsData) {
    return {
      title: cmsData?.cta_title ?? "",
      title_ar: cmsData?.cta_title_ar ?? "",
      description: cmsData?.cta_description ?? "",
      description_ar: cmsData?.cta_description_ar ?? "",
      media: singleMediaWithoutType(cmsData, "cta_media_path"),
    };
  }

  static buildResidentialSection(products, cmsData) {
    return {
      title: cmsData?.residential_title ?? "",
      title_ar: cmsData?.residential_title_ar ?? "",
      list: products.map((item) => ({
        id: item?.id,
        slug: item?.slug ?? "",
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        short_description: item?.short_description ?? "",
        short_description_ar: item?.short_description_ar ?? "",
        price: item?.price ?? null,
        media: singleMediaWithoutType(item, "list_media_path", "list_media_alt", "list_media_alt_ar"),
        badge: item?.badge ? { id: item.badge.id, slug: item.badge.slug, title: item.badge.title, title_ar: item.badge.title_ar } : null,
      })),
    };
  }
}

module.exports = HomeService;
