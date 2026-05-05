import multer from "multer";
import { ALLOWED_IMAGE_MIMETYPES } from "../lib/image-processing.js";
const maxBytes = 8 * 1024 * 1024;
export const uploadProductImageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_MIMETYPES.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("INVALID_IMAGE_TYPE"));
    },
}).single("file");
//# sourceMappingURL=product-image-upload.middleware.js.map