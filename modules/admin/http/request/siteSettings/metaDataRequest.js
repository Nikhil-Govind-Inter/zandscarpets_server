const {body, param} = require("express-validator");
const { PAGE_NAME_SLUGS } = require("../../../../../database/seeders/pagenames");

const TYPES = ["page", "product", "product-variant", "blog", "project"];

const isBlank = (value) => value === undefined || value === null || value === "";

const validationRequestPost = [
    // required fields
    body("meta_title").notEmpty().withMessage("Meta title is required").isString().withMessage("Meta title must be a string"),
    body("meta_title_ar").optional({ values: "null" }).isString().withMessage("Arabic meta title must be a string"),
    body("meta_description").notEmpty().withMessage("Meta description is required").isString().withMessage("Meta description must be a string"),
    body("meta_description_ar").optional({ values: "null" }).isString().withMessage("Arabic meta description must be a string"),
    body("meta_keywords").notEmpty().withMessage("Meta keywords is required").isString().withMessage("Meta keywords must be a string"),
    body("meta_keywords_ar").optional({ values: "null" }).isString().withMessage("Arabic meta keywords must be a string"),

    // target discriminator + exactly one target column matching the type
    body("type")
        .isIn(TYPES)
        .withMessage("Type must be one of: page, product, product-variant, blog, project")
        .custom((type, { req }) => {
            const { page_name, product_id, variant_id, blog_id, project_id } = req.body;
            const targets = [page_name, product_id, variant_id, blog_id, project_id].filter((v) => !isBlank(v));
            if (targets.length !== 1) {
                throw new Error("Exactly one of page_name, product_id, variant_id, blog_id or project_id must be set");
            }
            if (type === "page" && isBlank(page_name)) {
                throw new Error("Type 'page' requires page_name");
            }
            if (type === "product" && isBlank(product_id)) {
                throw new Error("Type 'product' requires product_id");
            }
            if (type === "product-variant" && isBlank(variant_id)) {
                throw new Error("Type 'product-variant' requires variant_id");
            }
            if (type === "blog" && isBlank(blog_id)) {
                throw new Error("Type 'blog' requires blog_id");
            }
            if (type === "project" && isBlank(project_id)) {
                throw new Error("Type 'project' requires project_id");
            }
            return true;
        }),
    body("page_name")
        .if((value, { req }) => req.body.type === "page")
        .isString()
        .withMessage("Page name must be a string")
        .custom((value) => PAGE_NAME_SLUGS.includes(value))
        .withMessage("Page name is not a recognised page"),
    body("product_id")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("Product id must be a positive integer"),
    body("variant_id")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("Variant id must be a positive integer"),
    body("blog_id")
        .if((value, { req }) => req.body.type === "blog")
        .isString()
        .withMessage("Blog id must be a string")
        .trim()
        .isLength({ min: 1, max: 191 })
        .withMessage("Blog id must be between 1 and 191 characters"),
    body("project_id")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("Project id must be a positive integer"),

    // Freeform SEO extras — plain string check only, deliberately no HTML/tag
    // stripping or escaping.
    body("other_meta").optional({ values: "null" }).isString().withMessage("Other meta must be a string"),
    body("other_meta_ar").optional({ values: "null" }).isString().withMessage("Arabic other meta must be a string"),
];

const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
    validationRequestPost,
    validateId,
};