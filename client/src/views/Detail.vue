<template>
  <div class="detail-container" v-if="restaurant">
    <button class="back-btn" @click="$router.push('/')">🔙 回到地圖</button>
    
    <div class="header-section">
      <h1>{{ restaurant.name }}</h1>
      <span class="rating">⭐ {{ restaurant.avg_rating }}</span>
    </div>

    <div class="info-section">
      <p>📍 地址：{{ restaurant.address }}</p>
      <p>⏰ 營業時間：{{ restaurant.open_time }} - {{ restaurant.close_time }}</p>
      <p>💰 價格區間：${{ restaurant.price_min }} ~ ${{ restaurant.price_max }}</p>
      <p v-if="restaurant.note">📝 備註：{{ restaurant.note }}</p>
    </div>
  </div>
  <div class="loading-state" v-else>
    <h2>⏳ 載入店家資訊中...</h2>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const restaurant = ref(null);

onMounted(async () => {
  const id = route.params.id; 
  try {
    const response = await api.getRestaurant(id);
    restaurant.value = response.data;
  } catch (error) {
    console.error('無法取得店家資訊', error);
  }
});
</script>

<style scoped>
.detail-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.back-btn {
  background: none;
  border: none;
  color: #42b883;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 0;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.header-section h1 {
  margin: 0;
  color: #2c3e50;
}
.rating {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f39c12;
}
.info-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  margin: 10px 0;
}
.loading-state {
  text-align: center;
  margin-top: 50px;
  color: #7f8c8d;
}
</style>