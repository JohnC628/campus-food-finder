<template>
  <div class="card" @click="$router.push(`/restaurant/${restaurant.id}`)">
    <div class="card-header">
      <h3 class="name">{{ restaurant.name }}</h3>
      <span class="rating">⭐ {{ restaurant.avg_rating }}</span>
    </div>
    
    <div class="card-body">
      <p class="address">📍 {{ restaurant.address }}</p>
      <p class="time">⏰ {{ restaurant.open_time }} - {{ restaurant.close_time }}</p>
      <p class="price">💰 ${{ restaurant.price_min }} ~ ${{ restaurant.price_max }}</p>
      
      <p v-if="restaurant.distance" class="distance">
        🚶 距離 {{ restaurant.distance }}m
      </p>
    </div>

    <div class="card-footer" v-if="restaurant.tags && restaurant.tags.length">
      <span class="tag" v-for="tag in restaurant.tags" :key="tag.id">
        #{{ tag.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer; /* 👈 讓滑鼠變成手指形狀，提示可點擊 */
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.name {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.rating {
  font-weight: bold;
  color: #f39c12;
}

.card-body p {
  margin: 4px 0;
  color: #555;
  font-size: 0.95rem;
}

.distance {
  color: #e74c3c !important;
  font-weight: bold;
  background: #fdf0ed;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px !important;
}

.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto; /* 讓標籤始終沉在卡片底部 */
  padding-top: 8px;
}

.tag {
  background-color: #e8f8f5;
  color: #1abc9c;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>