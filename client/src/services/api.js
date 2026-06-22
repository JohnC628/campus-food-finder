// client/src/services/api.js
import axios from 'axios';

// 建立一個 axios 實例，設定後端 API 的基礎網址
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // 你的 Express 伺服器網址
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    // 取得所有餐廳
    getRestaurants() {
        return apiClient.get('/restaurants');
    },
    // 搜尋與篩選
    searchRestaurants(params) {
        // params 會是一個物件，例如 { keyword: '牛', radius: 500 }
        return apiClient.get('/restaurants/search', { params });
    },
    // 透過 ID 取得單一店家詳細資訊
    getRestaurant(id) {
        return apiClient.get(`/restaurants/${id}`);
    }
};