// Display-only reference ids for the lead forms that don't store a code of their own
// (quote requests keep their stored ZSC-INQ-<n> `reference_code`).
const REFERENCE_PREFIX = {
  contact: "ZSC-CON",
  sample: "ZSC-SMP",
  download: "ZSC-DWN",
};

const formatReferenceId = (kind, id) => (id ? `${REFERENCE_PREFIX[kind]}-${id}` : null);

module.exports = { formatReferenceId };
