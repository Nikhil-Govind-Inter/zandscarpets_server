const sanitizeHtml = require("sanitize-html");

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

// Adds `is_visible` so the client can skip a section: sections with a list need at least one item,
// text-only sections (premium, cta, side) need a title or description in either language.
const withVisibility = (section) => {
  const isVisible = Array.isArray(section.list)
    ? section.list.length > 0
    : ["title", "title_ar", "description", "description_ar"].some((key) => stripHtml(section[key]));
  return { ...section, is_visible: isVisible };
};

// Heading/description authored in a rich text editor ("<p>Line one<br>Line two</p>").
// They render inside <h1>/<h2>, so paragraphs become line breaks and only inline formatting
// (bold/italic/underline/line break/colour) is kept.
const inlineRichText = (html) =>
  sanitizeHtml(String(html ?? "").replace(/<\/p>\s*<p[^>]*>/gi, "<br>"), {
    allowedTags: ["br", "strong", "b", "em", "i", "u", "span"],
    allowedAttributes: { span: ["style"] },
    allowedStyles: { span: { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i] } },
  }).trim();

// Rich text rendered as a content block (paragraphs, lists, basic emphasis).
const blockRichText = (html) =>
  sanitizeHtml(String(html ?? ""), {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "span"],
    allowedAttributes: { span: ["style"] },
    allowedStyles: { span: { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i] } },
  })
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();

// Long-form article body written in the admin editor: headings, paragraphs, lists, quotes, links
// and images. Links get `rel="noopener noreferrer"` (and open in a new tab when external);
// classes, inline styles (except text colour) and scripts are dropped.
const articleRichText = (html) =>
  sanitizeHtml(String(html ?? ""), {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "span"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      span: ["style"],
    },
    allowedStyles: { span: { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i] } },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const { target, ...rest } = attribs;
        const external = /^https?:\/\//i.test(rest.href || "");
        return { tagName, attribs: { ...rest, rel: "noopener noreferrer", ...(external ? { target: "_blank" } : {}) } };
      },
    },
    // an image whose source was rejected (e.g. a data: URI) is dropped
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  })
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();

module.exports = { stripHtml, withVisibility, inlineRichText, blockRichText, articleRichText };
