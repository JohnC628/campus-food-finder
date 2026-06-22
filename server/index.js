// server/index.js
const express = require('express');
const cors = require('cors');

// 建立 Express 實例
const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體 (Middleware) 設定
app.use(cors()); // 允許前端 Vue (通常在 port 5173) 跨域請求 API
app.use(express.json()); // 解析 JSON 格式的請求本體

// 載入資料庫 (這會觸發我們剛剛寫的 database.js，確保資料表存在)
require('./config/database');

// 載入路由模組
const restaurantRoutes = require('./routes/restaurants');

// 設定 API 路由前綴
app.use('/api/restaurants', restaurantRoutes);

// 基本的根路由測試
app.get('/', (req, res) => {
    res.send('校園美食地圖 API 伺服器運作中！');
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器已啟動，聆聽 Port: ${PORT}`);
    console.log(`測試 API: http://localhost:${PORT}/api/restaurants`);
});