import { getDatabase } from './src/db/builtin-sqlite.js';
const db = getDatabase();
for (const t of ['tasks','task_steps','task_logs']) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all();
  console.log('TABLE', t);
  console.log(JSON.stringify(cols, null, 2));
}
