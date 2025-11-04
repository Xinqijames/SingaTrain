<template>
  <LoadingPage v-if="!isAppLoaded" @loaded="handleLoadingComplete" />
  <div v-if="isAppLoaded">
    <TrainReveal />
    <div>
      <!-- Background Video -->
      <div class="video-background">
        <video autoplay muted loop playsinline class="bg-video">
          <source src="/MrtFootage.mp4" type="video/mp4">
        </video>
        <div class="video-overlay"></div>
      </div>
      
      <Navbar />
      <main class="container main-content">
        <transition name="fade-slide" mode="out-in">
          <keep-alive include="RoutePlanner">
            <component :is="currentTabComponent" :key="state.activeTab" />
          </keep-alive>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, watch, ref } from 'vue';
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
import TrainReveal from './components/TrainReveal.vue';
import LoadingPage from './components/LoadingPage.vue';
import { useAppState } from './composables/useAppState';

const { state } = useAppState();
const isAppLoaded = ref(false);

function handleLoadingComplete() {
  isAppLoaded.value = true;
}

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
  // Don't animate Dashboard cards - they should always be visible
  const dashboardCards = document.querySelectorAll('.dashboard-view .section-card');
  const otherCards = document.querySelectorAll('.section-card:not(.dashboard-view .section-card)');
  
  // Ensure Dashboard cards are always visible first
  dashboardCards.forEach(card => {
    gsap.set(card, { opacity: 1, visibility: 'visible', display: 'block' });
  });
  
  // Only animate non-dashboard cards
  if (otherCards.length > 0) {
    gsap.from(otherCards, { 
      opacity: 0, 
      duration: 0.35, 
      ease: 'power2.out'
    });
  }
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
    
    // Ensure Dashboard cards are always visible
    const dashboardCards = document.querySelectorAll('.dashboard-view .section-card, .dashboard-view [data-aos]');
    dashboardCards.forEach(card => {
      card.style.opacity = '1';
      card.style.visibility = 'visible';
      card.style.display = 'block';
      card.style.transform = 'none';
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
      // Ensure Dashboard content stays visible
      dashboardCards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'block';
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
      
      // Ensure Dashboard cards are always visible
      const dashboardCards = document.querySelectorAll('.dashboard-view .section-card, .dashboard-view [data-aos]');
      dashboardCards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'block';
        card.style.transform = 'none';
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
        // Ensure Dashboard content stays visible
        dashboardCards.forEach(card => {
          card.style.opacity = '1';
          card.style.visibility = 'visible';
          card.style.display = 'block';
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
