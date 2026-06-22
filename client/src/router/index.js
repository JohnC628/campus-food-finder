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
    path: '/restaurant/:id', // 動態路由，例如 /restaurant/1
    name: 'Detail',
    component: Detail
  }
];

const router = createRouter({
  // 使用最穩定的 Hash 模式，括號內留空，不要放任何東西
  history: createWebHashHistory(),
  routes
});

export default router;