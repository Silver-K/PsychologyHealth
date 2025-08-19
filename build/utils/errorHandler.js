const { prettyMemorySize } = require('./helper');
const { FILE_SIZE_LIMIT } = require('../config/upload');

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.message.includes('File too large')) {
    return res.status(400).json({ success: false, message: `文件大小超过${prettyMemorySize(FILE_SIZE_LIMIT)}` });
  }
  // 文件类型错误
  if (err.message.includes('不支持的文件类型')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  // Multer错误处理
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // 默认服务器错误
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};