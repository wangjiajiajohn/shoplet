const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM merchants ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('查询商家列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM merchants WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '商家不存在' });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('查询商家失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { app_id, app_name, wechat_openid, phone } = req.body;

  if (!app_id) {
    return res.status(400).json({ success: false, message: '请输入小程序AppID' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO merchants (app_id, app_name, wechat_openid, phone) VALUES (?, ?, ?, ?)',
      [app_id, app_name || '', wechat_openid || '', phone || '']
    );

    const [rows] = await pool.execute('SELECT * FROM merchants WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: '添加成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('添加商家失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: '该小程序已存在' });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { app_name, wechat_openid, phone } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE merchants SET app_name = ?, wechat_openid = ?, phone = ? WHERE id = ?',
      [app_name || '', wechat_openid || '', phone || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '商家不存在' });
    }

    const [rows] = await pool.execute('SELECT * FROM merchants WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '更新成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('更新商家失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM merchants WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '商家不存在' });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除商家失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/check', async (req, res) => {
  const { openid, app_id } = req.body;

  if (!openid || !app_id) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM merchants WHERE app_id = ? AND wechat_openid = ?',
      [app_id, openid]
    );

    res.json({
      success: true,
      isMerchant: rows.length > 0
    });
  } catch (error) {
    console.error('验证商家身份失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;