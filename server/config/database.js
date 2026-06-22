const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 1. 確保 /server/data 目錄存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 2. 連線到 SQLite 資料庫檔案
const dbPath = path.join(dataDir, 'food_map.db');
const db = new Database(dbPath, { verbose: console.log });

// 3. 開啟外鍵約束
db.pragma('foreign_keys = ON');

// 4. 執行建表語法
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS campuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campus_id INTEGER NOT NULL,
    category_id INTEGER,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    open_time TEXT,
    close_time TEXT,
    price_min INTEGER,
    price_max INTEGER,
    avg_rating REAL DEFAULT 0,
    is_student_friendly BOOLEAN DEFAULT 1,
    has_discount BOOLEAN DEFAULT 0,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS restaurant_tags (
    restaurant_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (restaurant_id, tag_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
  );
`);

console.log('👉 [Database] 核心資料表初始化/檢查完成。');

// 5. 自動預填豐富的測試資料 (Seed Data)
const checkEmpty = db.prepare('SELECT COUNT(*) as count FROM campuses').get();

if (checkEmpty.count === 0) {
    console.log('👉 [Database] 偵測到空資料庫，開始寫入多筆豐富的測試資料...');

    const seedTransaction = db.transaction(() => {
        // (1) 使用者
        const insertUser = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
        insertUser.run('admin', 'admin@example.com', 'admin123', 'admin');
        const studentId = insertUser.run('fcu_student', 'student@fcu.edu.tw', 'student123', 'student').lastInsertRowid;

        // (2) 校園基準點 (逢甲大學)
        const campusId = db.prepare('INSERT INTO campuses (name, lat, lng) VALUES (?, ?, ?)').run('逢甲大學', 24.1788, 120.6467).lastInsertRowid;

        // (3) 主分類
        const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
        const catRice = insertCategory.run('飯食').lastInsertRowid;
        const catNoodle = insertCategory.run('麵食').lastInsertRowid;
        const catDrink = insertCategory.run('飲料/點心').lastInsertRowid;
        const catBreakfast = insertCategory.run('早午餐').lastInsertRowid;

        // (4) 標籤
        const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)');
        const t1 = insertTag.run('平價').lastInsertRowid;
        const t2 = insertTag.run('宵夜').lastInsertRowid;
        const t3 = insertTag.run('步行5分鐘').lastInsertRowid;
        const t4 = insertTag.run('有冷氣').lastInsertRowid;
        const t5 = insertTag.run('大份量').lastInsertRowid;

        // (5) 餐廳主表插入語句
        const insertRest = db.prepare(`
            INSERT INTO restaurants (campus_id, category_id, name, address, lat, lng, open_time, close_time, price_min, price_max, note, avg_rating, has_discount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // 店家 1：好味雞肉飯 (近文華路)
        const r1 = insertRest.run(campusId, catRice, '逢甲好味雞肉飯', '台中市西屯區文華路100號', 24.1795, 120.6462, '11:00', '20:30', 65, 110, '學生憑證可免費加飯', 4.5, 1).lastInsertRowid;
        
        // 店家 2：黑街牛肉麵 (福星路深夜場)
        const r2 = insertRest.run(campusId, catNoodle, '黑街深夜牛肉麵', '台中市西屯區福星路380號', 24.1772, 120.6445, '17:00', '02:00', 120, 220, '每週一公休', 4.2, 0).lastInsertRowid;
        
        // 店家 3：爆汁超大雞排 (正門口附近點心)
        const r3 = insertRest.run(campusId, catDrink, '大校園爆汁炸雞排', '台中市西屯區逢甲路20號', 24.1782, 120.6466, '15:00', '23:30', 85, 150, '現點現炸需要等5分鐘', 4.8, 0).lastInsertRowid;
        
        // 店家 4：歐爸韓式炸雞 (稍微偏遠，適合騎車宵夜)
        const r4 = insertRest.run(campusId, catRice, '歐爸韓式炸雞宵夜', '台中市西屯區西安街200號', 24.1825, 120.6421, '18:00', '01:30', 160, 350, '外帶炸雞送小可樂', 4.0, 1).lastInsertRowid;
        
        // 店家 5：歐式晨間早午餐 (校園北側)
        const r5 = insertRest.run(campusId, catBreakfast, '晨間活力歐式早午餐', '台中市西屯區烈美街80號', 24.1812, 120.6482, '06:30', '13:30', 45, 130, '特調奶茶超好喝', 4.4, 0).lastInsertRowid;
        
        // 店家 6：文青風焙茶冰品 (文華路巷弄)
        const r6 = insertRest.run(campusId, catDrink, '藍調焙茶文青特調', '台中市西屯區文華路永新巷5號', 24.1789, 120.6451, '10:00', '22:00', 35, 80, '內用低消一杯飲料有插座', 4.6, 0).lastInsertRowid;
        
        // 店家 7：高CP值學長推爆義大利麵 (福星路路口)
        const r7 = insertRest.run(campusId, catNoodle, '高CP值學長推爆義大利麵', '台中市西屯區福星路500號', 24.1755, 120.6431, '11:30', '21:00', 110, 190, '加麵不加價，飲料無限暢飲', 4.7, 1).lastInsertRowid;

        // (6) 綁定餐廳與標籤的多對多關係
        const insertRestTag = db.prepare('INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (?, ?)');
        
        // 雞肉飯：平價、步行5分鐘、有冷氣
        insertRestTag.run(r1, t1); insertRestTag.run(r1, t3); insertRestTag.run(r1, t4);
        // 牛肉麵：宵夜、有冷氣、大份量
        insertRestTag.run(r2, t2); insertRestTag.run(r2, t4); insertRestTag.run(r2, t5);
        // 雞排：平價、步行5分鐘
        insertRestTag.run(r3, t1); insertRestTag.run(r3, t3);
        // 韓式炸雞：宵夜、有冷氣
        insertRestTag.run(r4, t2); insertRestTag.run(r4, t4);
        // 早午餐：平價、步行5分鐘
        insertRestTag.run(r5, t1); insertRestTag.run(r5, t3);
        // 飲料特調：步行5分鐘、有冷氣
        insertRestTag.run(r6, t3); insertRestTag.run(r6, t4);
        // 義大利麵：平價、大份量、有冷氣
        insertRestTag.run(r7, t1); insertRestTag.run(r7, t4); insertRestTag.run(r7, t5);

        // (7) 插入一筆初始評論
        const insertReview = db.prepare('INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)');
        insertReview.run(r1, studentId, 5, '雞肉飯超嫩！辣椒醬必加，真的是學期末窮苦時的救星！');
        insertReview.run(r7, studentId, 5, '白醬海鮮麵只要130元還能免費加麵，紅茶超好喝，大推！');
    });

    try {
        seedTransaction();
        console.log('✅ [Database] 7筆豐富的校園測試資料已成功預填！');
    } catch (error) {
        console.error('❌ [Database] 預填測試資料失敗:', error);
    }
}

module.exports = db;