const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { ApiResponse } = require("../traits/response");
const { HttpError } = require("../traits/HttpError");

const UPLOAD_SUBFOLDER = "contact-enquiries";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — documents run larger than the admin image uploads' 5MB

const getStorage = () => {
  const uploadPath = path.join("uploads", UPLOAD_SUBFOLDER);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
};

const upload = multer({
  storage: getStorage(),
  fileFilter: (req, file, cb) => {
    const allowedExt = /pdf|doc|docx/;
    const allowedMime = /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;

    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMime.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new HttpError("Only PDF, DOC, or DOCX files are allowed", 400, "INVALID_FILE_TYPE"));
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Resolves its own errors via ApiResponse instead of calling next(err) — the
// globally-mounted admin errorMiddleware (app.use in server.js) uses a
// different response shape than frontend's ApiResponse envelope, so every
// frontend error path needs to respond for itself.
const contactEnquiryUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return ApiResponse.error(res, { message: err.message, status: 400, error_code: "MULTER_ERROR" });
    }
    if (err) {
      return ApiResponse.error(res, {
        message: err.message,
        status: err.statusCode || 400,
        error_code: err.errorCode || "UPLOAD_ERROR",
      });
    }
    next();
  });
};

const deleteOldFile = async (filePath) => {
  if (!filePath) return;

  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fsPromises.unlink(fullPath);
    }
  } catch (error) {
    console.error(`Failed to delete old file: ${filePath}`, error);
  }
};

module.exports = {
  contactEnquiryUpload,
  deleteOldFile,
};
