// "Product Main Upload" — one row spans Category (path) -> Attribute(s) ->
// Attribute Value(s) -> Product -> its SEO meta data, auto-creating
// whichever of those don't already exist. No price column. See
// productMainValidator.js for exactly how attribute/value auto-creation
// handles the three attribute types (text/color/icon).

module.exports = {
  entity: "product-main",
  sheetName: "Product Main",
  templateVersion: 6, // v6: attribute_value_refs accepts a comma-list of values per attribute; added generate_variants gate
  model: "Products",
  columns: [
    { key: "industry_slug", header: "industry_slug", required: true, type: "ref", example: "home-interiors" },
    {
      key: "category_path",
      header: "category_path",
      required: true,
      type: "text",
      example: "Flooring > Vinyl Flooring",
      notes: "Separate each level with >. Any level that doesn't exist yet is created automatically under the one before it",
    },
    {
      key: "has_attributes",
      header: "has_attributes",
      required: false,
      type: "bool",
      default: false,
      example: "FALSE",
      notes: "Set TRUE to process attribute_value_refs for this row. Leave FALSE (or blank) if this product has no attributes",
    },
    {
      key: "attribute_value_refs",
      header: "attribute_value_refs",
      required: false,
      type: "text",
      example: "Size=120cm,140cm;Color=Oak|#8B5A2B,Black|#000000",
      notes:
        "Only processed when has_attributes is TRUE. Attribute=Value pairs separated by ;, with one or more comma-separated values per attribute (e.g. Size=120cm,140cm). An unknown attribute is created as type \"text\", unless a value has a |#RRGGBB suffix, which creates it as type \"color\". An unknown value under an existing color or icon attribute is created from the text alone (as its name) even without a hex/photo — add the hex code (or upload a photo/icon image) afterward via the Attribute Values screen if you don't supply one now. Set generate_variants to TRUE to create every combination of the listed values as variants",
    },
    {
      key: "generate_variants",
      header: "generate_variants",
      required: false,
      type: "bool",
      default: false,
      example: "FALSE",
      notes:
        "Set TRUE to generate every combination of attribute_value_refs' values (e.g. 2 colors x 3 sizes = 6 variants) as this product's variants. Requires has_attributes = TRUE. Generated variants have no SKU/media/custom label — adjust those afterward via Manage Variants. Capped at 200 combinations per row",
    },
    { key: "title", header: "title", required: true, type: "text", example: "Standing Desk Pro" },
    { key: "short_description", header: "short_description", required: true, type: "text", example: "" },
    { key: "product_description", header: "product_description", required: true, type: "text", example: "" },
    { key: "main_image", header: "main_image", required: true, type: "text", example: "products/abc.webp", notes: "Stored path from the Media bulk-upload step" },
    { key: "list_image", header: "list_image", required: false, type: "text", example: "", notes: "Falls back to main_image if blank" },
    { key: "meta_title", header: "meta_title", required: true, type: "text", example: "" },
    { key: "meta_description", header: "meta_description", required: true, type: "text", example: "" },
    { key: "meta_keywords", header: "meta_keywords", required: true, type: "text", example: "", notes: "Comma-separated keywords" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 0, default: 0, example: "0" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
  ],
};
