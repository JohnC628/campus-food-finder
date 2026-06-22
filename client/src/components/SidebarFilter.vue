<template>
  <aside class="sidebar">
    <h3>🔍 篩選條件</h3>
    
    <div class="filter-group">
      <label>關鍵字搜尋</label>
      <input type="text" v-model="filters.keyword" placeholder="例如：牛肉麵、水餃">
    </div>

    <div class="filter-group">
      <label>距離學校 (公尺)</label>
      <select v-model="filters.radius">
        <option value="500">500m 以內 (步行 5 分鐘)</option>
        <option value="1000">1km 以內 (步行 10 分鐘)</option>
        <option value="2000">2km 以內 (需騎車)</option>
      </select>
    </div>

    <div class="filter-group">
      <label>最高價格: ${{ filters.max_price }}</label>
      <input type="range" v-model="filters.max_price" min="50" max="500" step="10">
    </div>

    <div class="filter-group checkbox-group">
      <input type="checkbox" id="isOpen" v-model="filters.is_open">
      <label for="isOpen">🟢 目前營業中</label>
    </div>

    <button class="search-btn" @click="emitSearch">套用篩選</button>
  </aside>
</template>

<script setup>
import { reactive } from 'vue';

// 定義可以往外傳遞的事件
const emit = defineEmits(['search']);

// 表單綁定的響應式狀態
const filters = reactive({
  keyword: '',
  radius: 500,
  max_price: 200,
  is_open: false
});

// 當點擊按鈕時，把目前的條件發送給父元件
const emitSearch = () => {
  emit('search', { ...filters });
};
</script>

<style scoped>
.sidebar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  position: sticky;
  top: 20px; /* 讓側邊欄在滾動時固定在畫面上方 */
}

.filter-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
}

input[type="text"], select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  cursor: pointer;
}

.search-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #33a06f;
}
</style>