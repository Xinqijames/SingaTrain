<template>
  <nav class="premium-navbar">
    <div class="container">
      <!-- Brand -->
      <a class="navbar-brand" href="#" @click.prevent="setActiveTab('dashboard')">
        <img src="/singatrainlogo.png" alt="SingaTrain logo" class="logo" />
        <span>SingaTrain</span>
      </a>

      <!-- Desktop nav links -->
      <ul class="navbar-nav desktop-only">
        <li v-for="tab in tabs" :key="tab.key" class="nav-item">
          <a
            href="#"
            class="nav-link"
            :class="{ active: state.activeTab === tab.key }"
            @click.prevent="setActiveTab(tab.key)"
          >
            <span class="material-icons me-1">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </a>
        </li>
      </ul>

      <!-- Right controls: Desktop theme toggle + Hamburger -->
      <div class="right-controls">
        <!-- Desktop toggle -->
        <div class="theme-toggle-wrapper">
          <label class="theme-switch">
            <input type="checkbox" :checked="state.darkMode" @change="toggleDarkMode" />
            <span class="slider">
              <span class="icon sun material-icons">light_mode</span>
              <span class="icon moon material-icons">dark_mode</span>
            </span>
          </label>
        </div>

        <!-- Hamburger -->
        <button class="navbar-toggler" type="button" @click="menuOpen = !menuOpen">
          <span class="material-icons">menu</span>
        </button>
      </div>
    </div>

    <!-- Collapsible Mobile Menu -->
    <div :class="['collapse-menu', menuOpen ? 'open' : '']">
      <ul class="navbar-nav">
        <li
      v-for="(tab, index) in tabs"
      :key="tab.key"
      class="nav-item"
      :style="{
        transitionDelay: menuOpen ? `${index * 80}ms` : '0ms'
      }"
    >
      <a
        href="#"
        class="nav-link"
        :class="{ active: state.activeTab === tab.key }"
        @click.prevent="setActiveTab(tab.key)"
      >
        <span class="material-icons me-1">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </a>
        </li>
      </ul>
    </div>
  </nav>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAppState } from '../composables/useAppState';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { key: 'live', label: 'Live Tracker', icon: 'tram' },
  { key: 'route', label: 'Route Planner', icon: 'alt_route' },
  { key: 'fare', label: 'Fare Calculator', icon: 'payments' },
  { key: 'meetup', label: 'Meet-up', icon: 'groups' },
  { key: 'profile', label: 'Profile', icon: 'account_circle' },
];

const menuOpen = ref(false);
const { state, setActiveTab, toggleDarkMode } = useAppState();

const windowWidth = ref(window.innerWidth);

const handleResize = () => {
  windowWidth.value = window.innerWidth;

  if (windowWidth.value >= 992) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
