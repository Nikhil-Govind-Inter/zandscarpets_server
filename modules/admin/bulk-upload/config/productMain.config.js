// "Product Main Upload" — one row spans Category (levels) -> Attribute(s) ->
// Attribute Value(s) -> Product -> its SEO meta data, auto-creating
// whichever of those don't already exist. No price column. See
// productMainValidator.js for exactly how attribute/value auto-creation
// handles the three attribute types (text/color/icon), and for how the
// Category/Sub-Category columns and the Attributes/Values columns pair up.
//
// v7: redesigned for a non-technical client — category_path's ">" syntax
// became 3 plain columns, attribute_value_refs's "Attribute=Value" syntax
// became 2 plain columns, has_attributes/generate_variants were dropped
// (inferred from whether the attribute columns are filled in; variants are
// now always generated whenever attribute data is present), and
// main_image/list_image/sort_order/is_active were removed (hardcoded
// defaults — image is added later via the product's edit screen).
//
// v8: added Tags/Specifications (v9: Features too) — comma-separated label
// names (the shared ProductLabels master table, discriminated by type),
// auto-created if missing, attached on create only. See
// productMainValidator.js/importer.js.
//
// v10: dropped industry_slug — categories are no longer tied to an industry,
// so the category chain is resolved by title/parent only.
//
// v11: reconciled with the client's own reorganized sheet — `title` moved
// to column A, duplicate attribute name/value (previously silently
// de-duped) are now errors, the variant-count cap became a non-blocking
// warning at 100 (was a hard error at 200), placeholder text ("if any") in
// the sub-category columns is auto-ignored, and a same-title-anywhere-in-
// sheet warning was added. See productMainValidator.js.
//
// v12: added title_ar/short_description_ar/product_description_ar/
// meta_title_ar/meta_description_ar/meta_keywords_ar, each directly after
// its English counterpart. All optional — a blank one still defaults to
// the English value, same as before this version; filling it in overrides
// that default. (Unlike this sheet, the Categories/Attributes/Attribute
// Values/Products sheets intentionally still have no _ar columns.)

module.exports = {
  entity: "product-main",
  sheetName: "Product Main",
  templateVersion: 12,
  model: "Products",
  columns: [
    { key: "title", header: "title", required: true, type: "text", example: "Wood Pattern Vinyl" },
    {
      key: "title_ar",
      header: "title_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic title. Leave blank to default to title",
    },
    {
      key: "category",
      header: "Category",
      required: true,
      type: "text",
      example: "Vinyl Flooring",
      notes: "The main category this product belongs to. Created automatically if it doesn't exist yet",
    },
    {
      key: "sub_category_1",
      header: "Sub-Category 1",
      required: false,
      type: "text",
      example: "",
      notes: "Leave truly blank if this product has no sub-category — don't type \"if any\" or similar, it's ignored automatically. Created automatically under Category if it doesn't exist yet",
    },
    {
      key: "sub_category_2",
      header: "Sub-Category 2",
      required: false,
      type: "text",
      example: "",
      notes: "Leave truly blank if not needed — don't type \"if any\" or similar, it's ignored automatically. Only fill this in if Sub-Category 1 is also filled in",
    },
    {
      key: "attribute_names",
      header: "Attributes (e.g. Size, Color)",
      required: false,
      type: "text",
      example: "Size;Color",
      notes: "List each attribute/option this product has, separated by ; . Leave this and the next column blank if this product has no options",
    },
    {
      key: "attribute_values",
      header: "Values for Each Attribute",
      required: false,
      type: "text",
      example: "S - 90 cm,M - 120cm,L - 150 cm,XL - 180 cm;267-7,551223,555202,555204",
      notes:
        "One value-group per attribute listed in the previous column, in the same order, separated by ; . If an attribute has more than one value, separate them with , — a variant is created for every combination. To set a brand-new color's hex code, add |#RRGGBB after its value (e.g. Oak|#8B5A2B); without a hex code anywhere, the attribute is created as plain text (e.g. the example's Color values are just product codes, which is fine). A value can't itself contain a comma — known limitation.",
    },
    {
      key: "features",
      header: "Features",
      required: false,
      type: "text",
      example: "Self-Adhesive,Quick Install",
      notes: "Comma-separated feature names. Created automatically if they don't exist yet. Leave blank for none",
    },
    {
      key: "tags",
      header: "Tags",
      required: false,
      type: "text",
      example: "Wooden Pattern,PVC sheet mat,Vinyl,Synthetic floor,Waterproof,Anti-slip",
      notes: "Comma-separated tag names. Created automatically if they don't exist yet. Leave blank for none",
    },
    {
      key: "specifications",
      header: "Specifications",
      required: false,
      type: "text",
      example: "Waterproof,Easy to Maintain,Easy installation,Extreme Durability,Moisture Resistant,Anti-Slip",
      notes: "Comma-separated specification names. Created automatically if they don't exist yet. Leave blank for none",
    },
    {
      key: "short_description",
      header: "short_description",
      required: true,
      type: "text",
      example: "Self adhesive wood pattern vinyl, 1.5mm thick, for quick and simple redecorating",
    },
    {
      key: "short_description_ar",
      header: "short_description_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic short description. Leave blank to default to short_description",
    },
    {
      key: "product_description",
      header: "product_description",
      required: true,
      type: "text",
      example:
        "Self adhesive Wood Pattern Vinyl - 1.5mm is a quick and simple solution to redecorate a space with professional-looking results. Wood effect vinyl floor planks mimic the appearance of real hardwood at a fraction of the price.",
    },
    {
      key: "product_description_ar",
      header: "product_description_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic product description. Leave blank to default to product_description",
    },
    { key: "meta_title", header: "meta_title", required: true, type: "text", example: "Wood Pattern Vinyl | Self Adhesive Vinyl Flooring" },
    {
      key: "meta_title_ar",
      header: "meta_title_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic meta title. Leave blank to default to meta_title",
    },
    {
      key: "meta_description",
      header: "meta_description",
      required: true,
      type: "text",
      example: "Self adhesive wood pattern vinyl flooring, 1.5mm. Waterproof, anti-slip and easy to install, with a realistic hardwood look.",
    },
    {
      key: "meta_description_ar",
      header: "meta_description_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic meta description. Leave blank to default to meta_description",
    },
    {
      key: "meta_keywords",
      header: "meta_keywords",
      required: true,
      type: "text",
      example: "wood pattern vinyl,vinyl flooring,self adhesive vinyl,waterproof flooring,anti-slip floor",
      notes: "Comma-separated keywords",
    },
    {
      key: "meta_keywords_ar",
      header: "meta_keywords_ar",
      required: false,
      type: "text",
      example: "",
      notes: "Arabic meta keywords, comma-separated. Leave blank to default to meta_keywords",
    },
  ],
};
