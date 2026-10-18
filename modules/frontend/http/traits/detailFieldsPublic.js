const { BASE_URL } = require("../../../../constants");
const { articleRichText } = require("./sectionHelpers");

const absoluteUrl = (relativePath) => (relativePath ? `${BASE_URL}/${relativePath}` : null);

const mediaShape = (item) => {
  if (!item.media) return null;
  const media = item.media;
  return {
    kind: media.kind,
    url: absoluteUrl(media.location),
    thumbnail_url: absoluteUrl(media.thumbnail_location),
    mime_type: media.mime_type,
    alt_text: media.alt_text,
    alt_text_ar: media.alt_text_ar,
    title: media.title,
    title_ar: media.title_ar,
    description: media.description,
    description_ar: media.description_ar,
  };
};

const itemShape = (item) => ({
  id: item.id,
  sort_order: item.sort_order,
  // rich text is sanitised on the way out (the editor output is trusted only after this)
  text_content: item.text_content ? articleRichText(item.text_content) : item.text_content,
  text_content_ar: item.text_content_ar ? articleRichText(item.text_content_ar) : item.text_content_ar,
  media: mediaShape(item),
});

// Trims the resolver's richer admin-facing shape down to the public contract: hidden / empty
// fields are omitted (the admin needs to see and act on those; the public API never should).
const toPublicFields = (resolvedEntries) =>
  resolvedEntries
    .filter((entry) => entry.items.length > 0)
    .map((entry) => ({
      id: entry.field.id,
      slug: entry.field.slug,
      name: entry.field.name,
      name_ar: entry.field.name_ar ?? null,
      type: entry.field.type,
      allows_multiple: Boolean(entry.field.allows_multiple),
      source: entry.source,
      items: entry.items.map(itemShape),
    }));

module.exports = { toPublicFields, absoluteUrl };
