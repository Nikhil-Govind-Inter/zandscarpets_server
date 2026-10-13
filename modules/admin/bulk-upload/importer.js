// Transactional writers, one per entity. Only called from a `commit`
// controller action, after the advisory lock is taken and uniqueness has
// been re-checked against current DB state (validate ran against a
// possibly-stale snapshot). Rows are written in file order, which the
// Categories validator already guarantees is parent-before-child for
// same-file parent references.

const { lookupKey } = require("./validators/shared");
const { generateUniqueSlug } = require("../../../utils/slugHelper");

async function importCategories(normalizedRows, { models, transaction }) {
  // in-file title -> the real id this row ended up with (whether created
  // or updated), so a later row's parent_title resolves correctly either
  // way. `row.resolved_parent_id` from the validator is only trustworthy
  // for a "db"-sourced parent (nothing was written between validate and
  // here in the same transaction); a "file"-sourced parent may have been
  // only a pending create at validate time, so it's always re-resolved
  // from this map instead.
  const resolvedByTitleKey = new Map();
  let created = 0;
  let updated = 0;

  for (const row of normalizedRows) {
    let parentId = null;
    if (row.parent_title_input) {
      parentId = row.parent_title_source === "file" ? resolvedByTitleKey.get(row.parent_title_key) ?? null : row.resolved_parent_id;
    }

    const fields = {
      title: row.title,
      title_ar: row.title_ar,
      industry_id: row.industry_id,
      parent_id: parentId,
      description: row.description,
      description_ar: row.description_ar,
      material_type: row.material_type,
      material_type_ar: row.material_type_ar,
      sort_order: row.sort_order,
      is_active: row.is_active,
      show_in_navbar: row.show_in_navbar,
    };

    let id;
    if (row.mode === "update") {
      // Slug is regenerated from the (possibly unchanged) title every
      // time, same as the manual controller does for a blank slug —
      // `excludeId` means an unchanged title keeps its current slug.
      fields.slug = await generateUniqueSlug(models.ProductCategories, row.title, { excludeId: row.existingId, transaction });
      const item = await models.ProductCategories.findByPk(row.existingId, { transaction });
      await item.update(fields, { transaction });
      id = row.existingId;
      updated += 1;
    } else {
      fields.slug = await generateUniqueSlug(models.ProductCategories, row.title, { transaction });
      const createdRow = await models.ProductCategories.create(fields, { transaction });
      id = createdRow.id;
      created += 1;
    }

    resolvedByTitleKey.set(lookupKey(row.title), id);
  }

  return { created, updated, skipped: 0 };
}

async function importAttributes(normalizedRows, { models, transaction }) {
  let created = 0;
  let updated = 0;

  for (const row of normalizedRows) {
    const fields = {
      title: row.title,
      title_ar: row.title_ar,
      type: row.type,
      sort_order: row.sort_order,
      is_active: row.is_active,
    };

    // Same "common logic" as attributeController.js's normalizeSlug() for a
    // blank slug — bulk upload never accepts a user-typed slug here.
    if (row.mode === "update") {
      fields.slug = await generateUniqueSlug(models.Attributes, row.title, { excludeId: row.existingId, transaction });
      const item = await models.Attributes.findByPk(row.existingId, { transaction });
      await item.update(fields, { transaction });
      updated += 1;
    } else {
      fields.slug = await generateUniqueSlug(models.Attributes, row.title, { transaction });
      await models.Attributes.create(fields, { transaction });
      created += 1;
    }
  }

  return { created, updated, skipped: 0 };
}

async function importAttributeValues(normalizedRows, { models, transaction }) {
  let created = 0;
  let updated = 0;

  for (const row of normalizedRows) {
    const fields = {
      attribute_id: row.attribute_id,
      value: row.value,
      value_ar: row.value_ar,
      media_path: row.media_path,
      media_alt: row.media_alt,
      media_alt_ar: row.media_alt_ar,
      color_code: row.color_code,
      sort_order: row.sort_order,
      is_active: row.is_active,
    };

    // Same "common logic" as attributeValueController.js's normalizeSlug()
    // for a blank slug — scoped per attribute, exactly like the manual flow.
    const slugSource = row.value || row.media_alt || `value-${row.rowNumber}`;

    if (row.mode === "update") {
      fields.slug = await generateUniqueSlug(models.AttributeValues, slugSource, {
        excludeId: row.existingId,
        scope: { attribute_id: row.attribute_id },
        transaction,
      });
      const item = await models.AttributeValues.findByPk(row.existingId, { transaction });
      await item.update(fields, { transaction });
      updated += 1;
    } else {
      fields.slug = await generateUniqueSlug(models.AttributeValues, slugSource, {
        scope: { attribute_id: row.attribute_id },
        transaction,
      });
      await models.AttributeValues.create(fields, { transaction });
      created += 1;
    }
  }

  return { created, updated, skipped: 0 };
}

async function importProducts(normalizedRows, { models, transaction }) {
  let created = 0;
  let updated = 0;

  for (const row of normalizedRows) {
    const fields = {
      title: row.title,
      title_ar: row.title_ar,
      product_category_id: row.product_category_id,
      short_description: row.short_description,
      short_description_ar: row.short_description_ar,
      product_description: row.product_description,
      product_description_ar: row.product_description_ar,
      main_media_path: row.main_media_path,
      list_media_path: row.list_media_path,
      sort_order: row.sort_order,
      is_active: row.is_active,
    };

    if (row.mode === "update") {
      // Attribute links are never touched on update — mirrors the manual
      // controller's syncLinks(), which only touches product_attributes
      // when the field is explicitly processed (see productsValidator.js).
      // Slug is still regenerated for consistency with Categories/
      // Attributes/Attribute Values, even though title (part of the match
      // key) can't have changed for a matched row, so this is a no-op in
      // practice — `excludeId` means it resolves back to the same slug.
      fields.slug = await generateUniqueSlug(models.Products, row.title, { excludeId: row.existingId, transaction });
      const item = await models.Products.findByPk(row.existingId, { transaction });
      await item.update(fields, { transaction });
      updated += 1;
    } else {
      fields.slug = await generateUniqueSlug(models.Products, row.title, { transaction });
      const createdRow = await models.Products.create(fields, { transaction });

      if (row.attribute_ids.length) {
        await models.ProductAttributes.bulkCreate(
          row.attribute_ids.map((attributeId, index) => ({
            product_id: createdRow.id,
            attribute_id: attributeId,
            sort_order: index,
          })),
          { transaction },
        );
      }
      created += 1;
    }
  }

  return { created, updated, skipped: 0 };
}

async function importProductVariants(normalizedRows, { models, transaction }) {
  for (const row of normalizedRows) {
    const created = await models.ProductVariants.create(
      {
        product_id: row.product_id,
        label: row.label,
        label_ar: row.label_ar,
        sku: row.sku,
        media_path: row.media_path,
        combination_key: row.combination_key,
        sort_order: row.sort_order,
        is_active: row.is_active,
      },
      { transaction },
    );

    await models.VariantAttributeValues.bulkCreate(
      row.attribute_value_pairs.map((pair) => ({
        variant_id: created.id,
        attribute_id: pair.attribute_id,
        attribute_value_id: pair.attribute_value_id,
      })),
      { transaction },
    );
  }
  return { created: normalizedRows.length, skipped: 0 };
}

module.exports = {
  importCategories,
  importAttributes,
  importAttributeValues,
  importProducts,
  importProductVariants,
};
