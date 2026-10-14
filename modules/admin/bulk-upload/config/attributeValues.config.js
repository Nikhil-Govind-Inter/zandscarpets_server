module.exports = {
  entity: "attribute-values",
  sheetName: "Attribute Values",
  templateVersion: 2, // v2: dropped value_ar/media_alt_ar — default to value/media_alt
  model: "AttributeValues",
  columns: [
    { key: "attribute_title", header: "attribute_title", required: true, type: "ref", example: "Size" },
    { key: "value", header: "value", required: false, type: "text", example: "120cm", notes: "Required for text/color attributes" },
    { key: "media_path", header: "media_path", required: false, type: "text", example: "", notes: "Stored path from the Media bulk-upload step. Required for icon attributes; optional photo mode for color attributes" },
    { key: "media_alt", header: "media_alt", required: false, type: "text", example: "" },
    { key: "color_code", header: "color_code", required: false, type: "text", example: "", notes: "#RRGGBB — only for color attributes without a photo" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 1, default: 1, example: "1" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
  ],
};
