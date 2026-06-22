<template>
  <div class="app-layout">
    <Navbar />
    
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>

<style>
/* 這裡只留最基礎的共用樣式 */
body {
  margin: 0;
  background-color: #f4f7f6;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
</style>