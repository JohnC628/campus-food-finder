<template>
  <div class="map-wrapper">
    <l-map 
      style="height: 400px; width: 100%; z-index: 1;" 
      :zoom="16" 
      :center="[campusCenter.lat, campusCenter.lng]"
    >
      <l-tile-layer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      ></l-tile-layer>

      <l-marker :lat-lng="[campusCenter.lat, campusCenter.lng]">
        <l-popup>🎓 逢甲大學 (中心點)</l-popup>
      </l-marker>

      <l-marker
        v-for="rest in restaurants"
        :key="rest.id"
        :lat-lng="[rest.lat, rest.lng]"
      >
        <l-popup>
          <strong style="font-size: 1.1em; color: #2c3e50;">{{ rest.name }}</strong><br>
          <span v-if="rest.distance">🚶 距離: {{ rest.distance }} 公尺</span>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup>
// ⚠️ 這行 CSS 超級重要！沒有引入的話，地圖會像拼圖一樣散開
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';

defineProps({
  restaurants: {
    type: Array,
    required: true
  },
  campusCenter: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.map-wrapper {
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  border-radius: 12px;
  /* 確保圓角效果能蓋過地圖 */
  overflow: hidden; 
  /* 避免 Leaflet 預設層級太高擋住我們上方的導覽列 */
  position: relative;
  z-index: 1; 
}
</style>