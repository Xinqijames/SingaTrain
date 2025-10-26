<template>
  <nav class="navbar navbar-expand-lg fixed-top premium-navbar">
    <div class="container">
      <a class="navbar-brand" href="#" @click.prevent="setActiveTab('dashboard')">
        <img src="/singatrainlogo.png" alt="SingaTrain logo" class="me-2" style="height: 36px" />
        <span>SingaTrain</span>
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#singatrainNav"
        aria-controls="singatrainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="material-icons">menu</span>
      </button>

      <div class="collapse navbar-collapse" id="singatrainNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li v-for="tab in tabs" :key="tab.key" class="nav-item">
            <a
              href="#"
              class="nav-link"
              :class="{ active: state.activeTab === tab.key }"
              @click.prevent="setActiveTab(tab.key)"
            >
              <span class="material-icons me-1 align-middle" aria-hidden="true">{{ tab.icon }}</span>
              <span class="align-middle">{{ tab.label }}</span>
            </a>
          </li>
        </ul>

        <div class="ms-lg-3 mt-3 mt-lg-0">
          <button
            id="themeToggle"
            class="theme-toggle"
            :class="{ active: state.darkMode }"
            type="button"
            @click="toggleDarkMode()"
          >
            <span class="material-icons">{{ state.darkMode ? 'light_mode' : 'dark_mode' }}</span>
            <span class="toggle-label">{{ state.darkMode ? 'Day Mode' : 'Night Mode' }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAppState } from '../composables/useAppState';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { key: 'live', label: 'Live Tracker', icon: 'tram' },
  { key: 'route', label: 'Route Planner', icon: 'alt_route' },
  { key: 'fare', label: 'Fare Calculator', icon: 'payments' },
  { key: 'meetup', label: 'Meet-up', icon: 'groups' },
  { key: 'profile', label: 'Profile', icon: 'account_circle' },
  { key: 'firstLast', label: 'First & Last', icon: 'schedule' }
];

const { state, setActiveTab, toggleDarkMode } = useAppState();
</script>
