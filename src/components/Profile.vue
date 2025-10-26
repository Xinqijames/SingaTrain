<template>
  <section class="section-card">
    <h2 class="section-title mb-3">Profile & Preferences</h2>
    <p class="text-muted">
      Manage your SingaTrain identity, preferred stations, and saved choices. Authentication is simulated locally; plug
      in Firebase when you are ready for production sign-ins.
    </p>

    <div v-if="!isAuthenticated" class="row g-4">
      <div class="col-lg-6">
        <div class="border rounded-3 p-4 h-100">
          <h3 class="mb-3">Sign in</h3>
          <form @submit.prevent="signIn">
            <label class="form-label" for="loginEmail">Email</label>
            <input id="loginEmail" v-model="loginEmail" type="email" class="form-control mb-3" required />

            <label class="form-label" for="loginPassword">Password</label>
            <input id="loginPassword" v-model="loginPassword" type="password" class="form-control mb-4" required />

            <button class="btn btn-primary w-100" type="submit">Sign in</button>
          </form>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="border rounded-3 p-4 h-100">
          <h3 class="mb-3">Register</h3>
          <form @submit.prevent="registerAccount">
            <label class="form-label" for="registerName">Display name</label>
            <input id="registerName" v-model="registerName" type="text" class="form-control mb-3" required />

            <label class="form-label" for="registerEmail">Email</label>
            <input id="registerEmail" v-model="registerEmail" type="email" class="form-control mb-3" required />

            <label class="form-label" for="registerPassword">Password</label>
            <input
              id="registerPassword"
              v-model="registerPassword"
              type="password"
              class="form-control mb-4"
              required
            />

            <button class="btn btn-outline-danger w-100" type="submit">Create account</button>
          </form>
        </div>
      </div>
    </div>

    <div v-else class="mt-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 class="mb-1">Welcome back, {{ user.name || 'Commuter' }} 👋</h3>
          <p class="text-muted mb-0">
            Signed in as <strong>{{ user.email }}</strong>
            <span v-if="user.memberSince"> · Member since {{ user.memberSince }}</span>
          </p>
        </div>
        <button class="btn btn-outline-danger" type="button" @click="signOut">
          <span class="material-icons me-1">logout</span>
          Sign out
        </button>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="border rounded-3 p-4 h-100">
            <h4 class="mb-3">Profile details</h4>
            <form @submit.prevent="saveProfile">
              <label class="form-label" for="profileName">Display name</label>
              <input id="profileName" v-model="profileName" type="text" class="form-control mb-3" />

              <label class="form-label" for="profileEmail">Email</label>
              <input id="profileEmail" v-model="profileEmail" type="email" class="form-control mb-4" disabled />

              <button class="btn btn-primary w-100" type="submit">Save profile</button>
            </form>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="border rounded-3 p-4 h-100">
            <h4 class="mb-3">Favourite stations</h4>
            <div v-if="!favorites.length" class="text-muted">Add favourites from the Live Tracker to see them here.</div>
            <ul v-else class="list-unstyled mb-3">
              <li
                v-for="item in favorites"
                :key="item.station"
                class="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
              >
                <div>
                  <div class="fw-semibold">{{ item.label || item.station }}</div>
                  <div class="text-muted small">{{ item.station }}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="removeFavorite(item.station)">
                  Remove
                </button>
              </li>
            </ul>
            <button v-if="favorites.length" class="btn btn-outline-danger w-100" type="button" @click="clearFavorites">
              Clear favourites
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';

const { state, updateUser, removeFavorite, clearFavorites } = useAppState();

const user = computed(() => state.user);
const favorites = computed(() => state.favorites);
const isAuthenticated = computed(() => !!state.user.email);

const loginEmail = ref('');
const loginPassword = ref('');

const registerName = ref('');
const registerEmail = ref('');
const registerPassword = ref('');

const profileName = ref(state.user.name);
const profileEmail = ref(state.user.email);

watch(
  user,
  (value) => {
    profileName.value = value.name;
    profileEmail.value = value.email;
  },
  { immediate: true }
);

function signIn() {
  if (!loginEmail.value || !loginPassword.value) return;
  updateUser({
    email: loginEmail.value,
    name: loginEmail.value.split('@')[0],
    memberSince: state.user.memberSince || new Date().toLocaleDateString()
  });
  profileName.value = state.user.name;
  profileEmail.value = state.user.email;
  loginPassword.value = '';
}

function registerAccount() {
  if (!registerName.value || !registerEmail.value || !registerPassword.value) return;
  updateUser({
    name: registerName.value,
    email: registerEmail.value,
    memberSince: new Date().toLocaleDateString()
  });
  profileName.value = registerName.value;
  profileEmail.value = registerEmail.value;
  registerName.value = '';
  registerEmail.value = '';
  registerPassword.value = '';
}

function saveProfile() {
  updateUser({ name: profileName.value });
}

function signOut() {
  updateUser({ name: 'Guest User', email: '', memberSince: '' });
  profileName.value = 'Guest User';
  profileEmail.value = '';
}
</script>
