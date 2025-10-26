<template>
  <section class="dashboard-view">
    <div class="hero row align-items-center gy-5">
      <div class="col-lg-6 hero-intro" data-aos="fade-up">
        <h1 class="mb-3">Singapore’s smartest commute companion.</h1>
        <p>
          Plan, monitor, and optimise every MRT journey with live arrivals, disruption-aware routing,
          fare insights, and collaborative meet-up tools — all in one polished interface.
        </p>
        <div class="hero-cta">
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
      <div class="col-lg-6 hero-illustration text-center" data-aos="fade-left">
        <img src="/MRT-Map.png" alt="SingaTrain map illustration" class="img-fluid rounded-4 shadow" />
      </div>
    </div>

    <div class="live-tools mt-5" data-aos="fade-up" data-aos-delay="150">
      <div class="live-ticker-card w-100" :style="{ borderColor: ticker.lineColor }">
        <div>
          <div class="ticker-label text-uppercase fw-semibold">Next arrivals</div>
          <div class="ticker-station d-flex align-items-center gap-2">
            <span class="material-icons text-danger">ev_station</span>
            <span>{{ ticker.station?.station }}</span>
          </div>
          <div class="ticker-line text-muted mt-1">
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
          <span v-if="!ticker.arrivals.length" class="text-muted small">Fetching arrivals…</span>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-4">
      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="250">
        <div class="section-card h-100">
          <h2 class="section-title mb-3">Personalised commute</h2>
          <p class="text-muted">
            Your favourite stations are pinned across dashboards, live tracking, and route planning for
            quick access wherever you roam.
          </p>
          <ul class="list-unstyled mt-3">
            <li v-if="!favorites.length" class="text-muted">
              <span class="material-icons me-2 align-middle">star_border</span>
              Add favourites from the Live Tracker to see them here.
            </li>
            <li
              v-for="item in favorites"
              :key="item.station"
              class="d-flex align-items-center gap-3 py-2 border-bottom"
            >
              <span class="material-icons text-danger">star_rate</span>
              <div>
                <div class="fw-semibold">{{ item.label || item.station }}</div>
                <div class="text-muted small">{{ item.station }}</div>
              </div>
              <button class="btn btn-sm btn-outline-danger ms-auto" @click="removeFavorite(item.station)">
                Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="350">
        <div class="section-card h-100">
          <h2 class="section-title mb-3">What’s popular now</h2>
          <ul class="list-unstyled mb-0">
            <li class="d-flex align-items-center gap-3 py-2 border-bottom">
              <span class="material-icons text-primary">flash_on</span>
              <div>
                <div class="fw-semibold">Dynamic route visualiser</div>
                <div class="text-muted small">Leaflet-powered map with transfer-aware walking times.</div>
              </div>
            </li>
            <li class="d-flex align-items-center gap-3 py-2 border-bottom">
              <span class="material-icons text-success">insights</span>
              <div>
                <div class="fw-semibold">Fare insights</div>
                <div class="text-muted small">Distance-based fares + monthly pass break-even analysis.</div>
              </div>
            </li>
            <li class="d-flex align-items-center gap-3 py-2">
              <span class="material-icons text-warning">diversity_3</span>
              <div>
                <div class="fw-semibold">Meet halfway</div>
                <div class="text-muted small">Suggests the fairest interchange for your group in seconds.</div>
              </div>
            </li>
          </ul>
          <button class="btn btn-primary mt-3 w-100" @click="setActiveTab('meetup')">
            <span class="material-icons me-2">groups</span>
            Try the Meet-up Planner
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useAppState } from '../composables/useAppState';
import { createTrainArrivalSimulator, getLineColor } from '../composables/useTrainAPI';
import { LIVE_TICKER_ROTATION_MS, LIVE_TICKER_STATIONS } from '../data/stations';

const simulator = createTrainArrivalSimulator({ updateIntervalMs: 1000 });
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
}

function updateClock() {
  const now = new Date();
  liveClock.value = now.toLocaleTimeString(undefined, { hour12: false });
}

onMounted(() => {
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
