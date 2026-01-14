<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const progress = ref(0);

const calculateProgress = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollHeight <= clientHeight) {
    progress.value = 0;
    return;
  }

  const windowHeight = scrollHeight - clientHeight;
  const currentProgress = (scrollTop / windowHeight) * 100;
  progress.value = currentProgress;
};

// 监听滚动
onMounted(() => {
  window.addEventListener("scroll", calculateProgress);
});

// 卸载时移除监听
onUnmounted(() => {
  window.removeEventListener("scroll", calculateProgress);
});
</script>

<template>
  <div class="progress-bar-container">
    <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<style scoped>
.progress-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999; /* 确保在最顶层 */
  pointer-events: none; /* 避免遮挡点击 */
  background: transparent;
}

.progress-bar {
  height: 100%;
  background-color: var(--vp-c-brand);
  transition: width 0.1s ease-out;
}
</style>
