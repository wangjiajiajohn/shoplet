require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { pool } = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: '登录成功',
      token,
      user: { username, role: 'admin' }
    });
  }

  return res.status(401).json({ success: false, message: '用户名或密码错误' });
});

router.post('/wechat/login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: '缺少code' });
  }

  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = response.data;

    if (!openid) {
      return res.status(400).json({ success: false, message: '获取openid失败' });
    }

    const [rows] = await pool.execute(
      'SELECT id, app_id, app_name, phone FROM merchants WHERE wechat_openid = ?',
      [openid]
    );

    if (rows.length > 0) {
      const merchant = rows[0];
      const token = jwt.sign(
        { openid, merchantId: merchant.id, role: 'merchant' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        isMerchant: true,
        token,
        merchant
      });
    }

    return res.json({
      success: true,
      isMerchant: false,
      openid
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;