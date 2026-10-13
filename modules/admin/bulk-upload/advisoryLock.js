// Single-import-at-a-time guard. Uses a transaction-scoped Postgres advisory
// lock rather than an in-memory flag (unsafe under PM2's multiple Node
// processes) or a Redis lock (this codebase treats Redis as a best-effort
// cache that's designed to degrade silently on outage — wrong trade-off for
// mutual exclusion). pg_advisory_xact_lock is held by the connection running
// the transaction and is released automatically on commit, rollback, or
// connection loss, with no extra cleanup code.
//
// Blocks (does not fail) if another commit for the same entity is already
// running — the caller's transaction simply waits until the other one
// finishes, then proceeds with a fresh read of DB state for its own
// uniqueness re-checks.

const acquireImportLock = async (transaction, entity) => {
  await transaction.sequelize.query("SELECT pg_advisory_xact_lock(hashtext(:key))", {
    replacements: { key: `bulk-import:${entity}` },
    transaction,
  });
};

module.exports = { acquireImportLock };
