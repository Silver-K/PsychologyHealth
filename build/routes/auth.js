const express = require('express');
const { upload } = require('../config/upload');
const { login, setPassword } = require('../controllers/auth');
const router = express.Router();

router.post('/login', upload.none(), login);
router.post('/set-password', upload.none(), setPassword);

module.exports = router;