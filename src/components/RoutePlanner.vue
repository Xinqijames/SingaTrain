<template>
  <section class="section-card">
    <h2 class="section-title mb-3">Intelligent Route Planner</h2>
    <p class="text-muted">
      Find the fastest MRT journey with interchange-aware timing estimates. Visualise the path on the network map
      and inspect each segment for transfers and stop counts.
    </p>

    <form class="row g-3 align-items-end mt-1" @submit.prevent="planRoute">
      <div class="col-md-5">
        <label class="form-label" for="routeStart">From</label>
        <select id="routeStart" v-model="startStation" class="form-select">
          <option v-for="station in stations" :key="station" :value="station">
            {{ station }}
          </option>
        </select>
      </div>
      <div class="col-md-5">
        <label class="form-label" for="routeEnd">To</label>
        <select id="routeEnd" v-model="endStation" class="form-select">
          <option v-for="station in stations" :key="station" :value="station">
            {{ station }}
          </option>
        </select>
      </div>
      <div class="col-md-2 d-flex gap-2">
        <button class="btn btn-outline-danger flex-grow-1" type="button" @click="swapStations">
          <span class="material-icons align-middle me-1">swap_vert</span>
          Swap
        </button>
        <button class="btn btn-primary flex-grow-1" type="submit">
          <span class="material-icons align-middle me-1">alt_route</span>
          Plan
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>

    <div v-if="routeResult" class="mt-4">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="border rounded-3 p-3 bg-light mb-3">
            <div class="d-flex align-items-center gap-3 mb-2">
              <span class="material-icons text-danger fs-3">timer</span>
              <div>
                <div class="fw-semibold text-uppercase small text-muted">Estimated travel time</div>
                <div class="fs-4 fw-bold">{{ routeResult.estimatedTime }} min</div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="material-icons text-primary fs-3">straighten</span>
              <div>
                <div class="fw-semibold text-uppercase small text-muted">Approx distance</div>
                <div class="fs-4 fw-bold">{{ routeResult.distanceKm }} km</div>
              </div>
            </div>
          </div>

          <h5 class="mb-3">Segments</h5>
          <div v-for="segment in routeResult.segments" :key="segment.from + segment.line" class="route-step">
            Take <strong>{{ segment.line }}</strong> from
            <span class="station-chip">{{ segment.from }}</span>
            to
            <span class="station-chip">{{ segment.to }}</span>
            <small class="d-block text-muted">{{ segment.stops }} stops</small>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="border rounded-4 overflow-hidden" style="min-height: 420px">
            <div id="routeVisualizerMap" style="height: 420px; width: 100%"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import L from 'leaflet';
import { parseStationCoordinates } from '../data/stationCoordinates';
import { useRoutePlanner } from '../composables/useRoutePlanner';

const {
  allStations: stations,
  shortestPath,
  estimateTimeMinutes,
  estimateDistanceKm,
  summariseSegments
} = useRoutePlanner();

const startStation = ref('Jurong East');
const endStation = ref('Marina Bay');
const routeResult = ref(null);
const errorMessage = ref('');

const stationCoords = parseStationCoordinates();
const stationLookup = new Map(stationCoords.map((entry) => [entry.name.toLowerCase(), entry]));

let mapInstance = null;
let imageBounds = null;
let startMarker = null;
let endMarker = null;
let routeLine = null;

function findStationCoordinates(name) {
  return stationLookup.get(name.toLowerCase()) || null;
}

function swapStations() {
  [startStation.value, endStation.value] = [endStation.value, startStation.value];
}

function planRoute() {
  errorMessage.value = '';
  routeResult.value = null;

  if (startStation.value === endStation.value) {
    errorMessage.value = 'Please choose two different stations.';
    return;
  }

  const path = shortestPath(startStation.value, endStation.value);
  if (!path) {
    errorMessage.value = 'No valid MRT route found between these stations.';
    return;
  }

  const estimatedTime = estimateTimeMinutes(path.totalWeight);
  const distanceKm = estimateDistanceKm(path.totalWeight);
  const segments = summariseSegments(path);

  routeResult.value = {
    path,
    estimatedTime,
    distanceKm,
    segments
  };

  nextTick(() => renderRouteOnMap(path));
}

function renderRouteOnMap(path) {
  if (!mapInstance || !imageBounds) return;

  if (routeLine) {
    mapInstance.removeLayer(routeLine);
    routeLine = null;
  }
  if (startMarker) {
    mapInstance.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    mapInstance.removeLayer(endMarker);
    endMarker = null;
  }

  const latLngs = [];

  path.steps.forEach((step) => {
    const info = findStationCoordinates(step.station);
    if (!info) return;
    const projected = mapInstance.unproject([info.position.x, info.position.y], mapInstance.getMaxZoom());
    latLngs.push(projected);
  });

  if (!latLngs.length) return;

  startMarker = L.circleMarker(latLngs[0], {
    radius: 9,
    color: '#22c55e',
    fillColor: '#22c55e',
    fillOpacity: 1
  }).addTo(mapInstance);
  startMarker.bindPopup(`<strong>Start</strong><br>${path.steps[0].station}`).openPopup();

  endMarker = L.circleMarker(latLngs[latLngs.length - 1], {
    radius: 9,
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 1
  }).addTo(mapInstance);
  endMarker.bindPopup(`<strong>End</strong><br>${path.steps[path.steps.length - 1].station}`);

  routeLine = L.polyline(latLngs, {
    color: '#f97316',
    weight: 6,
    opacity: 0.8
  }).addTo(mapInstance);

  mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
}

function initMap() {
  if (mapInstance) return;

  const imageUrl = '/MRT-Map.png';
  const img = new Image();
  img.onload = () => {
    const width = img.width;
    const height = img.height;

    mapInstance = L.map('routeVisualizerMap', {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      attributionControl: false
    });

    imageBounds = [
      mapInstance.unproject([0, height], mapInstance.getMaxZoom()),
      mapInstance.unproject([width, 0], mapInstance.getMaxZoom())
    ];

    L.imageOverlay(imageUrl, imageBounds).addTo(mapInstance);
    mapInstance.fitBounds(imageBounds);
    setTimeout(() => mapInstance.invalidateSize(), 150);

    if (routeResult.value) {
      renderRouteOnMap(routeResult.value.path);
    }
  };
  img.src = imageUrl;
}

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>
