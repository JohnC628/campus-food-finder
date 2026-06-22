<template>
  <div class="main-container">
    
    <SidebarFilter class="sidebar-wrapper" @search="handleSearch" />
    
    <main class="content-wrapper">
      
      <div class="status-bar">
        <h2>探索周邊美食</h2>
        <span v-if="loading" class="loading">⏳ 載入中...</span>
      </div>

      <p v-if="error" class="error-msg">⚠️ {{ error }}</p>

      <MapContainer 
        v-if="!error"
        :restaurants="restaurants" 
        :campusCenter="campusLocation" 
      />

      <div class="restaurant-grid" v-if="!loading && restaurants.length > 0">
        <RestaurantCard 
          v-for="rest in restaurants" 
          :key="rest.id" 
          :restaurant="rest" 
        />
      </div>
      
      <div class="empty-state" v-else-if="!loading && restaurants.length === 0">
        🍽️ 找不到符合條件的餐廳，試試放寬篩選條件吧！
      </div>
      
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

// 引入拆分好的 UI 元件 (注意路徑變成 '../components/...')
import SidebarFilter from '../components/SidebarFilter.vue';
import RestaurantCard from '../components/RestaurantCard.vue';
import MapContainer from '../components/MapContainer.vue';

// 定義響應式狀態
const restaurants = ref([]);
const loading = ref(false);
const error = ref(null);

// 預設校園基準點 (逢甲大學)
const campusLocation = {
  lat: 24.1788,
  lng: 120.6467
};

// 接收來自 SidebarFilter 的篩選條件，並呼叫 API
const handleSearch = async (filters) => {
  loading.value = true;
  error.value = null;
  try {
    const searchPayload = {
      ...filters,
      lat: campusLocation.lat,
      lng: campusLocation.lng
    };
    
    const response = await api.searchRestaurants(searchPayload);
    restaurants.value = response.data;
  } catch (err) {
    error.value = '無法取得資料，請確認後端伺服器是否已啟動。';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 網頁初次載入時，預設先搜尋一次
onMounted(() => {
  handleSearch({
    radius: 1000, 
    max_price: 300,
    is_open: false
  });
});
</script>

<style scoped>
/* 主要排版 (左側篩選 300px，右側自適應) */
.main-container {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

/* 左側側邊欄包裝器 */
.sidebar-wrapper {
  width: 300px;
  flex-shrink: 0;
}

/* 右側內容包裝器 */
.content-wrapper {
  flex: 1;
  min-width: 0;
}

/* 狀態列 (標題與載入中) */
.status-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.status-bar h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.loading {
  color: #42b883;
  font-weight: bold;
}

.error-msg {
  color: #e74c3c;
  background-color: #fadbd8;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: bold;
}

/* 餐廳網格系統 */
.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 無資料狀態 */
.empty-state {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 12px;
  color: #7f8c8d;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
</style>