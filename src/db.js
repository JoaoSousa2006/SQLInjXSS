const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'neverend',
  password: process.env.DB_PASSWORD || 'neverend_local_dev',
  database: process.env.DB_NAME || 'neverend_lab',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4'
};

const safePool = mysql.createPool({ ...config, multipleStatements: false });
const vulnerablePool = mysql.createPool({ ...config, multipleStatements: true });

async function waitForDatabase(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const connection = await safePool.getConnection();
      await connection.ping();
      connection.release();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  throw new Error(`MySQL não ficou disponível: ${lastError?.message || 'tempo esgotado'}`);
}

module.exports = { safePool, vulnerablePool, waitForDatabase };
