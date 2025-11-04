<template>
  <Transition name="loading-fade">
    <div v-if="isLoading" class="loading-page" @click="handleClick">
      <BackgroundLines class="flex items-center justify-center w-full flex-col px-4">
        <img src="/singatrain.png" alt="SingaTrain" class="loading-logo" />
        <p class="loading-subtitle">
          Your Singapore MRT companion
        </p>
        <p class="loading-hint">
          Click anywhere to continue
        </p>
      </BackgroundLines>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import BackgroundLines from './ui/BackgroundLines.vue';

const isLoading = ref(true);
const emit = defineEmits(['loaded']);

function handleClick() {
  isLoading.value = false;
  emit('loaded');
}
</script>

<style scoped>
.loading-page {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.loading-logo {
  max-width: clamp(300px, 60vw, 600px);
  width: 100%;
  height: auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 20;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(2deg);
  }
  50% {
    transform: translateY(-20px) rotate(0deg);
  }
  75% {
    transform: translateY(-15px) rotate(-2deg);
  }
}

.loading-subtitle {
  max-width: 36rem;
  margin: 0 auto;
  text-align: center;
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  color: #525252;
  padding: 0 1rem;
  position: relative;
  z-index: 20;
}

body.dark-mode .loading-subtitle {
  color: #9ca3af;
}

.loading-hint {
  max-width: 36rem;
  margin: 2rem auto 0;
  text-align: center;
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
  color: #9ca3af;
  padding: 0 1rem;
  position: relative;
  z-index: 20;
  opacity: 0.7;
  animation: pulse 2s ease-in-out infinite;
}

body.dark-mode .loading-hint {
  color: #6b7280;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Transition animations */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* Utility classes */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.w-full {
  width: 100%;
}

.flex-col {
  flex-direction: column;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>

