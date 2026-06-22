import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Detail from '../views/Detail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/restaurant/:id',
    name: 'Detail',
    component: Detail
  }
];

const router = createRouter({
  // 關鍵修改：改用 Hash 模式 (會在網址加上 /#/)
  // 這是解決 GitHub Pages 找不到網頁 (404) 與白畫面的最佳解法
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
});

export default router;