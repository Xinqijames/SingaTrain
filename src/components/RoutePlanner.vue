<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import mapboxgl from 'mapbox-gl';
import { useDisplay, useTheme } from 'vuetify';
import { useRouteAnimation } from '../composables/useRouteAnimation';
import { useRoutePlanner } from '../composables/useRoutePlanner';
import { useFareCalculator } from '../composables/useFareCalculator';

type StationOption = { id: string; name: string };

defineOptions({ name: 'RoutePlanner' });

declare global {
  interface Window {
    $map?: mapboxgl.Map;
  }
}

const startStation = ref<string | null>('Jurong East');
const endStation = ref<string | null>('Marina Bay');
const isPlanning = ref(false);
const errorMsg = ref<string | null>(null);
const lastPlannedAt = ref<number | null>(null);

const stations = ref<StationOption[]>([]);
const routeSummary = ref<{
  estimatedTime: number;
  distanceKm: number;
  segments: ReturnType<typeof summariseSegments>;
} | null>(null);

const fareInfo = ref<{ amount: number; currency: string } | null>(null);

const theme = useTheme();
const { smAndDown } = useDisplay();
const isDark = computed(() => theme.global.current.value.dark);

const railrouterLoaded = ref(false);
const railRouterShell = ref<HTMLElement | null>(null);
let railrouterInstance: mapboxgl.Map | null = null;
let resizeObserver: ResizeObserver | null = null;

const NEUTRALIZE_STYLE_ID = 'singatrain-railrouter-neutralize';

const stationLookup = new Map<
  string,
  { coords: [number, number]; codes: string; id: number }
>();
const routeCoordinates = ref<Array<[number, number] | null>>([]);
const stationMarkers: Array<{ marker: mapboxgl.Marker; el: HTMLElement } | null> =
  [];
let trainMarker: mapboxgl.Marker | null = null;

const arrivedSnackbar = ref(false);
let arrivalTimer: number | null = null;

const {
  isPlaying,
  progressIndex,
  segmentProgress,
  routeStationIds,
  totalStops,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  attachRenderer,
  detachRenderer
} = useRouteAnimation();

const {
  allStations,
  shortestPath,
  estimateTimeMinutes,
  estimateDistanceKm,
  summariseSegments
} = useRoutePlanner();

const { fareByType } = useFareCalculator();

stations.value = allStations.map((name) => ({ id: name, name }));
if (!startStation.value && stations.value.length) {
  startStation.value = stations.value[0].id;
}
if (!endStation.value && stations.value.length > 1) {
  endStation.value = stations.value[1].id;
}

const basePath = import.meta.env.BASE_URL ?? '/';
const RAILROUTER_CSS = `${basePath}railrouter/index.61d3354a.css`;
const RAILROUTER_JS = `${basePath}railrouter/index.975ef6c8.js`;
const STATIONS_GEOJSON = `${basePath}sg-rail.geojson`;

async function ensureStationLookup() {
  if (stationLookup.size) return;
  try {
    const response = await fetch(STATIONS_GEOJSON);
    if (!response.ok) throw new Error('Failed to load station coordinates.');
    const geojson = await response.json();
    const features: Array<{
      id: number;
      properties: { name: string; station_codes: string; stop_type: string };
      geometry: { coordinates: [number, number] };
    }> = geojson.features ?? [];
    features
      .filter((feature) => feature.properties.stop_type === 'station')
      .forEach((feature) => {
        stationLookup.set(feature.properties.name, {
          coords: feature.geometry.coordinates,
          codes: feature.properties.station_codes,
          id: feature.id
        });
      });
  } catch (error) {
    console.error(error);
    throw new Error(
      'Could not load station metadata. Please refresh and try again.'
    );
  }
}

function injectStylesheet(href: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[data-railrouter="true"][href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.railrouter = 'true';
    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load RailRouter stylesheet: ${href}`));
    document.head.appendChild(link);
  });
}

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[data-railrouter="true"][src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.railrouter = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load RailRouter script: ${src}`));
    document.body.appendChild(script);
  });
}

async function ensureRailRouterAssets() {
  neutralizeRailRouterGlobals();
  if (!railrouterLoaded.value) {
    await Promise.all([injectStylesheet(RAILROUTER_CSS), injectScript(RAILROUTER_JS)]);
    railrouterLoaded.value = true;
  }
}

function waitForMap(timeout = 10000) {
  return new Promise<mapboxgl.Map | null>((resolve) => {
    const start = performance.now();
    const step = () => {
      if (window.$map) {
        resolve(window.$map);
        return;
      }
      if (performance.now() - start > timeout) {
        resolve(null);
        return;
      }
      requestAnimationFrame(step);
    };
    step();
  });
}

function ensureRouteLayers() {
  if (!railrouterInstance) return;
  const map = railrouterInstance;
  const sourceId = 'singatrain-route';
  const lineGlowId = 'singatrain-route-glow';
  const lineId = 'singatrain-route-line';

  const setup = () => {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] }
        }
      });
    }

    if (!map.getLayer(lineGlowId)) {
      map.addLayer({
        id: lineGlowId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#f97316',
          'line-width': 12,
          'line-opacity': 0.25
        }
      });
    }

    if (!map.getLayer(lineId)) {
      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#f97316',
          'line-width': 5
        }
      });
    }
  };

  if (!map.isStyleLoaded()) {
    map.once('styledata', setup);
  } else {
    setup();
  }
}

function updateRouteLine() {
  if (!railrouterInstance) return;
  const source = railrouterInstance.getSource(
    'singatrain-route'
  ) as mapboxgl.GeoJSONSource | undefined;
  if (!source) return;

  const coordinates = routeCoordinates.value.filter(
    (coords): coords is [number, number] => Array.isArray(coords)
  );

  source.setData({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    }
  });
}

function clearStationMarkers() {
  stationMarkers.forEach((entry) => entry?.marker.remove());
  stationMarkers.length = 0;
  trainMarker?.remove();
  trainMarker = null;
}

function createStationMarkers() {
  if (!railrouterInstance) return;
  clearStationMarkers();

  routeCoordinates.value.forEach((coords, index) => {
    if (!coords) {
      stationMarkers.push(null);
      return;
    }
    const el = document.createElement('div');
    el.className = 'route-stop route-stop-upcoming';
    el.dataset.index = String(index);
    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(coords)
      .addTo(railrouterInstance);
    stationMarkers.push({ marker, el });
  });

  const trainEl = document.createElement('div');
  trainEl.className = 'route-train-marker';
  trainEl.innerHTML = '<span class="material-icons">train</span>';
  trainMarker = new mapboxgl.Marker({ element: trainEl, anchor: 'center' });
  if (routeCoordinates.value[0]) {
    trainMarker.setLngLat(routeCoordinates.value[0] as [number, number]).addTo(railrouterInstance);
  }
}

function updateStationStates(activeIndex: number) {
  stationMarkers.forEach((entry, idx) => {
    if (!entry) return;
    entry.el.classList.toggle('route-stop-active', idx === activeIndex);
    entry.el.classList.toggle('route-stop-visited', idx < activeIndex);
    entry.el.classList.toggle('route-stop-upcoming', idx > activeIndex);
  });
}

function updateTrainMarkerPosition() {
  if (!railrouterInstance || !trainMarker) return;
  const currentIndex = progressIndex.value;
  const from = routeCoordinates.value[currentIndex];
  const to = routeCoordinates.value[currentIndex + 1] ?? from;
  if (!from) return;
  if (!to) {
    trainMarker.setLngLat(from);
    return;
  }
  const ratio = segmentProgress.value;
  const lng = from[0] + (to[0] - from[0]) * ratio;
  const lat = from[1] + (to[1] - from[1]) * ratio;
  trainMarker.setLngLat([lng, lat]);
}

function focusCurrentStop(index: number) {
  if (!railrouterInstance) return;
  const coords = routeCoordinates.value[index];
  if (!coords) return;
  const zoomTarget = smAndDown.value ? 12.3 : 13.2;
  railrouterInstance.easeTo({
    center: coords,
    zoom: Math.max(railrouterInstance.getZoom(), zoomTarget),
    duration: 850
  });
}

function applyMapTheme(dark: boolean) {
  if (!railrouterInstance) return;
  const canvas = railrouterInstance.getCanvas();
  canvas.style.filter = dark ? 'invert(0.92) hue-rotate(180deg)' : '';
}

async function createRailRouterMap() {
  await ensureRailRouterAssets();
  await ensureStationLookup();
  await nextTick();

  const mapInstance = await waitForMap();
  if (!mapInstance) {
    errorMsg.value = 'Unable to initialise RailRouter map.';
    return;
  }

  railrouterInstance = mapInstance;
  ensureRouteLayers();
  applyMapTheme(isDark.value);

  resizeObserver = new ResizeObserver(() => railrouterInstance?.resize());
  if (railRouterShell.value) {
    resizeObserver.observe(railRouterShell.value);
  }

  mapInstance.resize();

  // Set initial zoom and center for Singapore when map first loads
  // Singapore center coordinates: approximately [103.8198, 1.3521]
  if (mapInstance.isStyleLoaded()) {
    mapInstance.easeTo({
      center: [103.8198, 1.3521] as [number, number],
      zoom: 11.5,
      duration: 0
    });
  } else {
    mapInstance.once('styledata', () => {
      mapInstance.easeTo({
        center: [103.8198, 1.3521] as [number, number],
        zoom: 11.5,
        duration: 0
      });
    });
  }
}

function teardownRailRouterMap() {
  detachRenderer();
  clearStationMarkers();
  if (resizeObserver && railRouterShell.value) {
    resizeObserver.unobserve(railRouterShell.value);
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (railrouterInstance) {
    if (railrouterInstance.getLayer('singatrain-route-line')) {
      railrouterInstance.removeLayer('singatrain-route-line');
    }
    if (railrouterInstance.getLayer('singatrain-route-glow')) {
      railrouterInstance.removeLayer('singatrain-route-glow');
    }
    if (railrouterInstance.getSource('singatrain-route')) {
      railrouterInstance.removeSource('singatrain-route');
    }
    railrouterInstance.remove();
  }
  railrouterInstance = null;
  restoreRailRouterGlobals();
}

async function computeRouteSafe(fromId: string, toId: string) {
  const path = shortestPath(fromId, toId);
  if (!path || !path.steps?.length) {
    throw new Error('No valid route found.');
  }

  const estimatedTime = estimateTimeMinutes(path.totalWeight);
  const distanceKm = estimateDistanceKm(path.totalWeight);
  const segments = summariseSegments(path);

  routeSummary.value = {
    estimatedTime,
    distanceKm,
    segments
  };

  return path.steps.map((step) => step.station);
}

async function computeFareSafe(fromId: string, toId: string) {
  if (!routeSummary.value) return;
  const amount = fareByType(routeSummary.value.distanceKm, 'adult');
  fareInfo.value = {
    amount,
    currency: 'SGD'
  };
}

async function onPlanRoute() {
  errorMsg.value = null;
  fareInfo.value = null;
  routeSummary.value = null;
  isPlanning.value = true;
  try {
    if (!startStation.value || !endStation.value) {
      throw new Error('Please select a start and end station.');
    }
    if (startStation.value === endStation.value) {
      throw new Error('Pick two different stations to plan a journey.');
    }

    detachRenderer();
    resetAnimation();

    if (!railrouterInstance) {
      await createRailRouterMap();
    }
    if (!railrouterInstance) {
      throw new Error('RailRouter map is still initialising. Please try again shortly.');
    }

    const path = await computeRouteSafe(startStation.value, endStation.value);

    if (!path || path.length < 2) {
      throw new Error('No valid route found.');
    }

    routeStationIds.value = path;
    totalStops.value = path.length;

    routeCoordinates.value = path.map((name) => {
      const record = stationLookup.get(name);
      if (!record) {
        console.warn('Missing coordinates for station:', name);
        return null;
      }
      return record.coords;
    });

    ensureRouteLayers();
    updateRouteLine();
    createStationMarkers();
    updateStationStates(0);
    updateTrainMarkerPosition();
    focusCurrentStop(0);

    await computeFareSafe(startStation.value, endStation.value);

    attachRenderer((idx: number) => {
      updateStationStates(idx);
      focusCurrentStop(idx);
    });

    startAnimation();
    lastPlannedAt.value = Date.now();
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Failed to plan route.';
  } finally {
    isPlanning.value = false;
  }
}

function onPause() {
  pauseAnimation();
}

function onRestart() {
  resetAnimation();
  if (routeStationIds.value.length > 1) {
    updateStationStates(0);
    focusCurrentStop(0);
    startAnimation();
  }
}

function handleArrival() {
  arrivedSnackbar.value = true;
  if (arrivalTimer) {
    window.clearTimeout(arrivalTimer);
  }
  arrivalTimer = window.setTimeout(() => {
    arrivedSnackbar.value = false;
    arrivalTimer = null;
  }, 3200);
}

watch(isDark, (value) => applyMapTheme(value));

watch([progressIndex, segmentProgress], updateTrainMarkerPosition);

watch(routeStationIds, () => {
  // Reset snackbar + markers when the path changes
  arrivedSnackbar.value = false;
});

function neutralizeRailRouterGlobals() {
  if (typeof window === 'undefined') return;
  if (document.getElementById(NEUTRALIZE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = NEUTRALIZE_STYLE_ID;
  style.textContent = `
    html {
      position: static !important;
      inset: auto !important;
      overflow: auto !important;
      height: auto !important;
    }
    body {
      overflow: auto !important;
      position: static !important;
      height: auto !important;
    }
  `;
  document.head.appendChild(style);
}

function restoreRailRouterGlobals() {
  if (typeof window === 'undefined') return;
  const style = document.getElementById(NEUTRALIZE_STYLE_ID);
  if (style?.parentNode) {
    style.parentNode.removeChild(style);
  }
}

onMounted(async () => {
  window.addEventListener('route-animation-arrived', handleArrival);
  await createRailRouterMap();
});

onBeforeUnmount(() => {
  window.removeEventListener('route-animation-arrived', handleArrival);
  if (arrivalTimer) {
    window.clearTimeout(arrivalTimer);
  }
  teardownRailRouterMap();
});
</script>

<template>
  <v-container class="pa-0">
    <v-card class="rp-card" rounded="xl" elevation="1">
      <div class="rp-header">
        <div class="rp-title">
          <h1>Plan your MRT route</h1>
          <p class="subtitle">
            Smart MRT navigation for Singapore
          </p>
        </div>
        <div class="rp-actions">
          <v-btn
            variant="outlined"
            class="action-btn"
            prepend-icon="mdi-crosshairs-gps"
            @click="
              () => {
                /* TODO: integrate geolocation if available */
              }
            "
          >
            Locate me
          </v-btn>
        </div>
      </div>

      <div class="rp-form" :class="{ stacked: smAndDown }">
        <v-select
          class="rp-input"
          :items="stations"
          item-title="name"
          item-value="id"
          v-model="startStation"
          label="Start station"
          variant="outlined"
          density="comfortable"
          hide-details
          :menu-props="{ maxHeight: 320 }"
          prepend-inner-icon="mdi-map-marker"
        />
        <v-select
          class="rp-input"
          :items="stations"
          item-title="name"
          item-value="id"
          v-model="endStation"
          label="End station"
          variant="outlined"
          density="comfortable"
          hide-details
          :menu-props="{ maxHeight: 320 }"
          prepend-inner-icon="mdi-flag-checkered"
        />
        <v-btn
          class="rp-plan"
          color="orange"
          variant="flat"
          height="48"
          prepend-icon="mdi-transit-connection-variant"
          :loading="isPlanning"
          @click="onPlanRoute"
        >
          Plan Route
        </v-btn>
      </div>

      <v-alert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        class="mt-2"
        density="comfortable"
      >
        {{ errorMsg }}
      </v-alert>

      <div class="rp-map-wrap">
        <div ref="railRouterShell" class="railrouter-shell">
          <div id="station" class="sheet" />
          <button type="button" class="sheet-close"></button>
          <div id="map" class="railrouter-map"></div>
          <div id="home" class="sheet modal">
            <button type="button" class="btn" id="btn-close-home">Let's explore!</button>
          </div>
          <details id="legend">
            <summary>Legend</summary>
            <div id="crowded-timing"></div>
          </details>
          <div id="logo" tabindex="-1"></div>
          <div id="search" hidden>
            <div id="search-field-container">
              <input id="search-field" type="search" autocomplete="off" spellcheck="false" />
              <button type="button" id="search-cancel">Cancel</button>
            </div>
            <ul id="search-results"></ul>
          </div>
        </div>
        <v-sheet class="rp-controls" rounded="lg" elevation="1">
          <div class="rp-ctrl-left">
            <v-chip size="small" class="mr-2" color="success" variant="flat" prepend-icon="mdi-clock-outline">
              <span v-if="lastPlannedAt">Updated {{ new Date(lastPlannedAt).toLocaleTimeString() }}</span>
              <span v-else>Ready</span>
            </v-chip>
            <v-chip size="small" variant="tonal" prepend-icon="mdi-counter">
              {{ progressIndex + 1 }} / {{ Math.max(totalStops, 0) }} stops
            </v-chip>
            <v-chip
              v-if="routeSummary"
              size="small"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-timer-sand"
            >
              {{ routeSummary.estimatedTime }} min • {{ routeSummary.distanceKm.toFixed(1) }} km
            </v-chip>
          </div>
          <div class="rp-ctrl-right">
            <v-btn
              class="ctrl-btn"
              variant="outlined"
              height="40"
              prepend-icon="mdi-restart"
              @click="onRestart"
            >
              Restart
            </v-btn>
          </div>
        </v-sheet>
      </div>

      <div v-if="fareInfo" class="rp-fare">
        <v-chip size="large" color="orange" variant="flat" prepend-icon="mdi-cash">
          Estimated Fare: {{ fareInfo.amount.toFixed(2) }} {{ fareInfo.currency }}
        </v-chip>
      </div>

      <div v-if="routeSummary?.segments?.length" class="rp-segments">
        <v-sheet v-for="segment in routeSummary.segments" :key="segment.line + segment.from" class="segment-sheet" rounded="lg" elevation="0">
          <div class="segment-line">
            <span class="segment-line-name">{{ segment.line }}</span>
            <small class="segment-stops">{{ segment.stops }} stops</small>
          </div>
          <div class="segment-route">
            <span class="segment-station">{{ segment.from }}</span>
            <span class="material-icons segment-arrow">arrow_forward</span>
            <span class="segment-station">{{ segment.to }}</span>
          </div>
        </v-sheet>
      </div>
    </v-card>

    <v-snackbar v-model="arrivedSnackbar" timeout="0" location="bottom">
      You’ve arrived at your destination 🚆
      <template #actions>
        <v-btn color="orange" variant="text" @click="arrivedSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.rp-card {
  padding: 24px;
  border: 1px solid var(--v-border-color, #e5e7eb);
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--v-border-color, #e5e7eb);
}

.rp-title h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.rp-title .subtitle {
  margin: 4px 0 0 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 16px;
}

.rp-actions .action-btn {
  height: 40px;
}

.rp-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  margin-top: 16px;
}

.rp-form.stacked {
  grid-template-columns: 1fr;
}

.rp-input :deep(.v-field__input) {
  min-height: 48px;
}

.rp-plan {
  min-width: 160px;
}

.rp-map-wrap {
  position: relative;
  margin-top: 16px;
}

.railrouter-shell {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--v-border-color, #e5e7eb);
  background: rgb(var(--v-theme-background));
}

.railrouter-map {
  width: 100%;
  height: 100%;
}

.railrouter-shell #station,
.railrouter-shell #home,
.railrouter-shell #legend,
.railrouter-shell #logo,
.railrouter-shell #search {
  display: none !important;
}

/* Reposition the sheet-close button (cross button) to top-right of map */
.railrouter-shell .sheet-close {
  top: 16px !important;
  right: 16px !important;
  left: auto !important;
  transform: translateY(0) !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  z-index: 1000 !important;
}

.railrouter-shell #station.open ~ .sheet-close,
.railrouter-shell .sheet.open ~ .sheet-close {
  top: 16px !important;
  right: 16px !important;
  transform: translateY(0) !important;
}

.railrouter-shell #station.open.min ~ .sheet-close {
  transform: translateY(0) rotate(-90deg) !important;
}

/* Reposition Mapbox controls to the right */
.railrouter-shell .mapboxgl-ctrl-bottom-right {
  bottom: 80px !important;
  right: 16px !important;
  left: auto !important;
}

.railrouter-shell .mapboxgl-ctrl-top-right {
  top: 70px !important;
  right: 16px !important;
  left: auto !important;
}

/* Position 3D navigation controls (compass, rotation, pitch) to the right */
.railrouter-shell .mapboxgl-ctrl-group {
  position: relative;
}

.railrouter-shell .mapboxgl-ctrl-group button {
  pointer-events: auto;
}

.rp-controls {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 85%, transparent);
}

.rp-ctrl-left,
.rp-ctrl-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  min-width: 110px;
}

.rp-fare {
  margin-top: 16px;
}

.rp-segments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.segment-sheet {
  padding: 12px 16px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
}

.segment-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.segment-route {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-weight: 500;
}

.segment-arrow {
  font-size: 18px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.segment-station {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.route-stop {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(249, 115, 22, 0.4);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.route-stop-visited {
  background: rgba(249, 115, 22, 0.9);
  border-color: rgba(249, 115, 22, 0.95);
  transform: scale(1);
}

.route-stop-active {
  background: #f97316;
  border-color: #f97316;
  transform: scale(1.25);
  box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.25);
}

.route-stop-upcoming {
  opacity: 0.8;
}

.route-train-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f97316;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.35);
  transform: translateY(-6px);
}

.route-train-marker .material-icons {
  font-size: 18px;
  line-height: 1;
}

:global(.v-theme--dark) .rp-card {
  border-color: #2d3139;
}

:global(.v-theme--dark) .railrouter-shell {
  border-color: #2d3139;
}

:global(html) {
  position: static !important;
  inset: auto !important;
}

:global(body) {
  overflow: auto !important;
}

@media (max-width: 960px) {
  .railrouter-shell {
    height: 360px;
  }
}

@media (max-width: 600px) {
  .railrouter-shell {
    height: 320px;
  }
  .rp-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .rp-ctrl-right {
    justify-content: space-between;
  }
}
</style>
