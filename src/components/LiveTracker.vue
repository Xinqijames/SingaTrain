<template>
  <section class="section-card">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="section-title mb-1">Live Train Tracker</h2>
        <p class="text-muted mb-0">
          Simulated real-time arrivals with per-line intervals and probabilistic delays. Switch stations to
          monitor your regular journeys.
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
      <h5 class="mb-3">First Train & Crowd Level at {{ selectedStation }}</h5>
      <div class="arrival-row" v-for="line in stationArrivals" :key="line.name">
        <div class="train-icon" :style="{ color: getLineColor(line.name) }">
          <span class="material-icons">subway</span>
        </div>
        <div class="arrival-details flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>{{ line.name }}</strong>
            <!-- <span class="text-muted small">Next: {{ formatArrival(line.times[0] ?? 0) }}</span> -->
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
  </section>
</template>

<script setup>
import { LTA_API_KEY } from '../../config';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { TRAIN_STATION_LINES } from '../data/stations';

const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
const updateInterval = ref(null);

// LTA API Configuration - Add your API key here

const LTA_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime';
const crowdDataCache = ref({});
const crowdDataTimestamp = ref(0);

// First train timings for each line (static data - 5:30 AM default)
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

async function fetchCrowdData() {
  // Only fetch if we haven't fetched in the last 10 minutes
  const now = Date.now();
  if (now - crowdDataTimestamp.value < 600000 && Object.keys(crowdDataCache.value).length > 0) {
    return; // Use cached data
  }

  try {
    const response = await fetch(LTA_API_URL, {
      method: 'GET',
      headers: {
        'AccountKey': LTA_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch crowd data:', response.status);
      return;
    }

    const data = await response.json();
    
    // Process and cache crowd data by station
    const crowdMap = {};
    
    if (data.value && Array.isArray(data.value)) {
      data.value.forEach(item => {
        const stationCode = item.Station;
        if (!crowdMap[stationCode]) {
          crowdMap[stationCode] = {};
        }
        // Map crowd level (l = low, m = moderate, h = high)
        crowdMap[stationCode] = item.CrowdLevel || 'l';
      });
    }
    
    crowdDataCache.value = crowdMap;
    crowdDataTimestamp.value = now;
  } catch (error) {
    console.error('Error fetching crowd data:', error);
  }
}

function getCrowdLevelForStation(stationName, lineName) {
  // This is a simplified mapping - you'll need to map your station names to LTA station codes
  // For now, return a simulated value if API key is not set or data not available
  if (LTA_API_KEY || !Object.keys(crowdDataCache.value).length) {
    const crowdLevels = ['l', 'm', 'h'];
    return crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
  }
  
  // In a real implementation, you would map stationName to the correct station code
  // and retrieve the crowd level from crowdDataCache.value
  return 'l'; // default to low
}

function getFirstTrainTime(lineName) {
  return firstTrainTimings[lineName] || '5:30 AM';
}

function refreshArrivals() {
  const snapshot = simulator.getArrivals({ returnSeconds: true })[selectedStation.value] || {};
  
  stationArrivals.value = Object.entries(snapshot).map(([name, times]) => ({
    name,
    times,
    progress: times.length ? Math.max(0, 1 - Math.min(times[0], 600) / 600) : 0,
    // Add this line to include first train time:
    firstTrainTime: firstTrainTimings[name] || '5:30 AM', // Fallback to default
    crowdLevel: getCrowdLevelForStation(selectedStation.value, name)
  }));
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
  fetchCrowdData(); // Fetch crowd data on mount
  refreshArrivals();
  // updateInterval.value = window.setInterval(() => {
  //   refreshArrivals();
  //   // Refresh crowd data every 10 minutes (600000ms) as per LTA update frequency
  //   if (Date.now() % 600000 < 1000) {
  //     fetchCrowdData();
  //   }
  // }, 1000);
});

onBeforeUnmount(() => {
  simulator.stop();
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
});



</script>

