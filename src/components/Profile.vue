
<template>
  <section id="profile" class="section-card">

      <!-- MESSAGE DISPLAYS -->
<div v-if="errorMessage || successMessage" class="overlay-wrapper">
  <div v-if="errorMessage" class="overlay-message error">{{ errorMessage }}</div>
  <div v-if="successMessage" class="overlay-message success">{{ successMessage }}</div>
</div>

    <!-- AUTH SECTION -->
    <div id="auth-section" v-if="!user">
      <h2 class="mt-5 pt-5">Join or Sign In</h2>

      <label for="auth-email">Email:</label>
      <input 
        type="email" 
        id="auth-email" 
        v-model="authEmail" 
        placeholder="Enter your email"
        :class="{ 'has-value': authEmail }"
      />

      <label for="auth-password">Password:</label>
      <input 
        type="password" 
        id="auth-password" 
        v-model="authPassword" 
        placeholder="Enter your password"
        :class="{ 'has-value': authPassword }"
      />

      <div id="password-requirements" v-if="showPasswordRequirements">
        <p>Password must contain:</p>
        <span :class="{ met: reqLength, 'not-met': !reqLength }">- At least 6 characters</span>
        <span :class="{ met: reqUpper, 'not-met': !reqUpper }">- An uppercase letter</span>
        <span :class="{ met: reqLower, 'not-met': !reqLower }">- A lowercase letter</span>
        <span :class="{ met: reqNumber, 'not-met': !reqNumber }">- A number</span>
        <span :class="{ met: reqSpecial, 'not-met': !reqSpecial }">- A special character (!@#$%^&*)</span>
      </div>

      <div class="auth-buttons">
        <button id="login-btn" @click="loginUserHandler">Sign In</button>
      </div>

<div class="auth-links">
  <a href="#" @click.prevent="showResetPassword = true; clearMessages()">Forgot Password?</a>
  <a href="#" @click.prevent="registerUserHandler" class="register-link">Register New Account</a>
</div>

    </div>

<!-- RESET PASSWORD MODAL -->
<div v-if="showResetPassword" class="modal-overlay">
  <div class="modal-content">
    <h3>Reset Your Password</h3>
    <p>Enter your email to receive a password reset link.</p>
    <input type="email" v-model="resetEmail" placeholder="Enter your email" />

    <div class="modal-buttons">
      <button type="button" class="cancel" @click="showResetPassword = false">
        Cancel
      </button>
      <button type="button" class="confirm" @click="sendResetEmailHandler">
        Send Reset Email
      </button>
    </div>
  </div>
</div>

    <!-- USER DASHBOARD -->
    <div id="dashboard-section" v-if="user">
      <h2 class="mt-5 pt-5">Welcome to SingaTrain!</h2>
      <p style="color:#111827">You are logged in as: <strong>{{ user.email }}</strong></p>

      <div class="profile-layout">
        <!-- LEFT COLUMN -->
        <div class="left-column">
          <!-- Change Display Name -->
          <div class="card" id="change-name-div">
            <h3>Change Display Name</h3>
            <input type="text" v-model="profileName" placeholder="Current name" />
            <button @click="saveProfileNameHandler">Save Profile</button>
          </div>

          <!-- Add New Favorite Station -->
          <div class="card" id="add-favorite-div">
            <h3>Add New Favorite Station</h3>
            <label for="favoriteLabel">Label:</label>
            <input type="text" id="favoriteLabel" v-model="favoriteLabel" placeholder="Favorite name" />

            <label for="favoriteStation">Station:</label>
            <select id="favoriteStation" v-model="favoriteStation">
              <option disabled value="">Select a station</option>
              <option v-for="station in stations" :key="station" :value="station">{{ station }}</option>
            </select>
            <button @click="addFavoriteHandler">Add Favorite Station</button>
          </div>
        </div>

<!-- RIGHT COLUMN -->
<div class="card flip-card" id="user-info-card" @click="toggleFlip">
  <div :class="['flip-card-inner', { 'is-flipped': isFlipped }]">
    <div class="flip-card-front">
      <img src="/singatrainlogo.png" alt="SingaTrain Logo" class="logo" />
      <p class="hover-hint"></p>
    </div>
    <div class="flip-card-back">
              <div class="card-header">
                <h2>{{ profileName || 'User Name' }}</h2>
              </div>
              <div class="account-info">
                <div class="account-row">
                  <span class="material-icons" style="color:#c2410c;">calendar_today</span>
                  <div>
                    <p class="label">Member Since</p>
                    <p>{{ memberSince }}</p>
                  </div>
                </div>
                <div class="account-row">
                  <span class="material-icons" style="color:#c2410c;">star</span>
                  <div>
                    <p class="label">Favorite Stations</p>
                    <p>{{ favorites.length }} stations</p>
                  </div>
                </div>
              </div>
                <h3 class="favorites-title">Your Favorite Stations</h3>
              <div class="favorites-list">
                <ul id="favoriteList">
                  <li v-for="(fav, index) in favorites" :key="index">
                    <span><strong>{{ fav.label }}</strong> {{ fav.station }}</span>
                    <button @click="removeFavoriteHandler(fav)">Remove</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button id="logout-btn" @click="logoutUserHandler">Sign Out</button>
<button id="delete-account-btn" @click="showDeleteModal = true">
  Delete Account
</button>
    </div>

     <!-- DELETE ACCOUNT MODAL -->
<div v-if="showDeleteModal" class="modal-overlay">
  <div class="modal-content">
    <h3>Confirm Account Deletion</h3>
    <p>Enter your password to confirm deletion. This action cannot be undone.</p>
    <input type="password" v-model="reauthPassword" placeholder="Password" />

    <div style="color: var(--bs-body-color);" v-if="deleteErrorMessage" class="error-message">{{ deleteErrorMessage }}</div>

    <div class="modal-buttons">
      <button type="button" class="cancel" @click="cancelDelete">Cancel</button>
      <button type="button" class="confirm" @click="confirmDeleteAccount">Yes, Delete</button>
    </div>
  </div>
</div>

<!-- TRAIN DELETION LOADING SCREEN -->
<!-- TRAIN DELETION LOADING SCREEN -->
<div v-if="isDeleting" class="loading-overlay">
  <div class="train-loader">
    <div class="track-wrapper">
      <div class="track"></div>
      <div class="train" aria-hidden="true">
        <div class="engine"></div>
        <div class="car"></div>
        <div class="car"></div>
      </div>
    </div>
    <p>Clearing your data... please wait 🚉</p>
  </div>
</div>

  </section>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount
} from "vue";
import {
  db,
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  observeAuth,
  addFavorite as addFavoriteFirestore,
  saveProfileName
} from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from "firebase/auth";
import { ALL_STATIONS } from "../data/stations";
import { useAppState } from '../composables/useAppState';


// --- Reactive State ---
const user = ref(null);
const authEmail = ref("");
const authPassword = ref("");
const resetEmail = ref("");
const errorMessage = ref("");
const successMessage = ref("");
let messageTimeout = null;
const showPasswordRequirements = ref(false);
const showResetPassword = ref(false);

const profileName = ref("");
const memberSince = ref("--/--/----");
const { state, addFavorite, removeFavorite } = useAppState();
const favorites = computed(() => state.favorites);
const favoriteLabel = ref("");
const favoriteStation = ref("");
const showDeleteModal = ref(false);
const reauthPassword = ref("");
const reqLength = ref(false);
const reqUpper = ref(false);
const reqLower = ref(false);
const reqNumber = ref(false);
const reqSpecial = ref(false);
const deleteErrorMessage = ref("");
const isDeleting = ref(false);
const isFlipped = ref(false);
const stations = ref(ALL_STATIONS);

// --- UI Helper Functions ---
function showMessage(type, message, duration = 3000) {
  if (type === "error") {
    errorMessage.value = message;
    successMessage.value = "";
  } else {
    successMessage.value = message;
    errorMessage.value = "";
  }

  if (messageTimeout) clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    errorMessage.value = "";
    successMessage.value = "";
    messageTimeout = null;
  }, duration);
}

// --- Clear messages and modals when unmounting ---
onBeforeUnmount(() => {
  if (messageTimeout) clearTimeout(messageTimeout);
  showResetPassword.value = false;
  showDeleteModal.value = false;
  isDeleting.value = false;
});

let unsubscribeAuth = null;
onMounted(() => {
  unsubscribeAuth = observeAuth((firebaseUser) => {
    user.value = firebaseUser;
    // reset modals/messages when auth state changes
    showResetPassword.value = false;
    showDeleteModal.value = false;
    errorMessage.value = "";
    successMessage.value = "";
  });
});

onBeforeUnmount(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});

function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function mapAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already in use. Try signing in or resetting your password.";
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/weak-password":
      return "Password too weak. Please use a stronger one.";
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "An unknown error occurred. Please try again.";
  }
}

// --- Authentication Handlers ---
const loginUserHandler = async () => {
  clearMessages();

  const result = await loginUser(authEmail.value, authPassword.value);

  if (!result.success) {
    // Login failed
    showMessage("error", result.message);
    successMessage.value = "";
  } else {
    // Login succeeded
    errorMessage.value = "";
    showMessage("success", "Welcome back!")
    user.value = result.user; // Important: set the user so dashboard shows
  }
};



const registerUserHandler = async () => {
  clearMessages();

  const password = authPassword.value || "";
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!passwordRegex.test(password)) {
    errorMessage.value =
      "Password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    successMessage.value = "";
    return;
  }

  const result = await registerUser(authEmail.value, password);

  if (!result.success) {
    showMessage("error", result.message);
    successMessage.value = "";
  } else {
    errorMessage.value = "";
    showMessage("success", "Account created successfully!")
    user.value = result.user;

    await populateUserProfile(result.user);
  }
};


watch(authPassword, (newVal) => {
  const pwd = (newVal || "").toString();

  showPasswordRequirements.value = pwd.length > 0;
  reqLength.value = pwd.length >= 6;
  reqUpper.value = /[A-Z]/.test(pwd);
  reqLower.value = /[a-z]/.test(pwd);
  reqNumber.value = /[0-9]/.test(pwd);
  reqSpecial.value = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
});

const logoutUserHandler = async () => {
  try {
    await logoutUser();
    clearMessages();
    showMessage("success", "You have been signed out.");
  } catch (err) {
    showMessage("error", mapAuthError(err.code));
  }
};

const confirmDeleteAccount = async () => {
  if (!user.value) {
    showMessage("error", "No user is currently logged in.");
    return;
  }

  if (!reauthPassword.value) {
    deleteErrorMessage.value = "Please enter your password to confirm deletion.";
    return;
  }

  isDeleting.value = true;

  try {
    const credential = EmailAuthProvider.credential(
      user.value.email,
      reauthPassword.value
    );

    await reauthenticateWithCredential(user.value, credential);

    const uidToDelete = user.value.uid;
    await deleteDoc(doc(db, "users", uidToDelete));
    await deleteUser(user.value);

    showMessage("success", "Your account has been deleted.");
    showDeleteModal.value = false;
    deleteErrorMessage.value = '';

    setTimeout(() => {
      user.value = null;
      profileName.value = "";
      memberSince.value = "--/--/----";
      favorites.value = [];
      reauthPassword.value = "";
      isDeleting.value = false;
    }, 1200);
  } catch (err) {
    console.error("Delete account error:", err);
    isDeleting.value = false;
    deleteErrorMessage.value =
      err.code === "auth/invalid-credential"
        ? "Incorrect password. Please try again."
        : "Account deletion failed. Please try again.";
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false;
  reauthPassword.value = "";
  deleteErrorMessage.value = "";
};

const sendResetEmailHandler = async () => {
  clearMessages();

  if (!resetEmail.value) {
    return showMessage("error", "Enter your email first.");
  }

  try {
    await resetPassword(resetEmail.value);
    showMessage("success", "Password reset email sent!");
    showResetPassword.value = false; // Close the modal
    resetEmail.value = "";            // Clear input
  } catch (err) {
    showMessage("error", mapAuthError(err.code));
  }
};

// --- Profile Handlers ---
const saveProfileNameHandler = async () => {
  try {
    await saveProfileName(user.value.uid, profileName.value);
    showMessage("success", "Profile updated!");
  } catch (err) {
    showMessage("error", "Failed to update profile.");
  }
};

// --- Favorites Handlers ---
const addFavoriteHandler = async () => {
  if (!favoriteLabel.value || !favoriteStation.value) {
    showMessage("error", "Enter both label and station.");
    return;
  }

  const newFav = { label: favoriteLabel.value, station: favoriteStation.value };

  try {
    if (user.value?.uid) {
      await addFavoriteFirestore(user.value.uid, newFav); 
      addFavorite(newFav);
      favoriteLabel.value = "";
      favoriteStation.value = "";
      showMessage("success", "Successfully added new station.");
    }
  } catch (err) {
    console.error("Add favorite error:", err);
    showMessage("error", "Failed to add favorite.");
  }
};

const removeFavoriteHandler = async (favToRemove) => {
  try {
    if (!user.value?.uid) return;

    removeFavorite(favToRemove);

    const updated = state.favorites.map(fav => ({ ...fav }));
    await updateDoc(doc(db, "users", user.value.uid), {
      favorite_stations: updated,
    });

    showMessage("success", "Favorite removed!");
  } catch (err) {
    console.error("Remove favorite error:", err);
    showMessage("error", "Failed to remove favorite.");
  }
};

// --- Observe Authentication State ---
observeAuth(async (firebaseUser) => {
  user.value = firebaseUser;
  clearMessages();

  if (firebaseUser) {
    await populateUserProfile(firebaseUser);
  } else {
    profileName.value = "";
    memberSince.value = "--/--/----";
    favorites.value = [];
  }
});


// --- Helper: Fetch and set user profile from Firestore ---
async function populateUserProfile(firebaseUser) {
  if (!firebaseUser) return;

  const userRef = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    profileName.value = data.name || "Anonymous";
    memberSince.value = data.created_at?.toDate
      ? data.created_at.toDate().toLocaleDateString()
      : "--/--/----";

    state.favorites.splice(0, state.favorites.length); 
    if (Array.isArray(data.favorite_stations)) {
      data.favorite_stations.forEach(fav => addFavorite(fav));
    }
  } else {
    const initData = {
      name: "Anonymous",
      email: firebaseUser.email,
      created_at: new Date(),
      favorite_stations: [],
    };
    await setDoc(userRef, initData);

    profileName.value = initData.name;
    memberSince.value = initData.created_at.toLocaleDateString();

    state.favorites.splice(0, state.favorites.length);
  }
}



const toggleFlip = () => {
  // only enable tap flip for tablet & mobile
  if (window.innerWidth <= 992) {
    isFlipped.value = !isFlipped.value;
  }
};
</script>