<template>
  <Transition name="train-reveal">
    <div v-if="isRevealing" class="train-reveal-overlay">
      <!-- Black overlay with SVG mask -->
      <svg class="reveal-mask" width="100%" height="100%">
        <defs>
          <mask id="headlightMask">
            <rect width="100%" height="100%" fill="white" />
            
            <!-- Left headlight - further left (35%) -->
            <circle cx="35%" cy="50%" r="0" fill="black">
              <!-- Faster ripple: 1.5s instead of 2.5s -->
              <animate attributeName="r" from="0" to="150%" dur="1.5s" begin="2.5s" fill="freeze" />
            </circle>

            <!-- Right headlight - further right (65%) -->
            <circle cx="65%" cy="50%" r="0" fill="black">
              <animate attributeName="r" from="0" to="150%" dur="1.5s" begin="2.5s" fill="freeze" />
            </circle>
          </mask>
        </defs>

        <rect width="100%" height="100%" fill="#000" mask="url(#headlightMask)" />
      </svg>

      <!-- Glowing yellow headlight effects - scalable size -->
      <div class="headlight headlight-left" />
      <div class="headlight headlight-right" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isRevealing = ref(true);

onMounted(() => {
  // Timeline: 1s dark + 1.5s lights hold + 1.5s ripple = 4s total (faster)
  setTimeout(() => {
    isRevealing.value = false;
  }, 4000);
});
</script>

<style scoped>
.train-reveal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  pointer-events: none;
  /* Faster fadeout timing */
  animation: fadeOut 0.8s ease 3.2s forwards;
}

.reveal-mask {
  position: absolute;
  inset: 0;
}

/* Headlight glow effects - responsive sizing */
.headlight {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  /* Use min() to scale down on smaller screens */
  width: min(140px, 18vw);
  height: min(140px, 18vw);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 220, 80, 1) 0%,
    rgba(255, 200, 50, 0.8) 30%,
    rgba(255, 180, 40, 0.4) 50%,
    transparent 70%
  );
  /* Scalable glow */
  box-shadow: 
    0 0 min(50px, 6vw) rgba(255, 220, 80, 0.7),
    0 0 min(100px, 12vw) rgba(255, 200, 50, 0.4);
  opacity: 0;
  will-change: transform, opacity;
  /* Faster animation timing */
  animation: 
     headlightFlash 0.25s ease-out 0.5s forwards,
     headlightGlow 0.7s ease-in-out 0.7s forwards,
     headlightExpand 0.8s ease-out 1.2s forwards;
}

.headlight-left {
  left: 35%;
}

.headlight-right {
  left: 65%;
}

/* Animations */
@keyframes headlightFlash {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes headlightGlow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.15);
  }
}

@keyframes headlightExpand {
  0% {
    /* Use CSS variable for responsive sizing */
    width: min(140px, 18vw);
    height: min(140px, 18vw);
    opacity: 1;
  }
  100% {
    width: 3500px;
    height: 3500px;
    opacity: 0;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

/* Vue transition */
.train-reveal-enter-active,
.train-reveal-leave-active {
  transition: opacity 0.8s ease;
}

.train-reveal-leave-to {
  opacity: 0;
}

/* Mobile optimization - move lights closer together on small screens */
@media (max-width: 768px) {
  .headlight-left {
    left: 38%;
  }
  
  .headlight-right {
    left: 62%;
  }
  
  .headlight {
    /* Smaller lights on mobile */
    width: min(100px, 15vw);
    height: min(100px, 15vw);
  }
}

@media (max-width: 480px) {
  .headlight-left {
    left: 40%;
  }
  
  .headlight-right {
    left: 60%;
  }
  
  .headlight {
    /* Even smaller on very small screens */
    width: min(80px, 12vw);
    height: min(80px, 12vw);
  }
}
</style>