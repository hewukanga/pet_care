
import { query, closePool } from './server/db';
import { encryptPassword } from './server/user.dao';

// 1. 查询admin用户ID
const r = await query("SELECT id FROM users WHERE username = 'admin'");
const adminId = r.rows[0].id;
console.log('admin id:', adminId);

// 2. 创建test用户
const encPwd = encryptPassword('admin123');
await query(
  "INSERT INTO users (username, password, nickname, role, active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING",
  ['test', encPwd, '测试用户', 'USER', true]
);
console.log('test user created');

// 查询test用户ID
const r2 = await query("SELECT id FROM users WHERE username = 'test'");
const testId = r2.rows[0].id;
console.log('test id:', testId);

// 3. 初始化评价数据（绑定admin）
const reviews = [
  { userName: '管理员', avatar: '', serviceName: '精品洗护套餐', rating: 5, content: '非常满意！工作人员很细心，我家狗狗洗完毛发特别柔顺，还会再来的。', petType: 'DOG_SMALL' },
  { userName: '管理员', avatar: '', serviceName: '猫咪SPA护理', rating: 5, content: '猫咪平时很怕洗澡，但这家的护理师手法很专业，猫咪居然很享受。推荐！', petType: 'CAT' },
  { userName: '管理员', avatar: '', serviceName: '基础洗护', rating: 4, content: '整体不错，性价比很高。就是周末人有点多，等了十几分钟。', petType: 'DOG_MEDIUM' },
  { userName: '管理员', avatar: '', serviceName: '美容造型', rating: 5, content: '剪得太好看了！我家泰迪做完造型回头率超高，朋友都问在哪做的。', petType: 'DOG_SMALL' },
  { userName: '管理员', avatar: '', serviceName: '健康体检套餐', rating: 4, content: '检查很全面，医生讲解也很详细。价格稍微贵了点但值得。', petType: 'DOG_LARGE' },
];

for (const rv of reviews) {
  await query(
    `INSERT INTO reviews (user_id, user_name, avatar, service_name, rating, content, images, pet_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [adminId, rv.userName, rv.avatar, rv.serviceName, rv.rating, rv.content, [], rv.petType]
  );
}
console.log('5 reviews inserted for admin');

await closePool();
console.log('done');
