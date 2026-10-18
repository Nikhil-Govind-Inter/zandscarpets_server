// The admin pastes the "Embed a map" snippet from Google Maps: a full <iframe ...> tag, part of
// one, or just the link. Find the Google Maps embed URL anywhere in the value and ignore the rest.
const MAP_EMBED_URL = /https:\/\/www\.google\.com\/maps\/embed[^\s"'<>]*/i;

const extractMapEmbedUrl = (value) => {
  const match = String(value ?? "")
    .replace(/&amp;/g, "&")
    .match(MAP_EMBED_URL);
  return match ? match[0] : "";
};

module.exports = { extractMapEmbedUrl };
