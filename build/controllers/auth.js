const bcrypt = require('bcryptjs');
const { dataControl } = require('../utils/helper');

exports.login = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const [data] = await lookup('auth', result => result);
    if (!data) {
      // 当前没有用户，直接登入
      return res.status(200).json({
        success: true,
        data: null,
        message: 'directly pass',
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'invalid password',
      });
    }
    const isSame = await bcrypt.compare(req.body.password, data.value);
    if (isSame) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'login successfully',
      });
    } else {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'password is error',
      });
    }
  } catch (error) {
    next(error);
  }
}

exports.setPassword = async (req, res, next) => {
  const { lookup, edit, create, remove, onError } = dataControl();
  async function createNewPassword(password, isEdit) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    await isEdit ? edit('auth', 'password', {
      id: password,
      value: hash
    }) : create('auth', {
      id: 'password', 
      value: hash
    });
  }
  onError(next);
  try {
    const [data] = await lookup('auth', result => result);
    if (!data) {
      // 当前没有用户，直接修改
      if (req.body.newPassword) {
        await createNewPassword(req.body.newPassword);
      }

      return res.status(200).json({
        success: true,
        data: null,
        message: 'set password successfully',
      });
    }
    const isOldSame = bcrypt.compareSync(req.body.oldPassword, data.value)
    if (!req.body.oldPassword || !isOldSame) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'old password is error',
      });
    }
    if (req.body.newPassword) {
      await createNewPassword(req.body.newPassword);
      return res.status(200).json({
        success: true,
        data: null,
        message: 'set password successfully',
      });
    } else {
      remove('auth', 'password');
      return res.status(200).json({
        success: true,
        data: null,
        message: 'password is clear',
      });
    }
  } catch (error) {
    next(error);
  }
}