const multer = require('multer');
/**
 * https://www.npmjs.com/package/multer
 * */ 

const MAX = 1e7; // 10mb
const FILE_LIMIT = 1;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX,
    files: FILE_LIMIT,
  },
  fileFilter: (req, file, cb) => {
    const [, extension] = file.mimetype.split('/');
    if(!['jpg', 'jpeg', 'png'].includes(extension.toLowerCase()))
      return cb('invalid_ext', false);
    cb(null, true);
  },
});

const uploadFile = (req, res, next) => {
  return upload.single('image')(req, res, next);
};

module.exports = uploadFile;
