// Shared resolution helpers used by the Products/ProductVariants/
// AttributeValues validators: media-path checks against the real uploads
// folders, and the same combination_key algorithm variantsController.js
// already uses for manually-created variants.

const fs = require("fs");
const path = require("path");

const ALLOWED_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);

// Mirrors buildCombinationKey() in
// modules/admin/http/controllers/products/variantsController.js — bulk and
// manually created variants must be indistinguishable.
const buildCombinationKey = (valueIds) =>
  valueIds.map(Number).sort((a, b) => a - b).join("-");

// Mirrors buildLabel() in variantsController.js — joins each resolved
// attribute value's chosen field, dropping blanks, with " / ".
const buildLabel = (values, field) =>
  values
    .map((v) => v[field])
    .filter((v) => v && String(v).trim())
    .join(" / ");

// Mirrors cartesian() in variantsController.js — [[a,b],[1,2]] ->
// [[a,1],[a,2],[b,1],[b,2]]. Used by Product Main's generate_variants.
const cartesian = (lists) =>
  lists.reduce((acc, list) => acc.flatMap((combo) => list.map((value) => [...combo, value])), [[]]);

// Validates a stored path like "uploads/products/abc.webp" against the
// folder it's supposed to live in (blocks "../" and wrong-folder paths —
// spec §8) and that the file actually exists on disk.
const resolveMediaPath = (storedPath, expectedFolder) => {
  if (!storedPath || typeof storedPath !== "string") {
    return { ok: false, reason: "missing" };
  }
  const expectedPrefix = `uploads/${expectedFolder}/`;
  if (!storedPath.startsWith(expectedPrefix)) {
    return { ok: false, reason: "wrong_folder" };
  }
  const ext = path.extname(storedPath).toLowerCase();
  if (!ALLOWED_IMAGE_EXT.has(ext)) {
    return { ok: false, reason: "bad_extension" };
  }
  const fullPath = path.join(process.cwd(), storedPath);
  if (!fs.existsSync(fullPath)) {
    return { ok: false, reason: "not_found" };
  }
  return { ok: true };
};

module.exports = { buildCombinationKey, buildLabel, cartesian, resolveMediaPath };
