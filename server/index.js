const express = require('express');
const cors = require('cors');
const db = require('./config/database'); // 引入你寫好的 SQLite 資料庫連線設定

const app = express();
const PORT = 3000;

// 啟用跨來源資源共享 (讓 Port 5173 的前端可以呼叫 Port 3000 的後端)
app.use(cors());
app.use(express.json());

// 經緯度距離計算函數 (Haversine 公式)，回傳單位為公尺 (m)
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半徑 (公尺)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// 📌 API 1: 取得所有餐廳基本列表
app.get('/api/restaurants', (req, res) => {
    try {
        const restaurants = db.prepare('SELECT * FROM restaurants').all();
        
        // 為每間餐廳撈取對應的標籤 (Tags)
        restaurants.forEach(rest => {
            rest.tags = db.prepare(`
                SELECT t.id, t.name FROM tags t
                JOIN restaurant_tags rt ON t.id = rt.tag_id
                WHERE rt.restaurant_id = ?
            `).all(rest.id);
        });
        
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 API 2: 條件篩選餐廳 (關鍵字、價格、距離)
app.get('/api/restaurants/search', (req, res) => {
    try {
        const { keyword, radius, max_price, lat, lng } = req.query;
        
        let query = 'SELECT * FROM restaurants WHERE 1=1';
        const params = [];

        // 關鍵字篩選
        if (keyword) {
            query += ' AND name LIKE ?';
            params.push(`%${keyword}%`);
        }
        // 預算上限篩選
        if (max_price) {
            query += ' AND price_min <= ?';
            params.push(Number(max_price));
        }

        let restaurants = db.prepare(query).all(...params);

        // 附加標籤並動態計算與學校中心點的距離
        restaurants.forEach(rest => {
            rest.tags = db.prepare(`
                SELECT t.id, t.name FROM tags t
                JOIN restaurant_tags rt ON t.id = rt.tag_id
                WHERE rt.restaurant_id = ?
            `).all(rest.id);

            if (lat && lng) {
                rest.distance = getDistance(Number(lat), Number(lng), rest.lat, rest.lng);
            }
        });

        // 依據前端傳入的距離範圍 (例如 500m) 進行過濾
        if (radius && lat && lng) {
            restaurants = restaurants.filter(rest => rest.distance <= Number(radius));
        }

        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 API 3: 取得單一餐廳詳細資訊 (用於詳情頁)
app.get('/api/restaurants/:id', (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id);
        
        if (!restaurant) {
            return res.status(404).json({ error: '找不到該餐廳資訊' });
        }

        // 撈取該店家的標籤
        restaurant.tags = db.prepare(`
            SELECT t.id, t.name FROM tags t
            JOIN restaurant_tags rt ON t.id = rt.tag_id
            WHERE rt.restaurant_id = ?
        `).all(id);

        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 啟動監聽
app.listen(PORT, () => {
    console.log(`🚀 [Server] 後端 Express 伺服器已在 http://localhost:${PORT} 成功運作！`);
});