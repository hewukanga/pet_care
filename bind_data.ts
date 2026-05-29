
import { query, closePool } from './server/db';

// 将bookings表中user_id为NULL的记录绑定到admin
const r1 = await query("UPDATE bookings SET user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1) WHERE user_id IS NULL");
console.log('updated bookings:', r1.rowCount);

// 检查users表存在且admin有正确的密码
const r2 = await query("SELECT username, left(password, 20) as pwd_prefix FROM users WHERE username = 'admin'");
console.log('admin user:', r2.rows[0]);

await closePool();
console.log('done');
