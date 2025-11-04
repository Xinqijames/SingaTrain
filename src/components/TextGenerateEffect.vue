<template>
  <p class="text-generate-effect mb-0">
    <span class="text-blur">{{ props.words }}</span>
    <span class="text-clear">{{ displayedText }}</span>
    <span v-if="isTyping" class="cursor">|</span>
  </p>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  words: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 2000
  },
  className: {
    type: String,
    default: ''
  }
});

const displayedText = ref('');
const isTyping = ref(true);

// Initialize
onMounted(() => {
  animateText();
});

function animateText() {
  const fullText = props.words;
  const totalChars = fullText.length;
  const delayPerChar = props.duration / totalChars;
  let currentIndex = 0;
  
  displayedText.value = '';
  isTyping.value = true;
  
  function typeChar() {
    if (currentIndex >= totalChars) {
      isTyping.value = false;
      return;
    }
    
    displayedText.value = fullText.substring(0, currentIndex + 1);
    currentIndex++;
    setTimeout(typeChar, delayPerChar);
  }
  
  typeChar();
}

// Reset animation when words change
watch(() => props.words, () => {
  displayedText.value = '';
  isTyping.value = true;
  animateText();
});
</script>

<style scoped>
.text-generate-effect {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  position: relative;
  display: inline-block;
}

.text-blur {
  filter: blur(8px);
  opacity: 0.3;
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.text-clear {
  position: relative;
  z-index: 2;
  background: inherit;
  display: inline-block;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s infinite;
  color: currentColor;
  position: relative;
  z-index: 1;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* Dark mode support */
body.dark-mode .text-generate-effect {
  color: var(--color-text);
}

body.dark-mode .text-blur {
  opacity: 0.2;
}
</style>

