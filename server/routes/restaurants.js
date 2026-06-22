// server/routes/restaurants.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// [GET] /api/restaurants
// 取得所有餐廳列表 (實務上這裡會加上分頁或 campus_id 篩選)
router.get('/', (req, res) => {
    try {
        // 簡單撈取所有餐廳
        const stmt = db.prepare('SELECT * FROM restaurants');
        const restaurants = stmt.all();
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '伺服器發生錯誤' });
    }
});

// --- 請將這段程式碼加在 router.get('/:id') "之前" ---

// [GET] /api/restaurants/search
// 支援 Query String 篩選: ?keyword=麵&max_price=100&lat=24.1788&lng=120.6467&radius=500&is_open=true
router.get('/search', (req, res) => {
    // 取得前端傳來的篩選條件
    const { keyword, category_id, max_price, lat, lng, radius, is_open } = req.query;

    try {
        // 1. 動態組裝 SQL 查詢語句 (Dynamic SQL)
        let query = 'SELECT * FROM restaurants WHERE 1=1';
        const params = [];

        if (keyword) {
            query += ' AND (name LIKE ? OR address LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category_id) {
            query += ' AND category_id = ?';
            params.push(category_id);
        }

        if (max_price) {
            query += ' AND price_min <= ?';
            params.push(max_price);
        }

        // 執行基礎的 SQL 篩選
        const stmt = db.prepare(query);
        let results = stmt.all(...params);

        // 2. 距離篩選 (使用 JavaScript 計算 Haversine 直線距離)
        if (lat && lng && radius) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxRadius = parseFloat(radius); // 單位：公尺

            results = results.filter(rest => {
                const distance = getDistanceFromLatLonInM(userLat, userLng, rest.lat, rest.lng);
                rest.distance = Math.round(distance); // 把算好的距離直接塞進物件，前端可以直接顯示 "距離 350m"
                return distance <= maxRadius;
            });
            
            // 依距離由近到遠排序
            results.sort((a, b) => a.distance - b.distance);
        }

        // 3. 營業時間篩選
        if (is_open === 'true') {
            const now = new Date();
            // 將現在時間轉換為 'HH:MM' 格式 (例如 '14:05')
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            
            results = results.filter(rest => {
                if (!rest.open_time || !rest.close_time) return false;
                
                // 處理跨夜營業的情況 (例如 黑街牛肉麵 17:00 ~ 02:00)
                if (rest.open_time <= rest.close_time) {
                    // 正常營業時間 (例如 08:00 ~ 22:00)
                    return currentTime >= rest.open_time && currentTime <= rest.close_time;
                } else {
                    // 跨夜營業，只要大於開店時間 或 小於關店時間都算營業中
                    return currentTime >= rest.open_time || currentTime <= rest.close_time;
                }
            });
        }

        res.json(results);
    } catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({ error: '搜尋發生錯誤' });
    }
});

// --- 距離計算輔助函式 (Haversine formula) ---
// 請把這兩個 Function 放在檔案的最底部
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半徑 (公尺)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// [GET] /api/restaurants/campus/:campusId
// 取得特定校園周邊的餐廳
router.get('/campus/:campusId', (req, res) => {
    try {
        const campusId = req.params.campusId;
        const stmt = db.prepare('SELECT * FROM restaurants WHERE campus_id = ?');
        const restaurants = stmt.all(campusId);
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '伺服器發生錯誤' });
    }
});

// [GET] /api/restaurants/:id
// 取得單一餐廳詳細資訊 (包含關聯的標籤)
router.get('/:id', (req, res) => {
    try {
        const restaurantId = req.params.id;
        
        // 1. 撈取餐廳基本資料
        const restStmt = db.prepare('SELECT * FROM restaurants WHERE id = ?');
        const restaurant = restStmt.get(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ error: '找不到該餐廳' });
        }

        // 2. 透過 JOIN 撈取該餐廳擁有的標籤
        const tagsStmt = db.prepare(`
            SELECT t.id, t.name 
            FROM tags t
            JOIN restaurant_tags rt ON t.id = rt.tag_id
            WHERE rt.restaurant_id = ?
        `);
        restaurant.tags = tagsStmt.all(restaurantId);

        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '伺服器發生錯誤' });
    }
});

module.exports = router;