const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');

// 文件名编码问题
exports.fixFileNameEncoding = (req, res, next) => {
  if (req.files || req.file) {
    const files = [req.files || req.file].flat();
    files.forEach(file => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    });
  }
  next();
};

// 上传文件
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({ success: false, message: '没有文件被上传' });
    }

    // 处理单文件上传
    if (req.file) {
      return res.status(201).json({
        message: '文件上传成功',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path
        },
        success: true,
      });
    }

    // 处理多文件上传
    if (req.files) {
      const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
      const fileDetails = files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }));

      return res.status(201).json({
        message: `${files.length}个文件上传成功`,
        files: fileDetails,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// 下载文件
exports.downloadFile = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    // 检查文件是否存在
    const fileExists = await fs.access(filePath)
      .then(() => true)
      .catch(() => false);
    console.log(`file ${filename} not exists`);
    if (!fileExists) {
      return res.status(404).json({ message: '文件不存在' });
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 创建文件流并发送
    const fileStream = fsSync.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
};

// 获取文件列表
exports.getFileList = async (req, res, next) => {
  try {
    // 读取上传目录
    const files = await fs.readdir(uploadDir);

    // 获取文件详细信息
    const fileDetails = [];
    for (const file of files) {
      const stats = await fs.stat(path.join(uploadDir, file));
      if (stats.isFile()) {
        fileDetails.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        });
      }
    }

    res.status(200).json({
      message: '文件列表获取成功',
      count: fileDetails.length,
      files: fileDetails,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFile = async (req, res, next) => {
  try {
    const temp = req.query['filename[]'];
    const willRemoveFiles = [];
    const notFiles = [];
    if (temp) {
      const files = [temp].flat();
      let count = 0;
      for (const file of files) {
        const stats = await fs.stat(path.join(uploadDir, file));
        if (stats.isFile()) {
          count++;
          willRemoveFiles.push(file);
        } else {
          notFiles.push(file);
        }
      }
      for (const file of willRemoveFiles) {
        await fs.unlink(path.join(uploadDir, file));
      }
      res.status(200).json({
        message: `成功删除${count}个文件${notFiles.length ? `;未找到${notFiles.length}个文件` : ''}`,
        count,
        success: true,
      });
    } else {
      throw new Error('未获取到filename数组');
    }
  } catch (error) {
    next(error);
  }
}
