<template>
  <div class="main-page">
    <ul class="main-page__chat-list">
      <li class="main-page__chat-item">
        <router-link class="main-page__link" :to="{ name: 'ChatPage', params: { chatId: '1' } }">Открыть чать 1</router-link>
      </li>
      <li class="main-page__chat-item">
        <router-link class="main-page__link" :to="{ name: 'ChatPage', params: { chatId: '2' } }">Открыть чать 2</router-link>
      </li>
      <li class="main-page__chat-item">
        <router-link class="main-page__link" :to="{ name: 'ChatPage', params: { chatId: '3' } }">Открыть чать 3</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>

</script>

<style scoped>
  .main-page {
    text-align: center;
  }
  .main-page__chat-list {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 50px 0 0;
  }
  .main-page__chat-item {
    background-color: #3d2aac;
    border-radius: 8px;
  }
  .main-page__link {
    display: block;
    font-size: 20px;
    color: #ffff;
    padding: 16px 32px;
    text-decoration: none;
  }
</style>