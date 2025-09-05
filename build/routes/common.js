const express = require('express');
const router = express.Router();

router.get('/server-time', (req, res, next) => {
  res.status(200).json({
    success: true,
    data: Date.now(),
    message: 'get current server time successful',
  })
});
module.exports = router;