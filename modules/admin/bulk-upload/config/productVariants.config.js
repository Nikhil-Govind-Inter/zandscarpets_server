module.exports = {
  entity: "product-variants",
  sheetName: "Product Variants",
  templateVersion: 1,
  model: "ProductVariants",
  columns: [
    { key: "product_slug", header: "product_slug", required: true, type: "ref", example: "standing-desk-pro" },
    {
      key: "attribute_value_refs",
      header: "attribute_value_refs",
      required: true,
      type: "text",
      example: "Size=120cm;Color=Oak",
      notes: "Attribute=Value pairs separated by ;, one per attribute the product uses, any order",
    },
    { key: "label", header: "label", required: false, type: "text", example: "", notes: "Auto-generated from the resolved values if blank" },
    { key: "label_ar", header: "label_ar", required: false, type: "text", example: "" },
    { key: "sku", header: "sku", required: false, type: "text", example: "" },
    { key: "media_path", header: "media_path", required: false, type: "text", example: "", notes: "Stored path from the Media bulk-upload step (products-variants)" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 0, default: 0, example: "0" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
  ],
};
