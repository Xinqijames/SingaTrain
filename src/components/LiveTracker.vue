<template>
  <section class="section-card">
    <!-- Message Overlay -->
<transition name="fade">
  <div v-if="message.text"
       :class="[
         'alert',
         message.type === 'success' ? 'alert-success' : 'alert-danger',
         'position-fixed', 'top-0', 'end-0', 'm-3', 'z-index-1050'
       ]">
    {{ message.text }}
  </div>
</transition>


    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="section-title mb-1">Live Train Tracker</h2>
        <p class="mb-0">
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

    <!-- Form: Station & Line Selection -->
    <div class="row g-3 mb-4">
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
    <div v-if="serviceAlerts.length > 0" class="mb-4">
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

    <!-- Live Tracker -->
    <div class="live-tools mb-4">
      <div class="live-ticker-card w-100" :style="{ borderColor: lineColor }">
        <div>
          <div class="ticker-label">Monitoring</div>
          <div class="ticker-station d-flex align-items-center gap-2">
            <span class="material-icons text-danger">location_on</span>
            <span>{{ selectedStation }}</span>
          </div>
          <div class="ticker-line mt-1">
            <span class="material-icons" :style="{ color: lineColor }">timeline</span>
            {{ selectedLine }}
          </div>
        </div>
        <div>
          <div class="small text-uppercase fw-semibold mb-1">Status</div>
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
          <span v-if="!trackedArrivals.length" class="small">Awaiting updates…</span>
        </div>
      </div>
    </div>

    <!-- First Train & Crowd Level -->
    <div class="mb-4">
      <h5 class="mb-3">
        First Train & Crowd Level at {{ selectedStation }}
        <span v-if="isLoadingCrowd" class="spinner-border spinner-border-sm ms-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </span>
      </h5>
      <div v-for="line in stationArrivals" :key="line.name" class="arrival-row">
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
              <span class="small">First Train:</span>
              <strong>{{ line.firstTrainTime }}</strong>
            </div>
            <div class="d-flex align-items-center justify-content-center gap-2">
              <span class="material-icons" style="font-size: 18px;">people</span>
              <span class="small">Crowd:</span>
              <span :class="['crowd-badge', getCrowdClass(line.crowdLevel)]">
                {{ getCrowdLabel(line.crowdLevel) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Status -->
    <div class="text-center">
      <small>
        Last updated: {{ lastUpdateTime }}
      </small>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';
import { addFavoriteFirestore } from '../composables/useFirestore'
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { TRAIN_STATION_LINES } from '../data/stations';
import { STATION_CODES_BY_LINE } from '../data/stationCoordinates';
import { LTA_API_KEY } from '../../config';
import { getAuth } from 'firebase/auth';



const CORS_PROXY = 'https://corsproxy.io/?';
const LTA_SERVICE_ALERTS_URL = 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';
const auth = getAuth();

// Simulator & Interval
const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
const updateInterval = ref(null);

// State
const serviceAlerts = ref([]);
const isLoadingCrowd = ref(false);
const apiError = ref(false);
const lastUpdateTime = ref('Never');

const firstTrainTimings = {
  'North South Line': '5:30 AM',
  'East West Line': '5:31 AM',
  'Circle Line': '5:32 AM',
  'North East Line': '5:42 AM',
  'Downtown Line': '5:33 AM',
  'Thomson-East Coast Line': '5:30 AM'
};

const LINE_CODES = {
  'East-West Line': 'EWL',
  'North-South Line': 'NSL',
  'Circle Line': 'CCL',
  'Downtown Line': 'DTL',
  'North-East Line': 'NEL',
  'Thomson-East Coast Line': 'TEL',
  'Bukit Panjang LRT': 'BPL',
  'Sengkang LRT': 'SLRT',
  'Punggol LRT': 'PLRT',
  'Circle Line Extension': 'CEL',
  'Changi Extension': 'CGL'
};



const stations = Object.keys(TRAIN_STATION_LINES);
const selectedStation = ref(stations[0]);
const selectedLine = ref(TRAIN_STATION_LINES[selectedStation.value][0]);
const stationArrivals = ref([]);

const { state } = useAppState()
const favoriteLabel = ref('')
const favoriteStation = ref('')
const message = ref({ type: '', text: '' })

const { addFavorite } = useAppState();

// Computed
const availableLinesForStation = computed(() => TRAIN_STATION_LINES[selectedStation.value] || []);
const trackedArrivals = computed(() => {
  const arrivals = stationArrivals.value.find(item => item.name === selectedLine.value);
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
    case 'Arriving': return 'status-arriving';
    case 'On Time': return 'status-on-time';
    case 'Slight delay': return 'status-departing';
    default: return 'status-delayed';
  }
});

const statusIcon = computed(() => {
  switch (statusLabel.value) {
    case 'Arriving': return 'directions_subway';
    case 'On Time': return 'check_circle';
    case 'Slight delay': return 'schedule';
    default: return 'error';
  }
});

// Helpers
function formatArrival(seconds) {
  if (seconds <= 0) return 'Arriving';
  if (seconds < 60) return '<1 min';
  return `${Math.ceil(seconds / 60)} min`;
}

function getCrowdLabel(level) {
  const labels = { l: 'Low', m: 'Moderate', h: 'High' };
  return labels[level] || 'Unknown (Data Unavailable)';
}

function getCrowdClass(level) {
  const classes = { l: 'crowd-low', m: 'crowd-moderate', h: 'crowd-high' };
  return classes[level] || '';
}

function getStationCode(stationName, lineName) {
  const station = STATION_CODES_BY_LINE[stationName];
  if (!station) return undefined;
  return station[lineName];
}


// Fetch crowd data
async function getCrowdLevel(line) {
  try {
    const url = CORS_PROXY + encodeURIComponent(`https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=${line}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: { "AccountKey": LTA_API_KEY, "accept": "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.value || !Array.isArray(data.value)) return null;
    return data.value.map(station => ({
      stationCode: station.Station,
      crowdLevel: station.CrowdLevel
    }));
  } catch (error) {
    console.error("Error fetching crowd data:", error);
    return null;
  }
}

// Fetch service alerts
async function fetchServiceAlerts() {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(LTA_SERVICE_ALERTS_URL), {
      method: 'GET',
      headers: { 'AccountKey': LTA_API_KEY, 'Accept': 'application/json' },
    });

    // Handle HTTP errors explicitly
    if (!response.ok) {
      console.warn(`Service Alerts API returned ${response.status} ${response.statusText}`);
      apiError.value = true;

      // Optional: fallback to last known alerts (if any)
      if (serviceAlerts.value.length === 0) {
        serviceAlerts.value = [
          {
            AffectedSegments: "DataMall Service",
            Message: "Unable to fetch live alerts (API temporary error)",
            Status: "Unavailable",
          },
        ];
      }
      return;
    }

    // Parse JSON safely
    const data = await response.json();

    if (data?.value && Array.isArray(data.value)) {
      // Filter for non-normal alerts
      serviceAlerts.value = data.value.filter(
        (alert) => alert.Status !== "Normal" && alert.Status !== "Cleared"
      );
    } else {
      serviceAlerts.value = [];
    }

    apiError.value = false;
    lastUpdateTime.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error fetching service alerts:", error);
    apiError.value = true;

    // Graceful fallback
    if (serviceAlerts.value.length === 0) {
      serviceAlerts.value = [
        {
          AffectedSegments: "Train Network",
          Message: "Unable to retrieve live alerts (network issue)",
          Status: "Error",
        },
      ];
    }
  }
}


async function refreshArrivals() {
  isLoadingCrowd.value = true;

  // Get simulated arrivals
  const snapshot = simulator.getArrivals({ returnSeconds: true })[selectedStation.value] || {};

  // Map selected line to LTA API code
  const lineCode = LINE_CODES[selectedLine.value];

  let realCrowdData = null;
  if (lineCode) {
    realCrowdData = await getCrowdLevel(lineCode);
  }

  // Default crowd level
  let crowdLevel = 'NA';

  // Get API station code for selected station
  const stationCode = getStationCode(selectedStation.value, selectedLine.value);
  console.log('Selected Station:', selectedStation.value);
  console.log('Mapped Station Code:', stationCode);
  console.log('Real Crowd Data:', realCrowdData);

  if (realCrowdData && realCrowdData.length) {
    // Log each station in the realCrowdData for comparison
    realCrowdData.forEach(s => {
      console.log('Crowd data stationCode:', s.stationCode, 'crowdLevel:', s.crowdLevel);
    });

    // Try to find matching station data
    const stationData = realCrowdData.find(s => s.stationCode === stationCode);

    console.log('Matched station data:', stationData);

    if (stationData) {
      crowdLevel = stationData.crowdLevel;
    } else {
      console.warn('No matching station found in realCrowdData for', stationCode);
    }
  }

  // Update stationArrivals with simulated data + crowd level
  stationArrivals.value = Object.entries(snapshot)
    .filter(([name]) => name === selectedLine.value)
    .map(([name, times]) => ({
      name,
      times,
      progress: times.length ? Math.max(0, 1 - Math.min(times[0], 600) / 600) : 0,
      firstTrainTime: firstTrainTimings[name] || '5:30 AM',
      crowdLevel
    }));

  await fetchServiceAlerts();
  isLoadingCrowd.value = false;
}


// Bookmark station
function showMessage(type, text) {
  message.value = { type, text }
  setTimeout(() => (message.value = { type: '', text: '' }), 3000)
}

async function bookmarkStation() {
  const newFav = {
    station: selectedStation.value,
    label: `${selectedStation.value} – ${selectedLine.value}`
  }

  // Add to local app state
  addFavorite(newFav)

  try {
    const user = auth.currentUser
    if (user?.uid) {
      await addFavoriteFirestore(user.uid, newFav)
      showMessage('success', 'Successfully added new station.')
    } else {
      showMessage('error', 'Please log in to sync favorites.')
    }
  } catch (err) {
    console.error('Add favorite error:', err)
    showMessage('error', 'Failed to add favorite.')
  }
}


// Watchers
watch(selectedStation, () => {
  const lines = availableLinesForStation.value;
  if (lines.length && !lines.includes(selectedLine.value)) selectedLine.value = lines[0];
  refreshArrivals();
});
watch(selectedLine, refreshArrivals);

// Mounted & cleanup
onMounted(() => {
  simulator.start();
  refreshArrivals();
  updateInterval.value = setInterval(refreshArrivals, 30000);
});
onBeforeUnmount(() => {
  simulator.stop();
  if (updateInterval.value) clearInterval(updateInterval.value);
});
</script>
