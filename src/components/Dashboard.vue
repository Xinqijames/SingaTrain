<template>
  <section class="dashboard-view">
    <div class="hero row align-items-center gy-5">
      <div class="col-lg-12 hero-intro" data-aos="fade-up">
        <h1 class="mb-3">Singapore’s MRT companion</h1>
        <p>
          Plan, monitor, and optimise every MRT journey with live arrivals, disruption-aware routing,
          fare insights, and collaborative meet-up tools — all in one polished interface.
        </p>
        <div class="hero-cta container-fluid">
  <button class="btn btn-primary px-4 py-3 hover-float" @click="setActiveTab('live')">
    <span class="material-icons me-2">tram</span>
    Live Tracker
  </button>
  <button class="btn btn-outline-danger px-4 py-3 hover-float" @click="setActiveTab('route')">
    <span class="material-icons me-2">alt_route</span>
    Plan a Route
  </button>
</div>
      </div>
      <div class="col-lg-12 hero-illustration text-center" data-aos="fade-left">
  <!-- Clickable map preview -->
  <img
    src="/MRT-Map.png"
    alt="SingaTrain map illustration"
    class="img-fluid rounded-4 shadow map-preview"
    role="button"
    @click="openMapOverlay"
  />

  <!-- Fullscreen MRT map overlay -->
  <Transition name="map-fullscreen">
    <div v-if="showMap" class="mrt-map-fullscreen" :class="{ 'first-open': isFirstOpen, 'animating': mapAnimating }" @click.self="closeMapOverlay">
      <button class="close-map-btn" @click="closeMapOverlay">
        <span class="material-icons">close</span>
      </button>

      <div
        class="zoom-container"
        @wheel.prevent="onWheelZoom"
        @mousedown="startDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @mousemove="onDrag"
        @touchstart="startTouch"
        @touchmove.prevent="onPinch"
        @touchend="endTouch"
      >
        <img
          ref="mapImage"
          src="/MRT-Map.png"
          alt="Interactive MRT Map"
          class="zoomable-map"
          :class="{ 'first-open-animate': isFirstOpen }"
          :style="mapTransform"
        />
      </div>
      
      <!-- Station highlight overlay -->
      <div v-if="isFirstOpen" class="station-highlight-overlay">
        <div class="highlight-pulse"></div>
      </div>
    </div>
  </Transition>
</div>

    </div>

    <div class="live-tools mt-5" data-aos="fade-up" data-aos-delay="150">
      <div class="live-ticker-card w-100" :key="ticker.station.station" :class="{ cycle: isCycling }" :style="{ borderColor: ticker.lineColor }">
        <div>
          <div class="ticker-label text-uppercase fw-semibold">Next arrivals</div>
          <div class="ticker-station d-flex align-items-center gap-2">
            <span class="material-icons text-danger">ev_station</span>
            <span>{{ ticker.station?.station }}</span>
          </div>
          <div class="ticker-line tab-desc mt-1">
            <span class="material-icons" :style="{ color: ticker.lineColor }">timeline</span>
            {{ ticker.station?.line }}
          </div>
        </div>
        <div class="live-clock">
          <span>{{ liveClock }}</span>
        </div>
        <div class="ticker-times">
          <span
            v-for="(arrival, idx) in ticker.arrivals"
            :key="idx"
            class="ticker-pill"
            :style="{ borderColor: ticker.lineColor, color: ticker.lineColor }"
          >
            <span class="material-icons">train</span>
            {{ formatArrival(arrival) }}
          </span>
          <span v-if="!ticker.arrivals.length" class="tab-desc small">Fetching arrivals…</span>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-4">
      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="250">
        <div class="section-card h-100">
          <h2 class="section-title mb-3">Personalised commute</h2>
          <p class="tab-desc">
            Your favourite stations are pinned across dashboards and live tracking for
            quick access wherever you roam.
          </p>
          <ul class="list-unstyled mt-3">
            <li v-if="!favorites.length" class="tab-desc">
  <span class="material-icons align-middle">star_border</span>
  Add favourites from 
  <a href="#" class="interactive-link fw-semibold" @click.prevent="setActiveTab('live')">
    Live Tracker</a>
  or 
  <a href="#" class="interactive-link fw-semibold" @click.prevent="setActiveTab('profile')">
    Profile</a>
  to see them here.
</li>
            <li
              v-for="item in favorites"
              :key="item.station"
              class="d-flex align-items-center gap-3 py-2 border-bottom"
            >
              <span class="material-icons text-danger">star_rate</span>
              <div>
                <div class="fw-semibold">{{ item.label || item.station }}</div>
                <div class="tab-desc small">{{ item.station }}</div>
              </div>
              <button class="dashboard-fav-remove ms-auto" @click="removeFavoriteHandler(item)">
                Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
<div class="col-lg-6" data-aos="fade-up" data-aos-delay="350">
  <div class="section-card h-100">
    <h2 class="section-title mb-3">Explore Our Features</h2>
    <ul class="list-unstyled mb-0">
      <li class="feature-item py-2 border-bottom" @click="setActiveTab('route')">
        <div class="d-flex align-items-center gap-3" role="button">
          <span class="material-icons text-primary">flash_on</span>
          <div>
            <div class="fw-semibold feature-title">Dynamic Route Visualiser</div>
            <div class="tab-desc small">Visualise your journey with transfer-aware walking times on an interactive map.</div>
          </div>
        </div>
      </li>
      <li class="feature-item py-2 border-bottom" @click="setActiveTab('fare')">
        <div class="d-flex align-items-center gap-3" role="button">
          <span class="material-icons text-success">insights</span>
          <div>
            <div class="fw-semibold feature-title">Fare Insights</div>
            <div class="tab-desc small">See distance-based fares and monthly pass break-even points for smarter travel.</div>
          </div>
        </div>
      </li>
      <li class="feature-item py-2" @click="setActiveTab('meetup')">
        <div class="d-flex align-items-center gap-3" role="button">
          <span class="material-icons text-warning">diversity_3</span>
          <div>
            <div class="fw-semibold feature-title">Meet Halfway</div>
            <div class="tab-desc small">Find the fairest interchange point for your group in seconds.</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { LIVE_TICKER_ROTATION_MS, LIVE_TICKER_STATIONS } from '../data/stations';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
const isCycling = ref(false);
const showMap = ref(false);
const isFirstOpen = ref(true);
const mapAnimating = ref(false);
const scale = ref(1);
const posX = ref(0);
const posY = ref(0);
const isDragging = ref(false);
const start = ref({ x: 0, y: 0 });
const lastTouchDistance = ref(null);
const user = ref(null);
const auth = getAuth();
const mapImage = ref(null);
const clickPosition = ref({ x: 0, y: 0 });

const ticker = reactive({
  index: 0,
  station: LIVE_TICKER_STATIONS[0],
  arrivals: [],
  lineColor: getLineColor(LIVE_TICKER_STATIONS[0].line)
});
const liveClock = ref('--:--:--');
const tickerInterval = ref(null);
const clockInterval = ref(null);

const { state, setActiveTab, removeFavorite } = useAppState();
const favorites = computed(() => state.favorites);

function formatArrival(seconds) {
  if (seconds <= 0) return 'Arriving';
  if (seconds < 60) return '<1 min';
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

function updateTicker(resetIndex = false) {
  if (!resetIndex) {
    ticker.index = (ticker.index + 1) % LIVE_TICKER_STATIONS.length;
  }
  ticker.station = LIVE_TICKER_STATIONS[ticker.index];
  ticker.lineColor = getLineColor(ticker.station.line);
  const stationArrivals = simulator.getStationArrivals(ticker.station.station);
  ticker.arrivals = (stationArrivals?.[ticker.station.line] || []).slice(0, 3);

  isCycling.value = false;
  void document.querySelector('.live-ticker-card').offsetWidth; 
  isCycling.value = true;
}

function updateClock() {
  const now = new Date();
  liveClock.value = now.toLocaleTimeString(undefined, { hour12: false });
}

const openMapOverlay = (e) => {
  // Get click position for animation origin
  if (e && isFirstOpen.value) {
    const rect = e.target.getBoundingClientRect();
    clickPosition.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
  
  showMap.value = true;
  mapAnimating.value = true;
  scale.value = 1;
  posX.value = 0;
  posY.value = 0;
  
  // Reset animation state after animation completes
  if (isFirstOpen.value) {
    setTimeout(() => {
      mapAnimating.value = false;
      isFirstOpen.value = false;
    }, 1000);
  } else {
    mapAnimating.value = false;
  }
};

const closeMapOverlay = () => {
  showMap.value = false;
  mapAnimating.value = false;
  // Reset zoom and position
  scale.value = 1;
  posX.value = 0;
  posY.value = 0;
};

const onWheelZoom = (e) => {
  const zoomIntensity = 0.1;
  scale.value += e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
  scale.value = Math.min(Math.max(scale.value, 1), 4);
};

const startDrag = (e) => {
  isDragging.value = true;
  start.value = { x: e.clientX - posX.value, y: e.clientY - posY.value };
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  posX.value = e.clientX - start.value.x;
  posY.value = e.clientY - start.value.y;
};

const stopDrag = () => {
  isDragging.value = false;
};

const startTouch = (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDistance.value = Math.sqrt(dx*dx + dy*dy);
  } else if (e.touches.length === 1) {
    isDragging.value = true;
    start.value = {
      x: e.touches[0].clientX - posX.value,
      y: e.touches[0].clientY - posY.value,
    };
  }
};

const onPinch = (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (lastTouchDistance.value) {
      const delta = distance - lastTouchDistance.value;
      scale.value += delta * 0.005;
      scale.value = Math.min(Math.max(scale.value, 1), 4);
    }
    lastTouchDistance.value = distance;
  } else if (e.touches.length === 1 && isDragging.value) {
    posX.value = e.touches[0].clientX - start.value.x;
    posY.value = e.touches[0].clientY - start.value.y;
  }
};

const endTouch = () => {
  lastTouchDistance.value = null;
  isDragging.value = false;
};

const mapTransform = computed(() => {
  return {
    transform: `translate(${posX.value}px, ${posY.value}px) scale(${scale.value})`,
    transition: isDragging.value ? "none" : "transform 0.1s ease-out",
  };
});

const removeFavoriteHandler = async (fav) => {
  try {
    if (!user.value?.uid) return;

    removeFavorite(fav);

    const updatedFavorites = state.favorites.map(f => ({ ...f }));
    await updateDoc(doc(db, 'users', user.value.uid), {
      favorite_stations: updatedFavorites,
    });

    console.log('Favorite removed successfully.');
  } catch (err) {
    console.error('Error removing favorite:', err);
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
    if (!currentUser) {
      state.favorites = []; 
    }
  });

  simulator.start();
  updateTicker(true);
  updateClock();
  tickerInterval.value = window.setInterval(() => updateTicker(false), LIVE_TICKER_ROTATION_MS);
  clockInterval.value = window.setInterval(updateClock, 1000);
});


onBeforeUnmount(() => {
  simulator.stop();
  if (tickerInterval.value) {
    clearInterval(tickerInterval.value);
    tickerInterval.value = null;
  }
  if (clockInterval.value) {
    clearInterval(clockInterval.value);
    clockInterval.value = null;
  }
});
</script>
