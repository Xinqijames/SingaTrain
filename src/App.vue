<template>
  <div>
    <Navbar />
    <main class="container my-4">
      <transition name="fade-slide" mode="out-in">
        <component :is="currentTabComponent" :key="state.activeTab" />
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
  gsap.from('.section-card', { opacity: 0, y: 30, duration: 0.45, ease: 'power2.out' });
}

onMounted(() => {
  if (AOS) {
    AOS.init({ once: true, duration: 550, easing: 'ease-out' });
  }
  nextTick(() => animateView());
});

watch(
  () => state.activeTab,
  () => {
    nextTick(() => {
      if (AOS) AOS.refreshHard();
      animateView();
    });
  }
);
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
