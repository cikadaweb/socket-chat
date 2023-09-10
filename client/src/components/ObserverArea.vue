<template>
  <div class="observer" ref="observerElement">
  </div>
</template>

<script setup>
/* eslint-disable */
  import { ref, onMounted, onBeforeUnmount, defineEmits, defineProps } from 'vue';

  const props = defineProps(['options']);
  const emits = defineEmits(['intersect']);

  const observer = ref(null);
  const observerElement = ref(null);

  onMounted(() => {
    const options = props.options || {};
    observer.value = new IntersectionObserver(([entry], options) => {
      if (entry && entry.isIntersecting) {
        emits('intersect');
      }
    });

    observer.value.observe(observerElement.value);
  });

  onBeforeUnmount(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
  });
</script>

<style scoped>
  .observer {
    background-color: pink;
    height: 300px;
  }
</style>