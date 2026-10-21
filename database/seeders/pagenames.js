const PAGE_NAMES = [
  { label: "Home", slug: "home" },
  { label: "About", slug: "about" },
  { label: "Services", slug: "services" },
  { label: "Contact", slug: "contact" },
  { label: "Blogs", slug: "blogs" },
  { label: "Downloads", slug: "downloads" },
  { label: "Privacy Policy", slug: "privacy-policy" },
  { label: "Our Work", slug: "our-work" },
];

const PAGE_NAME_SLUGS = PAGE_NAMES.map((p) => p.slug);

module.exports = { PAGE_NAMES, PAGE_NAME_SLUGS };
