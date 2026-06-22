import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 👇 新增這行，請確保這裡的名稱與你在 GitHub 建立的 Repository 名稱完全一致
  base: '/campus-food-finder/', 
})