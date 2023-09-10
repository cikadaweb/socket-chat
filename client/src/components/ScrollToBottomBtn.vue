<template>
  <button class="chat-scrolltobottom-btn" :style="{ top: `${top}px` }"></button>
</template>

<script setup>
/* eslint-disable */
  defineProps({
    top: {
      type: Number
    }
  })
</script>