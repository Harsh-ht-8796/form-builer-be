"use strict";
// import multer from 'multer';
// import path from 'path';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Make sure this directory exists
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const fileFilter = (req: any, file: multer.File, cb: multer.FileFilterCallback) => {
//     // Accept only images for this example
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only image files are allowed!'));
//     }
// };
// export const upload = multer({ storage, fileFilter });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path_1.default.join(__dirname, '../../../../uploads'));
        },
        filename: (_req, file, cb) => {
            const safeName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${path_1.default.extname(file.originalname)}`;
            cb(null, safeName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpe?g|png|gif)$/i;
        if (allowed.test(file.originalname) && file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files allowed'));
        }
    }
});
exports.default = upload;
//# sourceMappingURL=multer.js.map