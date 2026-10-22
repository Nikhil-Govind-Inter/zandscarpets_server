// Human-facing reference code shown to customers and admins, e.g. "ZSC-INQ-754".
// Derived from the row's own autoincrement id, so uniqueness is structural -
// no collision retry needed (unlike slugHelper/skuHelper, which generate from
// arbitrary text and can collide).
const formatQuoteReferenceCode = (id) => `ZSC-INQ-${id}`;

const assignQuoteReferenceCode = async (quoteRequest, { transaction } = {}) => {
  const code = formatQuoteReferenceCode(quoteRequest.id);
  await quoteRequest.update({ reference_code: code }, { transaction });
  return code;
};

module.exports = { formatQuoteReferenceCode, assignQuoteReferenceCode };
