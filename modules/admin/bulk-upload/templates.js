// Builds the downloadable .xlsx template for a given entity config: a Data
// sheet (header + example row), an Instructions sheet generated from the
// same config (spec §6: "generate it from the same config that drives the
// validators"), a Reference sheet of current valid values where relevant,
// and a hidden Meta sheet holding the template version parser.js checks on
// upload.

const ExcelJS = require("exceljs");

const TYPE_LABELS = {
  text: "Text",
  slug: "Text (lowercase, hyphens only)",
  ref: "Text — must match an existing value exactly",
  int: "Whole number",
  bool: "TRUE / FALSE",
};

function buildInstructionsSheet(workbook, config) {
  const sheet = workbook.addWorksheet("Instructions");
  sheet.columns = [
    { header: "Column", key: "column", width: 22 },
    { header: "Required", key: "required", width: 12 },
    { header: "Type", key: "type", width: 40 },
    { header: "Notes", key: "notes", width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  config.columns.forEach((col) => {
    sheet.addRow({
      column: col.header,
      required: col.required ? "Yes" : "No",
      type: TYPE_LABELS[col.type] || "Text",
      notes: col.notes || "",
    });
  });
}

function buildReferenceSheet(workbook, referenceData) {
  if (!referenceData || Object.keys(referenceData).length === 0) return;
  const sheet = workbook.addWorksheet("Reference");
  let colIndex = 1;
  Object.entries(referenceData).forEach(([label, values]) => {
    const col = sheet.getColumn(colIndex);
    col.width = 28;
    sheet.getCell(1, colIndex).value = label;
    sheet.getCell(1, colIndex).font = { bold: true };
    values.forEach((value, i) => {
      sheet.getCell(i + 2, colIndex).value = value;
    });
    colIndex += 1;
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function buildDataSheet(workbook, config) {
  const sheet = workbook.addWorksheet(config.sheetName);
  sheet.columns = config.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: Math.max(18, col.header.length + 4),
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell, colNumber) => {
    const col = config.columns[colNumber - 1];
    if (col?.required) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE9D9" } };
    }
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  // Example row, greyed/italic, skip-marker in the first column per spec §6.
  const exampleValues = {};
  config.columns.forEach((col, i) => {
    exampleValues[col.key] = i === 0 ? `EXAMPLE — ${col.example || ""}` : col.example || "";
  });
  const exampleRow = sheet.addRow(exampleValues);
  exampleRow.eachCell((cell) => {
    cell.font = { italic: true, color: { argb: "FF888888" } };
  });

  // TRUE/FALSE dropdown validation on boolean columns, applied down a
  // generous number of rows so pasted-in data still gets the dropdown.
  config.columns.forEach((col, i) => {
    if (col.type !== "bool") return;
    const colLetter = sheet.getColumn(i + 1).letter;
    for (let r = 2; r <= 1000; r += 1) {
      sheet.getCell(`${colLetter}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"TRUE,FALSE"'],
      };
    }
  });

  // Text format on slug-like columns so Excel doesn't mangle leading zeros.
  config.columns.forEach((col, i) => {
    if (col.type !== "slug") return;
    const colLetter = sheet.getColumn(i + 1).letter;
    sheet.getColumn(i + 1).numFmt = "@";
  });
}

function buildMetaSheet(workbook, config) {
  const sheet = workbook.addWorksheet("Meta", { state: "veryHidden" });
  sheet.getCell("A1").value = "TemplateVersion";
  sheet.getCell("B1").value = config.templateVersion;
}

// referenceData: optional { "Industry slugs": [...], "Existing category slugs": [...] }
async function buildTemplate(config, referenceData) {
  const workbook = new ExcelJS.Workbook();
  buildDataSheet(workbook, config);
  buildInstructionsSheet(workbook, config);
  buildReferenceSheet(workbook, referenceData);
  buildMetaSheet(workbook, config);
  return workbook.xlsx.writeBuffer();
}

module.exports = { buildTemplate };
