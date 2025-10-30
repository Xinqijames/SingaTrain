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

const state = reactive({
  activeTab: 'dashboard',
  darkMode: persisted?.darkMode ?? (() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),
  favorites: persisted?.favorites ?? [],
  user: { ...defaultUser, ...(persisted?.user || {}) }
});

export function useAppState() {
  const favoritesCount = computed(() => state.favorites.length);

  function setActiveTab(tab) {
    state.activeTab = tab;
  }

  function setDarkMode(enabled) {
    state.darkMode = enabled;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', enabled);
    }
  }

  function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', state.darkMode);
    }
    persistState(state);
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
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('dark-mode', value);
      }
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
