const express = require('express');
const router = express.Router();
const { upload } = require('../config/upload');
const fileController = require('../controllers/fileController');

// 上传文件 - 支持单文件和多文件
router.post('/upload', upload.single('file'), fileController.fixFileNameEncoding, fileController.uploadFile);
router.post('/upload/multiple', upload.array('files', 10), fileController.fixFileNameEncoding, fileController.uploadFile); // 多文件上传

// 下载文件
router.get('/download/:filename', fileController.downloadFile);

// 获取文件列表
router.get('/', fileController.getFileList);

router.delete('/remove', fileController.removeFile);

module.exports = router;