module.exports = {
  entity: "products",
  sheetName: "Products",
  templateVersion: 3, // v3: dropped all _ar columns (title_ar/short_description_ar/product_description_ar) — defaults to English
  model: "Products",
  columns: [
    { key: "title", header: "title", required: true, type: "text", example: "Standing Desk Pro" },
    { key: "category_slug", header: "category_slug", required: true, type: "ref", example: "office-furniture" },
    { key: "short_description", header: "short_description", required: true, type: "text", example: "" },
    { key: "product_description", header: "product_description", required: true, type: "text", example: "" },
    { key: "attribute_titles", header: "attribute_titles", required: false, type: "text", example: "Size,Color", notes: "Comma-separated, no spaces. Which attributes this product uses" },
    { key: "main_image", header: "main_image", required: true, type: "text", example: "products/abc.webp", notes: "Stored path from the Media bulk-upload step" },
    { key: "list_image", header: "list_image", required: false, type: "text", example: "", notes: "Falls back to main_image if blank" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 0, default: 0, example: "0" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
  ],
};
