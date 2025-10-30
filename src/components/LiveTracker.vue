<template>
  <section class="section-card">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="section-title mb-1">Live Train Tracker</h2>
        <p class="text-muted mb-0">
          Real-time train service alerts and simulated arrivals. Switch stations to monitor your regular journeys.
        </p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-danger hover-float" @click="refreshArrivals">
          <span class="material-icons me-1">refresh</span>
          Refresh
        </button>
        <button class="btn btn-primary hover-float" @click="bookmarkStation">
          <span class="material-icons me-1">star</span>
          Add Favourite
        </button>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Station</label>
        <select v-model="selectedStation" class="form-select">
          <option v-for="station in stations" :key="station" :value="station">{{ station }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Line</label>
        <select v-model="selectedLine" class="form-select">
          <option v-for="line in availableLinesForStation" :key="line" :value="line">{{ line }}</option>
        </select>
      </div>
    </div>

    <!-- Service Alerts -->
    <div v-if="serviceAlerts.length > 0" class="mt-4">
      <h5 class="mb-3 d-flex align-items-center gap-2">
        <span class="material-icons text-warning">warning</span>
        Service Alerts
      </h5>
      <div v-for="(alert, idx) in serviceAlerts" :key="idx" class="alert alert-warning mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>{{ alert.AffectedSegments }}</strong>
            <p class="mb-0 mt-1">{{ alert.Message }}</p>
          </div>
          <span class="badge bg-warning text-dark">{{ alert.Status }}</span>
        </div>
      </div>
    </div>

    <div class="live-tools mt-4">
      <div class="live-ticker-card w-100" :style="{ borderColor: lineColor }">
        <div>
          <div class="ticker-label">Monitoring</div>
          <div class="ticker-station d-flex align-items-center gap-2">
            <span class="material-icons text-danger">location_on</span>
            <span>{{ selectedStation }}</span>
          </div>
          <div class="ticker-line text-muted mt-1">
            <span class="material-icons" :style="{ color: lineColor }">timeline</span>
            {{ selectedLine }}
          </div>
        </div>
        <div>
          <div class="small text-muted text-uppercase fw-semibold mb-1">Status</div>
          <span :class="['status-pill', statusClass]">
            <span class="material-icons">{{ statusIcon }}</span>
            {{ statusLabel }}
          </span>
        </div>
        <div class="ticker-times">
          <span
            v-for="(time, idx) in trackedArrivals"
            :key="idx"
            class="ticker-pill"
            :style="{ borderColor: lineColor, color: lineColor }"
          >
            <span class="material-icons">train</span>
            {{ formatArrival(time) }}
          </span>
          <span v-if="!trackedArrivals.length" class="text-muted small">Awaiting updates…</span>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h5 class="mb-3">
        First Train & Crowd Level at {{ selectedStation }}
        <span v-if="isLoadingCrowd" class="spinner-border spinner-border-sm ms-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </span>
      </h5>
      <div class="arrival-row" v-for="line in stationArrivals" :key="line.name">
        <div class="train-icon" :style="{ color: getLineColor(line.name) }">
          <span class="material-icons">subway</span>
        </div>
        <div class="arrival-details flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>{{ line.name }}</strong>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons" style="font-size: 18px;">schedule</span>
              <span class="small text-muted">First Train:</span>
              <strong>{{ line.firstTrainTime }}</strong>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons" style="font-size: 18px;">people</span>
              <span class="small text-muted">Crowd:</span>
              <span :class="['crowd-badge', getCrowdClass(line.crowdLevel)]">
                {{ getCrowdLabel(line.crowdLevel) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Status -->
    <div class="mt-4 text-center">
      <small class="text-muted">
        Last updated: {{ lastUpdateTime }}
        <span v-if="apiError" class="text-danger ms-2">(API Error: Using simulated data)</span>
      </small>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { TRAIN_STATION_LINES } from '../data/stations';
import { LTA_API_KEY } from '../../config';

const CORS_PROXY = 'https://corsproxy.io/?';
const LTA_SERVICE_ALERTS_URL = 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';

const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
const updateInterval = ref(null);

// State
const crowdDataCache = ref({});
const crowdDataTimestamp = ref(0);
const serviceAlerts = ref([]);
const isLoadingCrowd = ref(false);
const apiError = ref(false);
const lastUpdateTime = ref('Never');

// First train timings for each line
const firstTrainTimings = {
  'North South Line': '5:30 AM',
  'East West Line': '5:31 AM',
  'Circle Line': '5:32 AM',
  'North East Line': '5:42 AM',
  'Downtown Line': '5:33 AM',
  'Thomson-East Coast Line': '5:30 AM'
};

const stations = Object.keys(TRAIN_STATION_LINES);
const selectedStation = ref(stations[0]);
const selectedLine = ref(TRAIN_STATION_LINES[selectedStation.value][0]);
const stationArrivals = ref([]);

const { addFavorite } = useAppState();

const availableLinesForStation = computed(() => TRAIN_STATION_LINES[selectedStation.value] || []);
const trackedArrivals = computed(() => {
  const arrivals = stationArrivals.value.find((item) => item.name === selectedLine.value);
  return arrivals ? arrivals.times : [];
});

const lineColor = computed(() => getLineColor(selectedLine.value));

const statusLabel = computed(() => {
  const next = trackedArrivals.value[0] ?? Infinity;
  if (next <= 60) return 'Arriving';
  if (next <= 240) return 'On Time';
  if (next <= 420) return 'Slight delay';
  return 'Delayed';
});

const statusClass = computed(() => {
  switch (statusLabel.value) {
    case 'Arriving':
      return 'status-arriving';
    case 'On Time':
      return 'status-on-time';
    case 'Slight delay':
      return 'status-departing';
    default:
      return 'status-delayed';
  }
});

const statusIcon = computed(() => {
  switch (statusLabel.value) {
    case 'Arriving':
      return 'directions_subway';
    case 'On Time':
      return 'check_circle';
    case 'Slight delay':
      return 'schedule';
    default:
      return 'error';
  }
});

function formatArrival(seconds) {
  if (seconds <= 0) return 'Arriving';
  if (seconds < 60) return '<1 min';
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

// Fetch real-time train service alerts from LTA API
async function fetchServiceAlerts() {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(LTA_SERVICE_ALERTS_URL), {
      method: 'GET',
      headers: {
        'AccountKey': LTA_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch service alerts:', response.status);
      apiError.value = true;
      return;
    }

    const data = await response.json();
    
    if (data.value && Array.isArray(data.value)) {
      serviceAlerts.value = data.value.filter(alert => 
        alert.Status !== 'Normal' && alert.Status !== 'Cleared'
      );
    }
    
    apiError.value = false;
    lastUpdateTime.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Error fetching service alerts:', error);
    apiError.value = true;
  }
}

// Simulated crowd data based on time of day (since real-time crowd API requires special access)
function getSimulatedCrowdLevel() {
  const hour = new Date().getHours();
  const crowdLevels = ['l', 'm', 'h'];
  
  // Peak hours: 7-9 AM and 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return crowdLevels[Math.random() > 0.3 ? 2 : 1]; // 70% high, 30% moderate
  }
  // Mid-day and evening
  else if ((hour >= 10 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    return crowdLevels[Math.random() > 0.5 ? 1 : 0]; // 50% moderate, 50% low
  }
  // Off-peak hours
  else {
    return crowdLevels[Math.random() > 0.7 ? 1 : 0]; // 30% moderate, 70% low
  }
}

function getCrowdLevelForStation(stationName, lineName) {
  // Using simulated crowd data (real-time crowd API requires special LTA access)
  return getSimulatedCrowdLevel();
}

async function refreshArrivals() {
  isLoadingCrowd.value = true;
  
  const snapshot = simulator.getArrivals({ returnSeconds: true })[selectedStation.value] || {};
  
  stationArrivals.value = Object.entries(snapshot).map(([name, times]) => ({
    name,
    times,
    progress: times.length ? Math.max(0, 1 - Math.min(times[0], 600) / 600) : 0,
    firstTrainTime: firstTrainTimings[name] || '5:30 AM',
    crowdLevel: getCrowdLevelForStation(selectedStation.value, name)
  }));
  
  // Fetch service alerts
  await fetchServiceAlerts();
  
  isLoadingCrowd.value = false;
}

function getCrowdLabel(level) {
  const labels = {
    l: 'Low',
    m: 'Moderate',
    h: 'High'
  };
  return labels[level] || 'Unknown';
}

function getCrowdClass(level) {
  const classes = {
    l: 'crowd-low',
    m: 'crowd-moderate',
    h: 'crowd-high'
  };
  return classes[level] || '';
}

function bookmarkStation() {
  addFavorite({
    station: selectedStation.value,
    label: `${selectedStation.value} – ${selectedLine.value}`
  });
}

watch(selectedStation, () => {
  const lines = availableLinesForStation.value;
  if (lines.length && !lines.includes(selectedLine.value)) {
    selectedLine.value = lines[0];
  }
  refreshArrivals();
});

watch(selectedLine, refreshArrivals);

onMounted(() => {
  simulator.start();
  refreshArrivals();
  
  // Update every 30 seconds (to avoid rate limiting)
  updateInterval.value = window.setInterval(() => {
    refreshArrivals();
  }, 30000);
});

onBeforeUnmount(() => {
  simulator.stop();
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
});
</script>