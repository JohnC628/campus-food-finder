<template>
  <header class="navbar">
    <div class="logo">🎓 校園周邊美食地圖</div>
    <div class="user-actions">
      <button class="login-btn">登入</button>
    </div>
  </header>
</template>

<script setup>
// 目前沒有複雜邏輯，未來這裡可以引入 UserStore 來判斷登入狀態
</script>

<style scoped>
/* 頂部導覽列樣式 */
.navbar {
  background: white;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  cursor: pointer;
}

.login-btn {
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #42b883;
  color: white;
}
</style>