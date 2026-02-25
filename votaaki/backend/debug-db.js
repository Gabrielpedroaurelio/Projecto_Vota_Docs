import db from './db/config.js';
import fs from 'fs';

async function debug() {
  let log = '';
  const append = (msg) => {
    log += msg + '\n';
    console.log(msg);
  };
  try {
    append('--- START DEBUG ---');
    append('DB Config: ' + JSON.stringify({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    }));

    append('Testing simple query...');
    const [test] = await db.execute('SELECT 1 + 1 AS result');
    append('Simple query OK: ' + JSON.stringify(test));

    append('Testing User table query...');
    const [users] = await db.execute('SELECT * FROM User LIMIT 1');
    append('User table OK: ' + JSON.stringify(users));
    
    append('Testing full getUsers query...');
    const limit = 10;
    const offset = 0;
    let query = 'SELECT id_user, name, email FROM User ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const params = [limit, offset];
    
    const [result] = await db.execute(query, params);
    append('Full query OK. Total: ' + result.length);
    
  } catch (error) {
    append('!!! DEBUG ERROR: ' + error.message);
    append('STACK: ' + error.stack);
  } finally {
    fs.writeFileSync('debug-result.txt', log);
    console.log('--- DEBUG FINISHED ---');
    process.exit();
  }
}

debug();
