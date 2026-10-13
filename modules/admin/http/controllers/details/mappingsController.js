const { sequelize, models } = require("../../../../../database/models");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError, sendValidationError, sendConflictError } = require("../../traits/responseHandler");
const { resolveVariantFieldStates, resolveOneField } = require("../../../../../services/detailsResolverService");
const {
  addFieldRequest,
  reorderFieldsRequest,
  mappingIdParam,
  itemIdParam,
  addItemRequest,
  editItemRequest,
  reorderItemsRequest,
  variantIdParam,
  fieldIdParam,
} = require("../../request/details/mappingsRequest");
const { validationResult } = require("express-validator");

const safeRollback = async (t) => {
  if (t && !t.finished) await t.rollback();
};

const itemOrder = [
  ["sort_order", "ASC"],
  ["id", "ASC"],
];

const itemsInclude = {
  model: models.DetailItems,
  as: "items",
  separate: true,
  order: itemOrder,
  include: [{ model: models.Media, as: "media" }],
};

const mappingWithItems = (where, transaction) =>
  models.DetailMappings.findOne({
    where,
    include: [{ model: models.DetailFields, as: "field" }, itemsInclude],
    transaction,
  });

class MappingsController {
  // ---- Phase 5: product-level field/item management ----

  static async listForProduct(req, res) {
    try {
      const productId = Number(req.params.productId);
      const mappings = await models.DetailMappings.findAll({
        where: { product_id: productId },
        include: [{ model: models.DetailFields, as: "field", where: { is_active: true } }, itemsInclude],
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
      });
      return sendSuccessResponse(res, mappings, "Product detail fields retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // scope: body.variant_id present -> variant-only field; otherwise -> all
  // variants (product-level mapping).
  static async addFieldToProduct(req, res) {
    await Promise.all(addFieldRequest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const productId = Number(req.params.productId);
      const fieldId = Number(req.body.field_id);
      const variantId = req.body.variant_id ? Number(req.body.variant_id) : null;

      const [product, field] = await Promise.all([
        models.Products.findByPk(productId, { transaction: t }),
        models.DetailFields.findByPk(fieldId, { transaction: t }),
      ]);
      if (!product) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "productId", msg: "Product not found" }]);
      }
      if (!field) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "field_id", msg: "Detail field not found" }]);
      }

      const owner = variantId ? { variant_id: variantId } : { product_id: productId };

      if (variantId) {
        const variant = await models.ProductVariants.findByPk(variantId, { transaction: t });
        if (!variant || variant.product_id !== productId) {
          await safeRollback(t);
          return sendValidationError(res, [{ path: "variant_id", msg: "Variant does not belong to this product" }]);
        }
      }

      // Defense-in-depth alongside the partial unique index.
      const existing = await models.DetailMappings.findOne({
        where: { ...owner, field_id: fieldId },
        transaction: t,
      });
      if (existing) {
        await safeRollback(t);
        return sendConflictError(res, "Detail mapping", "This field is already mapped here");
      }

      const maxSort = (await models.DetailMappings.max("sort_order", { where: owner, transaction: t })) || 0;

      const mapping = await models.DetailMappings.create({ ...owner, field_id: fieldId, sort_order: Number(maxSort) + 1 }, { transaction: t });

      await t.commit();
      const created = await mappingWithItems({ id: mapping.id });
      return sendSuccessResponse(res, created, "Detail field added successfully", 201);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async removeField(req, res) {
    await Promise.all(mappingIdParam.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const mapping = await models.DetailMappings.findByPk(req.params.mappingId, { transaction: t });
      if (!mapping) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail mapping");
      }

      // Items cascade via the DB FK; any exclusions on those items cascade
      // from there too (item_id FK is ON DELETE CASCADE) — no manual
      // cleanup needed here.
      await mapping.destroy({ transaction: t });

      await t.commit();
      return sendSuccessResponse(res, { id: Number(req.params.mappingId) }, "Detail field removed successfully");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async reorderFields(req, res) {
    await Promise.all(reorderFieldsRequest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const productId = Number(req.params.productId);
      const orderedIds = req.body.ordered_ids.map(Number);

      // Reorders only touch one owner's mappings — reject the whole batch
      // if any id doesn't belong to this product.
      const rows = await models.DetailMappings.findAll({
        where: { id: orderedIds, product_id: productId },
        transaction: t,
      });
      if (rows.length !== orderedIds.length) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "ordered_ids", msg: "One or more ids do not belong to this product" }]);
      }

      // validate: false — Sequelize's bulk `update()` validates by default,
      // but it builds the validation instance from only the fields being
      // set (just `sort_order` here), not the existing row, so
      // product_id/variant_id come up undefined and wrongly trip the
      // model's `exactlyOneOwner` check even though this update never
      // touches those columns. The `rows` lookup above already confirmed
      // every id is a real, valid product-level mapping.
      await Promise.all(
        orderedIds.map((id, index) => models.DetailMappings.update({ sort_order: index }, { where: { id }, transaction: t, validate: false })),
      );

      await t.commit();
      return sendSuccessResponse(res, { ordered_ids: orderedIds }, "Fields reordered successfully");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  // ---- Items ----

  static async addItem(req, res) {
    await Promise.all(addItemRequest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const mapping = await models.DetailMappings.findByPk(req.params.mappingId, {
        include: [{ model: models.DetailFields, as: "field" }],
        transaction: t,
      });
      if (!mapping) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail mapping");
      }

      if (mapping.hidden) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "mappingId", msg: "A hidden mapping cannot hold items — show it again first" }]);
      }

      const field = mapping.field;
      const validationError = await MappingsController.validateItemContent(field, req.body, t);
      if (validationError) {
        await safeRollback(t);
        return sendValidationError(res, [validationError]);
      }

      if (!field.allows_multiple) {
        const count = await models.DetailItems.count({
          where: { mapping_id: mapping.id },
          transaction: t,
        });
        if (count > 0) {
          await safeRollback(t);
          return sendValidationError(res, [{ path: "mappingId", msg: "This field only allows a single item" }]);
        }
      }

      const maxSort = (await models.DetailItems.max("sort_order", { where: { mapping_id: mapping.id }, transaction: t })) || 0;

      const item = await models.DetailItems.create(
        {
          mapping_id: mapping.id,
          text_content: field.type === "rich_text" ? req.body.text_content : null,
          media_id: field.type === "rich_text" ? null : Number(req.body.media_id),
          sort_order: req.body.sort_order ?? Number(maxSort) + 1,
        },
        { transaction: t },
      );

      await t.commit();
      return sendSuccessResponse(res, item, "Item added successfully", 201);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  // rich_text -> text_content required, media_id must be absent.
  // image/video -> media_id required, must reference a Media row of the
  // matching kind; text_content must be absent.
  static async validateItemContent(field, body, transaction) {
    if (field.type === "rich_text") {
      if (!body.text_content || !String(body.text_content).trim()) {
        return { path: "text_content", msg: "Text content is required for a rich text field" };
      }
      if (body.media_id) {
        return { path: "media_id", msg: "A rich text item cannot reference media" };
      }
      return null;
    }

    if (!body.media_id) {
      return { path: "media_id", msg: `A ${field.type} item requires media` };
    }
    if (body.text_content) {
      return { path: "text_content", msg: `A ${field.type} item cannot have text content` };
    }

    const media = await models.Media.findByPk(Number(body.media_id), { transaction });
    if (!media) {
      return { path: "media_id", msg: "Media not found" };
    }
    if (media.kind !== field.type) {
      return { path: "media_id", msg: `This field requires ${field.type} media, not ${media.kind}` };
    }
    return null;
  }

  static async editItem(req, res) {
    await Promise.all(editItemRequest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const item = await models.DetailItems.findOne({
        where: { id: req.params.itemId, mapping_id: req.params.mappingId },
        include: [{ model: models.DetailMappings, as: "mapping", include: [{ model: models.DetailFields, as: "field" }] }],
        transaction: t,
      });
      if (!item) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail item");
      }

      const field = item.mapping.field;
      const validationError = await MappingsController.validateItemContent(field, req.body, t);
      if (validationError) {
        await safeRollback(t);
        return sendValidationError(res, [validationError]);
      }

      await item.update(
        {
          text_content: field.type === "rich_text" ? req.body.text_content : null,
          media_id: field.type === "rich_text" ? null : Number(req.body.media_id),
        },
        { transaction: t },
      );

      await t.commit();
      return sendSuccessResponse(res, item, "Item updated successfully");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async removeItem(req, res) {
    await Promise.all(itemIdParam.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const item = await models.DetailItems.findByPk(req.params.itemId, { transaction: t });
      if (!item) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail item");
      }

      // Exclusions pointing at this item cascade via the DB FK automatically.
      await item.destroy({ transaction: t });

      await t.commit();
      return sendSuccessResponse(res, { id: Number(req.params.itemId) }, "Item removed successfully");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async reorderItems(req, res) {
    await Promise.all(reorderItemsRequest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const mappingId = Number(req.params.mappingId);
      const orderedIds = req.body.ordered_ids.map(Number);

      const rows = await models.DetailItems.findAll({
        where: { id: orderedIds, mapping_id: mappingId },
        transaction: t,
      });
      if (rows.length !== orderedIds.length) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "ordered_ids", msg: "One or more ids do not belong to this mapping" }]);
      }

      await Promise.all(orderedIds.map((id, index) => models.DetailItems.update({ sort_order: index }, { where: { id }, transaction: t })));

      await t.commit();
      return sendSuccessResponse(res, { ordered_ids: orderedIds }, "Items reordered successfully");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  // ---- Phase 6: variant actions ----

  static async listResolvedForVariant(req, res) {
    await Promise.all(variantIdParam.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const variant = await models.ProductVariants.findByPk(req.params.variantId);
      if (!variant) return sendNotFoundError(res, "Product variant");

      const resolved = await resolveVariantFieldStates({
        productId: variant.product_id,
        variantId: variant.id,
      });
      return sendSuccessResponse(res, resolved, "Resolved variant details retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async customize(req, res) {
    await Promise.all([...variantIdParam, ...fieldIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const variantId = Number(req.params.variantId);
      const fieldId = Number(req.params.fieldId);

      const variant = await models.ProductVariants.findByPk(variantId, { transaction: t });
      if (!variant) {
        await safeRollback(t);
        return sendNotFoundError(res, "Product variant");
      }

      const existing = await models.DetailMappings.findOne({
        where: { variant_id: variantId, field_id: fieldId },
        transaction: t,
      });
      if (existing) {
        await safeRollback(t);
        return sendConflictError(res, "Detail mapping", "This variant already has its own mapping for this field");
      }

      // Snapshot what the variant is currently showing (product items minus
      // this variant's exclusions) before anything changes.
      const current = await resolveOneField({
        productId: variant.product_id,
        variantId,
        fieldId,
        transaction: t,
      });

      const maxSort = (await models.DetailMappings.max("sort_order", { where: { variant_id: variantId }, transaction: t })) || 0;
      const newMapping = await models.DetailMappings.create(
        { variant_id: variantId, field_id: fieldId, sort_order: Number(maxSort) + 1 },
        { transaction: t },
      );

      const copiedItemIds = [];
      for (const [index, item] of current.items.entries()) {
        const copy = await models.DetailItems.create(
          {
            mapping_id: newMapping.id,
            text_content: item.text_content,
            media_id: item.media_id,
            sort_order: index,
          },
          { transaction: t },
        );
        copiedItemIds.push(copy.id);
      }

      // Those exclusions are now meaningless (the variant has its own full
      // mapping) — clear them so they don't leak into a later revert.
      const originalProductItemIds = current.items.map((item) => item.id);
      if (originalProductItemIds.length) {
        await models.DetailItemExclusions.destroy({
          where: { variant_id: variantId, item_id: originalProductItemIds },
          transaction: t,
        });
      }

      await t.commit();
      const created = await mappingWithItems({ id: newMapping.id });
      return sendSuccessResponse(res, created, "Field customized for this variant", 201);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async hideForVariant(req, res) {
    await Promise.all([...variantIdParam, ...fieldIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const variantId = Number(req.params.variantId);
      const fieldId = Number(req.params.fieldId);

      const existing = await models.DetailMappings.findOne({
        where: { variant_id: variantId, field_id: fieldId },
        transaction: t,
      });
      if (existing) {
        await safeRollback(t);
        return sendConflictError(
          res,
          "Detail mapping",
          "This variant already has its own mapping for this field — remove or revert it instead of hiding",
        );
      }

      const mapping = await models.DetailMappings.create({ variant_id: variantId, field_id: fieldId, hidden: true }, { transaction: t });

      await t.commit();
      return sendSuccessResponse(res, mapping, "Field hidden for this variant", 201);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  // Shared by "show again" (hidden -> inherited) and "revert" (custom ->
  // inherited): both are just "delete the variant's mapping for this
  // field". Exclusions are deliberately left untouched here — any
  // exclusion predating a customize cycle was already cleared at customize
  // time, so there's nothing stale to clean up, and clearing exclusions
  // again here would wrongly resurrect items the admin had intentionally
  // hidden before ever customizing.
  static async deleteVariantMapping(req, res, successMessage) {
    await Promise.all([...variantIdParam, ...fieldIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const variantId = Number(req.params.variantId);
      const fieldId = Number(req.params.fieldId);

      const mapping = await models.DetailMappings.findOne({
        where: { variant_id: variantId, field_id: fieldId },
        transaction: t,
      });
      if (!mapping) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail mapping");
      }

      await mapping.destroy({ transaction: t });

      await t.commit();
      return sendSuccessResponse(res, { variant_id: variantId, field_id: fieldId }, successMessage);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static showAgain(req, res) {
    return MappingsController.deleteVariantMapping(req, res, "Field shown again");
  }

  static revert(req, res) {
    return MappingsController.deleteVariantMapping(req, res, "Reverted to product default");
  }

  static async promote(req, res) {
    await Promise.all([...variantIdParam, ...fieldIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const variantId = Number(req.params.variantId);
      const fieldId = Number(req.params.fieldId);

      const variant = await models.ProductVariants.findByPk(variantId, { transaction: t });
      if (!variant) {
        await safeRollback(t);
        return sendNotFoundError(res, "Product variant");
      }

      const mapping = await models.DetailMappings.findOne({
        where: { variant_id: variantId, field_id: fieldId },
        transaction: t,
      });
      if (!mapping) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail mapping");
      }
      if (mapping.hidden) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "fieldId", msg: "A hidden mapping cannot be promoted" }]);
      }

      const conflict = await models.DetailMappings.findOne({
        where: { product_id: variant.product_id, field_id: fieldId },
        transaction: t,
      });
      if (conflict) {
        await safeRollback(t);
        return sendConflictError(res, "Detail mapping", "The product already has this field. Edit it there, or revert this variant instead.");
      }

      // Re-point in place (UPDATE, not delete+recreate) so the mapping's
      // item ids — and anything else that may reference them — survive.
      await mapping.update({ product_id: variant.product_id, variant_id: null }, { transaction: t });

      await t.commit();
      const updated = await mappingWithItems({ id: mapping.id });
      return sendSuccessResponse(res, updated, "Field promoted to all variants");
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async addExclusion(req, res) {
    await Promise.all([...variantIdParam, ...itemIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const variantId = Number(req.params.variantId);
      const itemId = Number(req.params.itemId);

      const variant = await models.ProductVariants.findByPk(variantId, { transaction: t });
      if (!variant) {
        await safeRollback(t);
        return sendNotFoundError(res, "Product variant");
      }

      const item = await models.DetailItems.findByPk(itemId, {
        include: [{ model: models.DetailMappings, as: "mapping" }],
        transaction: t,
      });
      if (!item) {
        await safeRollback(t);
        return sendNotFoundError(res, "Detail item");
      }

      const mapping = item.mapping;
      if (!mapping || mapping.product_id !== variant.product_id) {
        await safeRollback(t);
        return sendValidationError(res, [{ path: "itemId", msg: "This item is not a product-level item of the variant's own product" }]);
      }

      const ownMapping = await models.DetailMappings.findOne({
        where: { variant_id: variantId, field_id: mapping.field_id },
        transaction: t,
      });
      if (ownMapping) {
        await safeRollback(t);
        return sendValidationError(res, [
          {
            path: "itemId",
            msg: "This variant already has its own mapping for this field — exclusions don't apply",
          },
        ]);
      }

      await models.DetailItemExclusions.findOrCreate({
        where: { variant_id: variantId, item_id: itemId },
        transaction: t,
      });

      await t.commit();
      return sendSuccessResponse(res, { variant_id: variantId, item_id: itemId }, "Item excluded for this variant", 201);
    } catch (error) {
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }

  static async removeExclusion(req, res) {
    await Promise.all([...variantIdParam, ...itemIdParam].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const variantId = Number(req.params.variantId);
      const itemId = Number(req.params.itemId);
      await models.DetailItemExclusions.destroy({ where: { variant_id: variantId, item_id: itemId } });
      return sendSuccessResponse(res, { variant_id: variantId, item_id: itemId }, "Exclusion removed");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MappingsController;
