// Sample product detail content (tabs) for "heritage-oak-laminate" so the storefront detail page
// has something to show. Idempotent: skips a field that already has a mapping. Run: node database/seeders/productDetails.js
const { sequelize, models } = require("../models");

const FIELD_CONTENT = {
  "product-description": {
    en: "<h2>Built for busy homes</h2><p>Heritage Oak Laminate pairs a realistic oak grain with a tough AC4 wear layer, so it keeps its look under daily foot traffic.</p><ul><li>Scratch and stain resistant surface</li><li>Click-lock installation, no glue needed</li><li>Suitable for living rooms, bedrooms and offices</li></ul>",
    ar: "<h2>مصمم للمنازل المزدحمة</h2><p>يجمع لامينيت هيريتج أوك بين حبيبات خشب البلوط الواقعية وطبقة تآكل قوية من الفئة AC4، ليحافظ على مظهره مع الاستخدام اليومي.</p><ul><li>سطح مقاوم للخدوش والبقع</li><li>تركيب بنظام الأقفال دون الحاجة إلى الغراء</li><li>مناسب لغرف المعيشة والنوم والمكاتب</li></ul>",
  },
  "installation-instruction": {
    en: "<h3>Before you start</h3><ul><li>Let the planks rest in the room for 48 hours</li><li>Level the subfloor and lay the underlay</li><li>Leave a 10 mm expansion gap along every wall</li></ul>",
    ar: "<h3>قبل أن تبدأ</h3><ul><li>اترك الألواح في الغرفة لمدة 48 ساعة</li><li>سوِّ الأرضية الأساسية وافرش الطبقة السفلية</li><li>اترك فجوة تمدد بعرض 10 مم عند كل جدار</li></ul>",
  },
  maintenance: {
    en: "<p>Sweep or vacuum regularly and wipe spills straight away with a slightly damp cloth.</p><ul><li>Do not steam clean or soak the floor</li><li>Use felt pads under furniture legs</li></ul>",
    ar: "<p>اكنس الأرضية أو نظّفها بالمكنسة بانتظام وامسح أي انسكاب فورًا بقطعة قماش رطبة قليلًا.</p><ul><li>لا تستخدم التنظيف بالبخار ولا تغمر الأرضية بالماء</li><li>استخدم وسادات لبادية تحت أرجل الأثاث</li></ul>",
  },
};
const VARIANT_MAINTENANCE = {
  en: "<p>This colour shows dust more easily: vacuum at least twice a week and use a microfibre mop.</p>",
  ar: "<p>يُظهر هذا اللون الغبار بسهولة أكبر: نظّف بالمكنسة مرتين أسبوعيًا على الأقل واستخدم ممسحة من الألياف الدقيقة.</p>",
};

const run = async () => {
  const product = await models.Products.findOne({ where: { slug: "heritage-oak-laminate" } });
  if (!product) return console.log("Product heritage-oak-laminate not found, nothing seeded");
  const variants = await models.ProductVariants.findAll({ where: { product_id: product.id }, order: [["id", "ASC"]] });
  const fields = await models.DetailFields.findAll();
  const bySlug = Object.fromEntries(fields.map((f) => [f.slug, f]));

  const addMapping = async (owner, field, items) => {
    const exists = await models.DetailMappings.findOne({ where: { ...owner, field_id: field.id } });
    if (exists) return console.log(`skip ${field.slug} (exists)`);
    const mapping = await models.DetailMappings.create({ ...owner, field_id: field.id, sort_order: field.sort_order });
    for (const [index, item] of items.entries()) {
      await models.DetailItems.create({ mapping_id: mapping.id, sort_order: index, ...item });
    }
    console.log(`seeded ${field.slug}`);
  };

  for (const [slug, content] of Object.entries(FIELD_CONTENT)) {
    await addMapping({ product_id: product.id }, bySlug[slug], [{ text_content: content.en, text_content_ar: content.ar }]);
  }

  // media rows that already exist (uploaded earlier through the admin)
  const media = await models.Media.findAll({ order: [["id", "ASC"]] });
  const images = media.filter((m) => m.kind === "image").slice(0, 2);
  const video = media.find((m) => m.kind === "video");
  const arabic = [
    ["صورة تفصيلية للحبيبات", "نمط حبيبات خشب البلوط عن قرب"],
    ["صورة تفصيلية للحواف", "حواف بنظام الأقفال لتركيب محكم"],
  ];
  for (const [index, image] of images.entries()) {
    await image.update({
      title: image.title || (index ? "Click-lock edge" : "Oak grain detail"),
      description: image.description || (index ? "Tight-fitting click-lock edges" : "Close-up of the oak grain"),
      alt_text: image.alt_text || (index ? "Click-lock edge" : "Oak grain detail"),
      title_ar: arabic[index][0],
      description_ar: arabic[index][1],
      alt_text_ar: arabic[index][0],
    });
  }
  if (images.length) await addMapping({ product_id: product.id }, bySlug["detailed-photos"], images.map((m) => ({ media_id: m.id })));
  if (video) {
    await video.update({
      title: video.title || "Installation walkthrough",
      description: video.description || "How to lay click-lock laminate",
      title_ar: "شرح التركيب",
      description_ar: "كيفية تركيب أرضيات اللامينيت بنظام الأقفال",
    });
    await addMapping({ product_id: product.id }, bySlug["videos"], [{ media_id: video.id }]);
  }

  // one variant (Medium / Walnut) overrides the maintenance tab
  const override = variants[variants.length - 1];
  if (override) {
    await addMapping({ variant_id: override.id }, bySlug["maintenance"], [
      { text_content: VARIANT_MAINTENANCE.en, text_content_ar: VARIANT_MAINTENANCE.ar },
    ]);
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
