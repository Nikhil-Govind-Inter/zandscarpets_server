const { models } = require("../database/models");
const Logger = require("../config/logger");

const itemOrder = [["sort_order", "ASC"], ["id", "ASC"]];

const mappingInclude = (ownerWhere) => ({
  where: ownerWhere,
  include: [
    {
      model: models.DetailItems,
      as: "items",
      separate: true,
      order: itemOrder,
      include: [{ model: models.Media, as: "media" }],
    },
  ],
});

// A mapping row with both or neither of product_id/variant_id set violates
// the model's invariant (see detailMappings.js). The only way this can
// happen is a raw SQL write bypassing the app entirely, since every
// controller path enforces it — so this is a defensive fallback, not an
// expected case.
const isConsistentMapping = (mapping) => {
  const hasProduct = mapping.product_id !== null && mapping.product_id !== undefined;
  const hasVariant = mapping.variant_id !== null && mapping.variant_id !== undefined;
  if (hasProduct === hasVariant) {
    Logger.warn(
      `detail_mappings row ${mapping.id} has an inconsistent owner (product_id=${mapping.product_id}, variant_id=${mapping.variant_id}); skipping it in resolution`,
    );
    return false;
  }
  return true;
};

const byFieldId = (mappings) => {
  const map = new Map();
  for (const mapping of mappings) {
    if (isConsistentMapping(mapping)) map.set(mapping.field_id, mapping);
  }
  return map;
};

const loadActiveFields = (transaction) =>
  models.DetailFields.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"], ["id", "ASC"]],
    transaction,
  });

const loadMappingsFor = (ownerWhere, transaction) =>
  models.DetailMappings.findAll({
    ...mappingInclude(ownerWhere),
    transaction,
  });

const loadExclusionSet = async (variantId, transaction) => {
  if (!variantId) return new Set();
  const rows = await models.DetailItemExclusions.findAll({
    where: { variant_id: variantId },
    attributes: ["item_id"],
    transaction,
  });
  return new Set(rows.map((r) => r.item_id));
};

// Resolves every active field for a product that has zero variants: steps
// 1/2/4 of the variant algorithm don't apply, every product mapping with
// items is simply "own" content.
async function resolveProductDetails({ productId, transaction } = {}) {
  const [fields, productMappings] = await Promise.all([
    loadActiveFields(transaction),
    loadMappingsFor({ product_id: productId }, transaction),
  ]);
  const productByField = byFieldId(productMappings);

  const resolved = [];
  for (const field of fields) {
    const mapping = productByField.get(field.id);
    if (!mapping) continue;
    resolved.push({
      field,
      mapping,
      source: "own",
      state: "own",
      items: mapping.items,
    });
  }
  return resolved;
}

// Decides one field's state for a variant, applying the spec's four-step
// precedence. Always returns an entry (never omits) — "hidden" and "none"
// are real states the admin UI needs to see (to offer "Show again" / "Add
// field"), even though neither is ever shown on the storefront.
//   1. variant mapping + hidden            -> state "hidden", no items
//   2. variant mapping, not hidden          -> state "custom", full replacement
//   3. no variant mapping, product mapping  -> state "inherited", minus exclusions
//   4. neither                              -> state "none", no items
const decideFieldState = (field, variantByField, productByField, exclusions) => {
  const variantMapping = variantByField.get(field.id);

  if (variantMapping) {
    if (variantMapping.hidden) {
      return { field, mapping: variantMapping, source: "hidden", state: "hidden", items: [] };
    }
    // A non-hidden variant mapping with zero items means "intentionally
    // cleared", not "fall back to product" — the two states live or die by
    // hidden vs. not-hidden alone, there's no third "inherit anyway" branch.
    return {
      field,
      mapping: variantMapping,
      source: "custom",
      state: "custom",
      items: variantMapping.items,
    };
  }

  const productMapping = productByField.get(field.id);
  if (!productMapping) {
    return { field, mapping: null, source: "none", state: "none", items: [] };
  }

  const items = productMapping.items.filter((item) => !exclusions.has(item.id));
  return {
    field,
    mapping: productMapping,
    source: "inherited",
    state: "inherited",
    items,
    // The full, unfiltered product item list plus which ones this variant
    // currently excludes — so the admin can show excluded items greyed out
    // ("hidden for this variant") with a restore action, instead of just
    // disappearing them. `items` above stays the "what actually shows"
    // list for every other caller (public API, resolveVariantDetails).
    allItems: productMapping.items,
    excludedItemIds: productMapping.items.filter((item) => exclusions.has(item.id)).map((item) => item.id),
  };
};

// Full per-field state for every active field, for the admin's variant
// screen — includes "hidden" and "none" entries so it can render every
// field's current state and the matching action (Customize/Hide/Show
// again/Revert/Promote/Add field).
async function resolveVariantFieldStates({ productId, variantId, transaction } = {}) {
  const [fields, variantMappings, productMappings, exclusions] = await Promise.all([
    loadActiveFields(transaction),
    loadMappingsFor({ variant_id: variantId }, transaction),
    loadMappingsFor({ product_id: productId }, transaction),
    loadExclusionSet(variantId, transaction),
  ]);

  const variantByField = byFieldId(variantMappings);
  const productByField = byFieldId(productMappings);

  return fields.map((field) => decideFieldState(field, variantByField, productByField, exclusions));
}

// Resolves every active field for one variant against its product — the
// "what actually shows" view. Omits hidden/no-mapping fields, since neither
// is ever shown anywhere. Used by the public API (further trimmed there for
// empty fields — see ProductDetailsService.js) and by `customize`'s
// snapshot-before-copy step.
async function resolveVariantDetails({ productId, variantId, transaction } = {}) {
  const all = await resolveVariantFieldStates({ productId, variantId, transaction });
  return all.filter((entry) => entry.state === "custom" || entry.state === "inherited");
}

// Single-field view used by the variant action panel (customize/hide/
// revert/promote) to decide which actions are currently valid, and by
// `customize` to snapshot what the variant is showing right now before
// copying it.
async function resolveOneField({ productId, variantId, fieldId, transaction } = {}) {
  const all = await resolveVariantFieldStates({ productId, variantId, transaction });
  return all.find((entry) => entry.field.id === Number(fieldId));
}

module.exports = {
  resolveProductDetails,
  resolveVariantDetails,
  resolveVariantFieldStates,
  resolveOneField,
};
