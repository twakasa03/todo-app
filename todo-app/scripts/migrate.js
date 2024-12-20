require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('データベースマイグレーションを開始します...');

    // マイグレーションファイルの読み込み
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', 'create_tasks_table.sql'),
      'utf8'
    );

    // マイグレーションの実行
    await client.query(migrationSQL);
    console.log('マイグレーションが正常に完了しました！');

  } catch (err) {
    console.error('マイグレーション中にエラーが発生しました:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// マイグレーションの実行
migrate().catch(err => {
  console.error('Critical error:', err);
  process.exit(1);
}); 