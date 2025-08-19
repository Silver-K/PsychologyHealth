const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FILE_SIZE_LIMIT = process.env.MAX_FILE_SIZE || 1024 * 1024 * 1024; // 文件上传大小限制

// 确保上传目录存在
const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// mimetype和常用后缀名映射，用于指导上传文件类型错误信息
const MIMETYPE_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png', 
  'image/gif': 'gif', 
  'application/pdf': 'pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}
// 文件过滤
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型。允许的类型: ' + allowedTypes.map((t) => MIMETYPE_MAP[t]).join(', ')), false);
  }
};

// 上传配置
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  FILE_SIZE_LIMIT
};