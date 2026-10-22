const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// Subjects go into a mail header, so a submitted name must never inject a line break.
const oneLine = (value) => String(value ?? "").replace(/[\r\n]+/g, " ");

const formatDateTime = (value) =>
  new Date(value || Date.now()).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

module.exports = { escapeHtml, oneLine, formatDateTime };
