// import multer from 'multer';
// import path from 'path';

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

import multer from 'multer';
import path from 'path';

 const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(__dirname, '../../../../uploads'));
    },
    filename: (_req, file, cb) => {
      const safeName = `${Date.now()}-${Math.random().toString(36).substr(2,6)}${path.extname(file.originalname)}`;
      cb(null, safeName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif)$/i;
    if (allowed.test(file.originalname) && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});
export default upload;