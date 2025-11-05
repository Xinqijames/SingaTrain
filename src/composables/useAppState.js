import { computed, reactive, watch } from 'vue';

const STORAGE_KEY = 'singatrain-app-state';

function loadPersistedState() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function persistState(state) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    favorites: state.favorites,
    user: state.user,
    darkMode: state.darkMode
  }));
}

const defaultUser = {
  name: 'Guest User',
  email: '',
  memberSince: '',
  favorites: []
};

const persisted = loadPersistedState();

// Force light mode as default - ignore any persisted darkMode preference
// This ensures new deployments always start in light mode
const state = reactive({
  activeTab: 'dashboard',
  darkMode: false, // Always default to light mode
  favorites: persisted?.favorites ?? [],
  user: { ...defaultUser, ...(persisted?.user || {}) }
});

function applyColorScheme(enabled) {
  if (typeof document === 'undefined') {
    return;
  }
  document.body.classList.toggle('dark-mode', enabled);
  document.documentElement.setAttribute('data-bs-theme', enabled ? 'dark' : 'light');
}

export function useAppState() {
  const favoritesCount = computed(() => state.favorites.length);

  function setActiveTab(tab) {
    state.activeTab = tab;
  }

  function setDarkMode(enabled) {
    state.darkMode = enabled;
  }

  function toggleDarkMode() {
    state.darkMode = !state.darkMode;
  }

  function addFavorite(favorite) {
    if (!favorite || !favorite.station) return;
    const exists = state.favorites.some(
      (item) => item.station === favorite.station && item.label === favorite.label
    );
    if (!exists) {
      state.favorites.push({ ...favorite });
    }
  }

  function removeFavorite(favToRemove) {
    state.favorites = state.favorites.filter(
      fav => fav.label !== favToRemove.label || fav.station !== favToRemove.station
    );
  }

  function clearFavorites() {
    state.favorites.splice(0, state.favorites.length);
  }

  function updateUser(partial) {
    state.user = { ...state.user, ...partial };
  }

  watch(
    () => state.darkMode,
    (value) => {
      applyColorScheme(value);
      persistState(state);
    },
    { immediate: true }
  );

  watch(
    () => state.favorites,
    () => persistState(state),
    { deep: true }
  );

  watch(
    () => state.user,
    () => persistState(state),
    { deep: true }
  );

  return {
    state,
    favoritesCount,
    setActiveTab,
    setDarkMode,
    toggleDarkMode,
    addFavorite,
    removeFavorite,
    clearFavorites,
    updateUser
  };
}
