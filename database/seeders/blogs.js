const fs = require("fs");
const path = require("path");
const { models, sequelize } = require("../models");

/**
 * Seeds the sample blog content that used to live in the storefront dictionaries
 * (`messages/{en,ar}.json` -> `Blogs.Items`): 4 posts with their tags, categories, hero and gallery
 * images, plus the blog page headings. Safe to run again (existing slugs / tags are left alone).
 *
 *   node database/seeders/blogs.js
 */
const STOREFRONT = path.resolve(__dirname, "../../../z_and_s_carpets_website");
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/blogs");

const readItems = (lang) =>
  JSON.parse(fs.readFileSync(path.join(STOREFRONT, "messages", `${lang}.json`), "utf8")).Blogs.Items;

// the storefront image `/images/x.webp` -> uploads/blogs/seed-x.webp (relative path as the API stores it)
const copyImage = (publicPath) => {
  const file = path.basename(publicPath);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.copyFileSync(path.join(STOREFRONT, "public", publicPath), path.join(UPLOAD_DIR, `seed-${file}`));
  return `uploads/blogs/seed-${file}`;
};

const TAGS = [
  ["Laminate Flooring", "أرضيات لامينيت"],
  ["Scratch Resistance", "مقاومة الخدوش"],
  ["Wear Layer", "طبقة التآكل"],
  ["Flooring Guide", "دليل الأرضيات"],
  ["Dubai", "دبي"],
  ["Interior Design", "التصميم الداخلي"],
  ["Home Improvement", "تحسين المنزل"],
  ["Flooring Tips", "نصائح الأرضيات"],
  ["Maintenance", "الصيانة"],
];

// post id (the old dictionary key) -> publish date, categories (product category slugs), tags
const POSTS = {
  "outdoor-flooring-dubai": {
    published: "2025-11-10T10:00:00Z",
    categories: ["deck-flooring", "artificial-grass"],
    tags: ["Dubai", "Flooring Guide", "Interior Design", "Home Improvement"],
  },
  "laminate-scratch-resistance": {
    published: "2025-10-16T10:00:00Z",
    categories: ["laminate-flooring"],
    tags: TAGS.map(([title]) => title),
    content: true,
  },
  "carpets-heritage": {
    published: "2025-08-02T10:00:00Z",
    categories: ["carpet-flooring"],
    tags: ["Flooring Guide", "Interior Design", "Home Improvement"],
  },
  "flooring-suppliers": {
    published: "2025-03-28T10:00:00Z",
    categories: ["vinyl-flooring", "spc-flooring"],
    tags: ["Dubai", "Flooring Tips", "Flooring Guide"],
  },
};

// The long article that was hardcoded on the details page, as the editor's HTML
const LAMINATE_ARTICLE = `
<p>A floor isn't merely a surface to be trodden upon; it's the silent canvas that anchors the entire narrative of a curated home. You likely believe that true luxury must be enduring, yet the abrasive reality of the UAE's fine desert sand, often composed of silica particles as small as 0.1mm, threatens to dull the luster of even the most exquisite interiors. It's a common anxiety for the modern connoisseur that a single moment of friction might mar a masterpiece. This is why understanding laminate flooring scratch resistance becomes an essential pursuit for those who refuse to compromise on aesthetic integrity.</p>
<p>Discover how the intricate engineering of high-end laminate preserves the soul of your home against the rigours of daily life. We'll explore the technical provenance of AC5 ratings, which are rigorously tested to withstand over 6,000 revolutions of abrasive contact. You'll gain the confidence to select a foundation that withstands the unique environmental demands of the Emirates, supported by a maintenance protocol that treats your flooring as the cultural artifact it truly is.</p>
<h2>Key Takeaways</h2>
<ul>
<li>Unveil the scientific alchemy of the wear layer, where aluminum oxide crystals are heat-fused to create a diamond-hard shield that preserves the soul of your home.</li>
<li>Master the nuances of the Abrasion Criteria (AC) rating and the rigorous Taber Test to select a foundation that mirrors your lifestyle's unique demands.</li>
<li>Discover specialized preservation techniques tailored for the UAE, ensuring the fine sands of our regional landscape do not compromise your floor's exquisite finish.</li>
<li>Learn how laminate flooring scratch resistance acts as a silent guardian, allowing high-end materials to maintain their timeless elegance far longer than traditional solid timber.</li>
<li>Align your aesthetic vision with technical mastery by understanding why a curated selection is essential for creating a home that resonates with both beauty and resilience.</li>
</ul>
<h2>The Essence of Durability: Defining Laminate Flooring Scratch Resistance</h2>
<p>To the discerning eye, the floor serves as the foundational soul of a residence; it is a silent stage where the theater of daily life unfolds with grace. Achieving true laminate flooring scratch resistance isn't merely a technical specification. It's an act of preserving the aesthetic integrity of a curated space against the inevitable friction of existence. This resilience is defined by the ability of the uppermost surface to withstand both the sharp impact of dropped objects and the persistent, abrasive movement of furniture or footsteps that would otherwise mar a lesser material.</p>
<p>The architecture of this protection begins with the wear layer, a sophisticated shield that acts as the primary architect of surface integrity. High-end <a href="/products?category=laminate-flooring">Laminate flooring</a> utilizes a complex fusion of melamine resin and aluminum oxide to create a barrier that is significantly harder than the organic fibers found in untreated timber. By investing in such advanced engineering, a homeowner secures the long-term visual harmony of their interior, ensuring the floor remains a masterpiece rather than a mounting collection of imperfections.</p>
<h2>The Aesthetic Cost of Surface Wear</h2>
<p>In the sunlight of a Dubai afternoon, even the smallest imperfections become visible to the naked eye. Micro-scratches act as tiny canyons on the floor's surface, catching the light and gradually dulling the rich lustre of exquisite wood-grain patterns. Over time, these minute abrasions accumulate, stripping away the depth of color that initially drew the connoisseur to the design. There is a profound psychological comfort in knowing a floor can handle the unpredictable moments of a vibrant household without sacrificing its elegance. Scratch resistance is the silent sentinel of floor artistry.</p>
<h2>Laminate vs. Natural Wood: A Study in Resilience</h2>
<p>While traditional <a href="https://www.zandscarpets.com/our-products/wood-flooring-ultimate-buying-guide-for-2026">wooden flooring</a> offers a timeless warmth that many collectors in the UAE admire, it often demands a level of vigilance and frequent refinishing that doesn't always align with the requirements of contemporary luxury living. Natural oils and lacquers, though beautiful, possess a lower score on the Mohs scale of mineral hardness compared to the melamine-infused surfaces of premium laminate.</p>
<p>The difference lies in the deliberate, pressed-layer construction of the material. This process involves:</p>
<ul>
<li>High-pressure bonding of decorative layers to a high-density fiberboard (HDF) core.</li>
<li>The application of a crystalline top coat that prevents the deep gouging common in softer, natural materials.</li>
<li>A structural density that resists the indentations often caused by heavy, artisanal furniture pieces.</li>
</ul>
<p>By choosing a surface engineered for laminate flooring scratch resistance, the homeowner bridges the gap between ancient aesthetic traditions and the durability required for a lasting legacy. It's a choice that favors the preservation of beauty, allowing the focus to remain on the curation of the home rather than the maintenance of its foundation.</p>
<p>[gallery]</p>
<h2>Aluminium Oxide: The Invisible Armor</h2>
<p>The presence of aluminium oxide provides a tactile experience that distinguishes artisanal collections from common alternatives. In a high-quality plank, the wear layer is applied with such precision that it mirrors the authentic grain of natural wood, offering a sophisticated texture rather than a sterile, plastic sensation. While this coating provides exceptional laminate flooring scratch resistance, it's vital to remember that no surface is entirely scratch-proof. Under extreme conditions, such as dragging heavy mahogany furniture across the floor, even the most resilient shield may yield. Discerning homeowners often look for the <a href="https://nalfa.com/product-certification-standards/">NALFA Certification Seal</a> to verify that their chosen material has undergone the 14 rigorous tests required to meet international standards of excellence.</p>
<h2>The Fusion Process: Crafting Impermeability</h2>
<p>The creation of this protective shield involves high-pressure lamination, a technique where the wear, decorative, and core layers are fused under intense heat and pressure exceeding 1,350 pounds per square inch. This artisanal fusion results in a non-porous surface that prevents moisture and microscopic grit from compromising the floor's integrity. For those who prioritize an even more rigid foundation, many designers now compare these high-end laminates to <a href="https://www.zandscarpets.com/our-products/spc-flooring">SPC flooring</a> for its legendary core stability. The thickness of this wear layer, often measured in microns, dictates the lifespan of the installation, with premium 20-mil layers often carrying residential warranties that span 25 years. To ensure the curated colors of your floor remain vibrant under the intense UAE sun, these layers are infused with UV inhibitors, preventing the fading that often plagues lesser materials. If you're seeking to elevate your home's narrative with a foundation that balances beauty and brawn, consider exploring the <a href="https://www.zandscarpets.com/our-products/laminate-flooring">bespoke flooring collections</a> available at Zands Carpets.</p>
`.trim();

const seed = async () => {
  const en = readItems("en");
  const ar = readItems("ar");
  const arById = new Map(ar.map((item) => [item.id, item]));

  // tags
  const tagsByTitle = new Map();
  for (const [index, [title, titleAr]] of TAGS.entries()) {
    const [tag] = await models.BlogTags.findOrCreate({
      where: { title },
      defaults: { title, title_ar: titleAr, sort_order: index + 1, is_active: true },
    });
    tagsByTitle.set(title, tag);
  }

  const categories = await models.ProductCategories.findAll({ attributes: ["id", "slug"] });
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));

  for (const item of en) {
    const plan = POSTS[item.id];
    if (!plan) continue;

    const existing = await models.Blogs.findOne({ where: { slug: item.id } });
    if (existing) {
      console.log(`- ${item.id}: already there, skipped`);
      continue;
    }

    const arItem = arById.get(item.id) ?? {};
    const [hero, ...gallery] = item.image;

    const post = await models.Blogs.create({
      slug: item.id,
      title: item.title,
      title_ar: arItem.title ?? item.title,
      excerpt: item.excerpt,
      excerpt_ar: arItem.excerpt ?? item.excerpt,
      content: plan.content ? LAMINATE_ARTICLE : `<p>${item.excerpt}</p>`,
      content_ar: plan.content ? null : `<p>${arItem.excerpt ?? item.excerpt}</p>`,
      author_name: item.author,
      author_name_ar: arItem.author ?? item.author,
      media_path: copyImage(hero),
      media_alt: item.title,
      media_alt_ar: arItem.title ?? item.title,
      published_at: plan.published,
      is_active: true,
    });

    for (const [index, image] of gallery.entries()) {
      await models.BlogImages.create({
        blog_id: post.id,
        media_path: copyImage(image),
        media_alt: `${item.title} ${index + 2}`,
        media_alt_ar: `${arItem.title ?? item.title} ${index + 2}`,
        sort_order: index + 1,
      });
    }

    await post.setTags(plan.tags.map((title) => tagsByTitle.get(title)).filter(Boolean));
    await post.setCategories(plan.categories.map((slug) => categoryBySlug.get(slug)).filter(Boolean));
    console.log(`+ ${item.id}: created (${gallery.length} gallery images)`);
  }

  // two sample ad banners for the blog pages (only when the Ads Banner master is empty)
  if ((await models.AdsBanner.count()) === 0) {
    fs.mkdirSync(path.resolve(__dirname, "../../uploads/ads-banner"), { recursive: true });
    const ads = [
      { image: "floor-img-28.webp", alt: "Premium vinyl flooring offer", alt_ar: "عرض أرضيات الفينيل الفاخرة", link: "/products?category=vinyl-flooring" },
      { image: "floor-img-15.webp", alt: "Premium laminate flooring offer", alt_ar: "عرض أرضيات اللامينيت الفاخرة", link: "/products?category=laminate-flooring" },
    ];
    for (const [index, ad] of ads.entries()) {
      fs.copyFileSync(
        path.join(STOREFRONT, "public/images", ad.image),
        path.resolve(__dirname, "../../uploads/ads-banner", `seed-${ad.image}`),
      );
      await models.AdsBanner.create({
        media_path: `uploads/ads-banner/seed-${ad.image}`,
        media_alt: ad.alt,
        media_alt_ar: ad.alt_ar,
        link: ad.link,
        link_new_tab: false,
        sort_order: index + 1,
        is_active: true,
      });
    }
    console.log("+ 2 sample ad banners created");
  }

  // headings of the blog pages
  const [cms, created] = await models.BlogCms.findOrCreate({
    where: {},
    defaults: {
      title: "Latest Updates & Insights",
      title_ar: "آخر المستجدات والرؤى",
      related_title: "Related Blogs",
      related_title_ar: "مقالات ذات صلة",
    },
  });
  console.log(created ? "+ blog CMS created" : "- blog CMS already there");

  await sequelize.close();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
