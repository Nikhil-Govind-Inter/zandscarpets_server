// Per-kind size limits for the Dynamic Details media library, shared by
// the upload route (outer multer ceiling) and the controller (the real,
// kind-specific check — multer itself can only enforce one global number
// per instance, not "image vs video").
const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

module.exports = { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES };
