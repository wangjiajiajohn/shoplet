require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS merchants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        app_id VARCHAR(255) NOT NULL COMMENT '小程序AppID',
        app_name VARCHAR(255) DEFAULT '' COMMENT '小程序名称',
        wechat_openid VARCHAR(255) DEFAULT '' COMMENT '老板微信OPENID',
        phone VARCHAR(50) DEFAULT '' COMMENT '联系电话',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_app_id (app_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表'
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

module.exports = { pool, initDatabase };