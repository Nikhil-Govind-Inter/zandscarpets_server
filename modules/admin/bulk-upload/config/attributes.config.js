module.exports = {
  entity: "attributes",
  sheetName: "Attributes",
  templateVersion: 2, // v2: dropped title_ar — defaults to title
  model: "Attributes",
  columns: [
    { key: "title", header: "title", required: true, type: "text", example: "Size" },
    { key: "type", header: "type", required: true, type: "ref", example: "text", notes: "One of: text, icon, color" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 1, default: 1, example: "1" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
  ],
};
