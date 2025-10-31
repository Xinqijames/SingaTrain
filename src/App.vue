<template>
  <div>
    <Navbar />
    <main class="container main-content">
      <transition name="fade-slide" mode="out-in">
        <keep-alive include="RoutePlanner">
          <component :is="currentTabComponent" :key="state.activeTab" />
        </keep-alive>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, watch } from 'vue';
import AOS from 'aos';
import gsap from 'gsap';

import Navbar from './components/Navbar.vue';
import Dashboard from './components/Dashboard.vue';
import LiveTracker from './components/LiveTracker.vue';
import RoutePlanner from './components/RoutePlanner.vue';
import FareCalculator from './components/FareCalculator.vue';
import MeetupFinder from './components/MeetupFinder.vue';
import Profile from './components/Profile.vue';
import FirstLastTrain from './components/FirstLastTrain.vue';
import { useAppState } from './composables/useAppState';

const { state } = useAppState();

const tabComponents = {
  dashboard: Dashboard,
  live: LiveTracker,
  route: RoutePlanner,
  fare: FareCalculator,
  meetup: MeetupFinder,
  profile: Profile,
  firstLast: FirstLastTrain
};

const currentTabComponent = computed(() => tabComponents[state.activeTab] || Dashboard);

function animateView() {
  if (!gsap) return;
  // Animate only opacity to prevent layout shifts that break spacing
  // Don't use transform as it interferes with spacing when switching tabs
  gsap.from('.section-card', { 
    opacity: 0, 
    duration: 0.35, 
    ease: 'power2.out'
  });
}

onMounted(() => {
  if (AOS) {
    AOS.init({ once: true, duration: 550, easing: 'ease-out' });
  }
  nextTick(() => {
    // Disable AOS on section-card elements completely
    const sectionCards = document.querySelectorAll('.section-card');
    sectionCards.forEach(card => {
      card.removeAttribute('data-aos');
      card.removeAttribute('data-aos-delay');
      card.removeAttribute('data-aos-duration');
      card.removeAttribute('data-aos-easing');
    });
    
    animateView();
    
    // Ensure section-card spacing is correct - run multiple times to catch all animations
    const fixSpacing = () => {
      sectionCards.forEach(card => {
        card.style.setProperty('margin-top', '0', 'important');
        card.style.setProperty('margin-bottom', '0', 'important');
        card.style.marginTop = '0';
        card.style.marginBottom = '0';
      });
    };
    
    fixSpacing();
    setTimeout(fixSpacing, 100);
    setTimeout(fixSpacing, 600); // After AOS animations complete
  });
});

watch(
  () => state.activeTab,
  () => {
    nextTick(() => {
      // Remove AOS attributes from section-card elements
      const sectionCards = document.querySelectorAll('.section-card');
      sectionCards.forEach(card => {
        card.removeAttribute('data-aos');
        card.removeAttribute('data-aos-delay');
        card.removeAttribute('data-aos-duration');
        card.removeAttribute('data-aos-easing');
      });
      
      // Don't use refreshHard as it can cause viewport dimension changes
      // Just refresh instead to maintain consistent dimensions
      if (AOS) AOS.refresh();
      animateView();
      
      // Ensure section-card spacing is consistent after tab switch
      const fixSpacing = () => {
        sectionCards.forEach(card => {
          card.style.setProperty('margin-top', '0', 'important');
          card.style.setProperty('margin-bottom', '0', 'important');
          card.style.marginTop = '0';
          card.style.marginBottom = '0';
        });
      };
      
      fixSpacing();
      setTimeout(fixSpacing, 100);
      setTimeout(fixSpacing, 600);
    });
  }
);
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  /* Removed transform to prevent layout shifts that break spacing */
}
</style>
