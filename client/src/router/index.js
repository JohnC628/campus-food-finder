// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Detail from '../views/Detail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/restaurant/:id', // :id 是動態參數，例如 /restaurant/1
    name: 'Detail',
    component: Detail
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;