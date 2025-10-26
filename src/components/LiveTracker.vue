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
      <h5 class="mb-3">All arrivals at {{ selectedStation }}</h5>
      <div class="arrival-row" v-for="line in stationArrivals" :key="line.name">
        <div class="train-icon" :style="{ color: getLineColor(line.name) }">
          <span class="material-icons">subway</span>
        </div>
        <div class="arrival-details">
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ line.name }}</strong>
            <span class="countdown">{{ formatArrival(line.times[0] ?? 0) }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ background: getLineColor(line.name), transform: `scaleX(${line.progress})` }"
            ></div>
            <div class="progress-glow" :style="{ background: getLineColor(line.name) }"></div>
          </div>
          <div class="d-flex gap-2 mt-2 flex-wrap">
            <span class="pill" v-for="(time, idx) in line.times.slice(0, 3)" :key="idx">
              {{ formatArrival(time) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAppState } from '../composables/useAppState';
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { TRAIN_STATION_LINES } from '../data/stations';

const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
const updateInterval = ref(null);

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

function refreshArrivals() {
  const snapshot = simulator.getStationArrivals(selectedStation.value);
  stationArrivals.value = Object.entries(snapshot).map(([name, times]) => ({
    name,
    times,
    progress: times.length ? Math.max(0, 1 - Math.min(times[0], 600) / 600) : 0
  }));
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
  updateInterval.value = window.setInterval(refreshArrivals, 1000);
});

onBeforeUnmount(() => {
  simulator.stop();
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
});
</script>
