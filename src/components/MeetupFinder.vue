<template>
  <section class="section-card">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h2 class="section-title mb-2">Meet-up Point Finder</h2>
        <p class="mb-0">
          Enter origin stations for your group and we'll suggest the fairest MRT interchange, minimising total travel
          time for everyone.
        </p>
      </div>
    </div>

    <div class="meetup-container">
      <!-- Person cards - hide when results are shown -->
      <template v-if="!result">
        <div
          v-for="(participant, index) in participants"
          :key="participant.id"
          class="person-card"
          :class="{ active: !!participant.station }"
        >
          <div class="person-header">
            <div class="person-avatar">{{ index + 1 }}</div>
            <div class="person-info">
              <h6>Person {{ index + 1 }}</h6>
              <small>{{ participant.station || 'Choose a starting station' }}</small>
            </div>
            <button
              v-if="participants.length > 2"
              class="btn btn-sm btn-outline-danger ms-auto"
              type="button"
              @click="removeParticipant(participant.id)"
            >
              <span class="material-icons">delete</span>
            </button>
          </div>
          <div class="station-selector">
            <select v-model="participant.station" class="form-select">
              <option value="">-- Select station --</option>
              <option v-for="station in stations" :key="station" :value="station">{{ station }}</option>
            </select>
          </div>
        </div>
      </template>

      <!-- Results card - styled like person-card, spans full width -->
      <div v-if="result" class="meetup-results-card person-card feature-result-animate">
        <div class="mb-3 d-flex align-items-center gap-3">
          <h4 class="mb-0 text-dark d-flex align-items-center flex-wrap gap-2 flex-grow-1">
            <span class="material-icons me-2 text-danger">place</span>
            <span><strong>Suggested meet-up: {{ result.station }}</strong></span>
            <div class="d-flex align-items-center gap-2 ms-2">
              <span
                v-for="code in getStationCodes(result.station)"
                :key="code.code"
                class="station-code-badge"
                :style="{ 
                  backgroundColor: code.bgColor,
                  color: code.color,
                  borderColor: code.borderColor
                }"
              >
                <strong>{{ code.code }}</strong>
              </span>
            </div>
          </h4>
          <button class="pushable pushable-cancel" type="button" @click="clearResults">
            <span class="shadow"></span>
            <span class="edge"></span>
            <span class="front">Cancel</span>
          </button>
        </div>
        <div class="row g-3">
          <div class="col-md-4">
            <div class="border rounded-3 p-3 bg-light h-100">
              <p class="mb-2">
                <strong>Total travel time:</strong> {{ result.totalMinutes }} minutes
              </p>
              <p class="mb-0">
                <strong>Average per person:</strong> {{ result.averageMinutes.toFixed(1) }} minutes
              </p>
            </div>
          </div>
          <div class="col-md-8">
            <div class="border rounded-3 p-3">
              <h6 class="text-uppercase fw-semibold mb-2 text-dark">Individual journeys</h6>
              <div
                v-for="detail in result.details"
                :key="detail.origin"
                class="d-flex justify-content-between align-items-center border-bottom py-2"
              >
                <div>
                  <div class="fw-semibold">{{ detail.origin }}</div>
                  <div class="small">{{ detail.steps.length }} stops / {{ detail.segments.length }} segment(s) </div>
                </div>
                <span class="badge bg-warning text-dark fs-6">{{ detail.minutes }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="meetup-actions">
      <button class="custom-btn" type="button" @click="findMeetup">
          <span class="material-icons me-1">travel_explore</span>
          Meet-up
          <svg class="star-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-3" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
        </button>
        <button class="custom-btn" type="button" @click="addParticipant">
          <span class="material-icons me-1">person_add</span>
          Add person
          <svg class="star-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-3" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
        </button>
        <button class="custom-btn" type="button" @click="reset">
          <span class="material-icons me-1">restart_alt</span>
          Clear
          <svg class="star-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-3" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
          <svg class="star-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512">
            <polygon class="fil0" points="259.216,29.942 330.286,193.919 512,222.877 378,357.736 404.58,439.15 259.216,378.062 113.852,439.15 140.432,357.736 6,222.877 188.146,193.919 "/>
          </svg>
        </button>
      </div>

    <div class="map-panel mt-5">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div class="d-flex align-items-center gap-2">
          <span class="material-icons text-danger">map</span>
          <h5 class="mb-0">Interactive MRT Network</h5>
        </div>
        <div class="small">Click a station to assign or remove it for the next available person.</div>
      </div>
      <div class="map-wrapper">
        <div ref="mapContainer" class="meetup-map rounded-4"></div>
        <div class="map-loading-overlay" :class="{ show: mapLoading }">
          <div class="map-loading-content">
            <div class="capybaraloader">
              <div class="capybara">
                <div class="capy">
                  <div class="capyhead">
                    <div class="capyear">
                      <div class="capyear2"></div>
                    </div>
                    <div class="capyear">
                      <div class="capyear2"></div>
                    </div>
                    <div class="capymouth">
                      <div class="capylips"></div>
                      <div class="capylips"></div>
                    </div>
                    <div class="capyeye"></div>
                    <div class="capyeye"></div>
                  </div>
                  <div class="capyleg">
                    <div class="capyleg2"></div>
                    <div class="capyleg2"></div>
                  </div>
                </div>
              </div>
              <div class="loader">
                <div class="loaderline"></div>
              </div>
            </div>
            <h6 class="mt-3">Loading the rail network…</h6>
            <p class="mb-0">Map layers are stitched together in a moment.</p>
          </div>
        </div>
        <div v-if="mapLoadError" class="alert alert-warning map-overlay-message mb-0">{{ mapLoadError }}</div>
      </div>
      <div v-if="mapFeedback" class="map-overlay-message">{{ mapFeedback }}</div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="capybaraloader mx-auto">
        <div class="capybara">
          <div class="capy">
            <div class="capyhead">
              <div class="capyear">
                <div class="capyear2"></div>
              </div>
              <div class="capyear">
                <div class="capyear2"></div>
              </div>
              <div class="capymouth">
                <div class="capylips"></div>
                <div class="capylips"></div>
              </div>
              <div class="capyeye"></div>
              <div class="capyeye"></div>
            </div>
            <div class="capyleg">
              <div class="capyleg2"></div>
              <div class="capyleg2"></div>
            </div>
          </div>
        </div>
        <div class="loader">
          <div class="loaderline"></div>
        </div>
      </div>
      <p class="mt-3">Crunching routes…</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import { useRoutePlanner } from '../composables/useRoutePlanner';
import { STATION_CODES_BY_LINE } from '../data/stationCoordinates';
import { TRAIN_STATION_LINES, LINE_COLOR_MAP } from '../data/stations';

const { allStations: stations, shortestPath, estimateTimeMinutes, summariseSegments } = useRoutePlanner();

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlZWF1biIsImEiOiJja2NydG83cWMwaGJsMnBqdjR5aHc3MzdlIn0.YGTZpi7JQMquEOv9E8K_bg';
const GEOJSON_URL = '/sg-rail.geojson';
const MAX_PARTICIPANTS = 10;

let idCounter = 0;
const participants = ref([
  { id: ++idCounter, station: '' },
  { id: ++idCounter, station: '' }
]);

const loading = ref(false);
const errorMessage = ref('');
const result = ref(null);
const mapContainer = ref(null);
const mapInstance = ref(null);
const mapLoaded = ref(false);
const mapLoadError = ref('');
const mapFeedback = ref('');
let feedbackTimeout = null;
const stationLookup = new Map();
const participantMarkers = new Map();
let meetupMarker = null;

const mapLoading = computed(() => !mapLoaded.value && !mapLoadError.value);

function addParticipant() {
  if (participants.value.length >= MAX_PARTICIPANTS) {
    setMapFeedback(`Maximum of ${MAX_PARTICIPANTS} people reached.`);
    return false;
  }
  participants.value.push({ id: ++idCounter, station: '' });
  return true;
}

function removeParticipant(id) {
  if (participants.value.length <= 2) {
    setMapFeedback('At least 2 persons are required.');
    return;
  }
  participants.value = participants.value.filter((p) => p.id !== id);
  updateParticipantMarkers();
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getStationCodes(stationName) {
  const stationCodes = STATION_CODES_BY_LINE[stationName];
  if (!stationCodes) return [];
  
  const codes = [];
  
  // Get codes for each line the station serves
  Object.entries(stationCodes).forEach(([lineName, code]) => {
    const color = LINE_COLOR_MAP[lineName];
    if (color && code) {
      codes.push({
        code,
        color,
        lineName,
        bgColor: hexToRgba(color, 0.12),
        borderColor: hexToRgba(color, 0.3)
      });
    }
  });
  
  return codes;
}

function clearResults() {
  // Clear only the results, keep the participant stations
  result.value = null;
  errorMessage.value = '';
  updateMeetupMarker();
}

function reset() {
  // Clear everything including participants
  participants.value = [
    { id: ++idCounter, station: '' },
    { id: ++idCounter, station: '' }
  ];
  result.value = null;
  errorMessage.value = '';
  updateParticipantMarkers();
  updateMeetupMarker();
}

async function findMeetup() {
  errorMessage.value = '';
  result.value = null;

  const selectedStations = participants.value.map((p) => p.station).filter(Boolean);
  if (selectedStations.length < 2) {
    errorMessage.value = 'Please provide at least two starting stations.';
    return;
  }

  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 450)); // subtle UX pause

  let bestStation = null;
  let bestMaxMinutes = Infinity;
  let bestAvgMinutes = Infinity;
  let bestDetails = null;

  stations.forEach((candidate) => {
    const detailRows = [];
    const travelMinutes = [];

    for (const origin of selectedStations) {
      if (origin === candidate) {
        // If someone is already at the candidate station, their travel time is 0
        travelMinutes.push(0);
        detailRows.push({
          origin,
          path: { steps: [{ station: origin, line: '' }], totalWeight: 0 },
          minutes: 0,
          segments: [],
          steps: [{ station: origin, line: '' }]
        });
        continue;
      }
      const path = shortestPath(origin, candidate);
      if (!path) {
        // If no path found, skip this candidate
        return;
      }
      const minutes = estimateTimeMinutes(path.totalWeight);
      travelMinutes.push(minutes);
      detailRows.push({
        origin,
        path,
        minutes,
        segments: summariseSegments(path),
        steps: path.steps
      });
    }

    // Calculate fairness metrics: minimize maximum travel time first, then average
    const maxMinutes = Math.max(...travelMinutes);
    const avgMinutes = travelMinutes.reduce((sum, m) => sum + m, 0) / travelMinutes.length;

    // Choose station with lower max travel time, or if equal, lower average
    if (maxMinutes < bestMaxMinutes || (maxMinutes === bestMaxMinutes && avgMinutes < bestAvgMinutes)) {
      bestMaxMinutes = maxMinutes;
      bestAvgMinutes = avgMinutes;
      bestStation = candidate;
      bestDetails = detailRows;
    }
  });

  if (!bestStation || !bestDetails?.length) {
    errorMessage.value = 'Unable to locate a fair meet-up point for the provided stations.';
    loading.value = false;
    return;
  }

  const totalMinutes = bestDetails.reduce((sum, item) => sum + item.minutes, 0);
  const maxTravelTime = Math.max(...bestDetails.map(d => d.minutes));
  result.value = {
    station: bestStation,
    totalMinutes,
    averageMinutes: totalMinutes / bestDetails.length,
    maxTravelTime, // Maximum travel time for fairness indicator
    details: bestDetails
  };

  loading.value = false;
  updateMeetupMarker();
  setMapFeedback(`Suggested meeting point: ${bestStation}`);
  
  // Zoom to meetup station when results appear
  nextTick(() => {
    zoomToMeetupStation(bestStation);
  });
}

function setMapFeedback(message) {
  if (!message) return;
  mapFeedback.value = message;
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }
  feedbackTimeout = window.setTimeout(() => {
    mapFeedback.value = '';
    feedbackTimeout = null;
  }, 3500);
}

function handleMapStationSelection(stationName) {
  if (!stationName) return;
  const existing = participants.value.findIndex((p) => p.station === stationName);
  if (existing !== -1) {
    participants.value[existing].station = '';
    setMapFeedback(`${stationName} removed from Person ${existing + 1}.`);
    return;
  }

  const empty = participants.value.findIndex((p) => !p.station);
  if (empty !== -1) {
    participants.value[empty].station = stationName;
    setMapFeedback(`${stationName} assigned to Person ${empty + 1}.`);
    return;
  }

  if (participants.value.length >= MAX_PARTICIPANTS) {
    setMapFeedback(`Cannot add ${stationName}; maximum of ${MAX_PARTICIPANTS} people reached.`);
    return;
  }

  const added = addParticipant();
  if (!added) return;
  const latestIndex = participants.value.length - 1;
  participants.value[latestIndex].station = stationName;
  setMapFeedback(`${stationName} assigned to new Person ${latestIndex + 1}.`);
}

function updateParticipantMarkers() {
  // Marker display removed - no markers will be shown on the map
  if (!mapInstance.value || !mapLoaded.value) return;
  participantMarkers.forEach((marker) => marker.remove());
  participantMarkers.clear();
}

function updateMeetupMarker() {
  // Marker display removed - no markers will be shown on the map
  // Keep the flyTo functionality for better UX
  if (!mapInstance.value || !mapLoaded.value) return;
  if (meetupMarker) {
    meetupMarker.remove();
    meetupMarker = null;
  }
  const stationName = result.value?.station;
  if (!stationName) return;
  zoomToMeetupStation(stationName);
}

function zoomToMeetupStation(stationName) {
  if (!mapInstance.value || !mapLoaded.value || !stationName) return;
  const feature = stationLookup.get(stationName.toLowerCase());
  if (!feature) return;
  mapInstance.value.flyTo({
    center: feature.geometry.coordinates,
    zoom: 13,
    essential: true,
    speed: 0.8
  });
}

async function initMap() {
  if (mapInstance.value || !mapContainer.value) return;
  mapboxgl.accessToken = MAPBOX_TOKEN;

  mapInstance.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [103.8475, 1.3011],
    zoom: 11,
    renderWorldCopies: false,
    pitchWithRotate: false,
    attributionControl: false,
    cooperativeGestures: true
  });

  mapInstance.value.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

  mapInstance.value.on('load', async () => {
    try {
      const response = await fetch(GEOJSON_URL);
      if (!response.ok) {
        throw new Error(`Unable to load map data (HTTP ${response.status})`);
      }
      const data = await response.json();
      mapInstance.value.addSource('singatrain-rail', {
        type: 'geojson',
        data
      });
      mapInstance.value.addLayer({
        id: 'singatrain-lines',
        source: 'singatrain-rail',
        filter: ['==', ['geometry-type'], 'LineString'],
        type: 'line',
        paint: {
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 6],
          'line-color': [
            'match',
            ['get', 'line_color'],
            'orangered',
            '#d42e12',
            'mediumseagreen',
            '#009645',
            'orange',
            '#fa9e0d',
            'saddlebrown',
            '#9D5B25',
            'darkmagenta',
            '#9900aa',
            'darkslateblue',
            '#005ec4',
            '#748477'
          ],
          'line-opacity': 0.8
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      });
      mapInstance.value.addLayer({
        id: 'singatrain-stations',
        source: 'singatrain-rail',
        filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'stop_type'], 'station']],
        type: 'circle',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'station_colors'],
            'red',
            '#d42e12',
            'green',
            '#009645',
            'orange',
            '#fa9e0d',
            'brown',
            '#9D5B25',
            'purple',
            '#9900aa',
            'blue',
            '#005ec4',
            '#748477'
          ],
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
      mapInstance.value.addLayer({
        id: 'singatrain-labels',
        source: 'singatrain-rail',
        filter: ['==', ['get', 'stop_type'], 'station'],
        type: 'symbol',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'top',
          'text-offset': [0, 0.8],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#2f3640',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });

      data.features
        .filter((feature) => feature.geometry?.type === 'Point' && feature.properties?.stop_type === 'station')
        .forEach((feature) => {
          stationLookup.set(feature.properties.name.toLowerCase(), feature);
        });

      mapInstance.value.on('mouseenter', 'singatrain-stations', () => {
        mapInstance.value && (mapInstance.value.getCanvas().style.cursor = 'pointer');
      });
      mapInstance.value.on('mouseleave', 'singatrain-stations', () => {
        mapInstance.value && (mapInstance.value.getCanvas().style.cursor = '');
      });
      mapInstance.value.on('click', 'singatrain-stations', (event) => {
        const feature = event.features?.[0];
        const stationName = feature?.properties?.name;
        handleMapStationSelection(stationName);
      });

      mapLoaded.value = true;
      mapLoadError.value = '';
      updateParticipantMarkers();
      updateMeetupMarker();
    } catch (error) {
      console.error('Failed to load rail GeoJSON', error);
      mapLoadError.value = 'Map data is unavailable right now. Please try again later.';
    }
  });
}

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  participantMarkers.forEach((marker) => marker.remove());
  participantMarkers.clear();
  if (meetupMarker) {
    meetupMarker.remove();
    meetupMarker = null;
  }
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = null;
  }
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }
});

watch(
  participants,
  () => {
    updateParticipantMarkers();
  },
  { deep: true }
);

watch(
  () => result.value?.station,
  () => {
    updateMeetupMarker();
  }
);

watch(mapLoaded, (value) => {
  if (value) {
    updateParticipantMarkers();
    updateMeetupMarker();
  }
});
</script>

<style scoped>
/* From Uiverse.io by MuhammadHasann - exact match */

.meetup-actions .custom-btn {
  position: relative;
  padding: 12px 35px;
  background: #fec195;
  font-size: 17px;
  font-weight: 500;
  color: #181818;
  border: 3px solid #fec195;
  border-radius: 8px;
  box-shadow: 0 0 0 #fec1958c;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.meetup-actions .custom-btn .star-1 {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 25px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 1s cubic-bezier(0.05, 0.83, 0.43, 0.96);
}

.meetup-actions .custom-btn .star-2 {
  position: absolute;
  top: 45%;
  left: 45%;
  width: 15px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 1s cubic-bezier(0, 0.4, 0, 1.01);
}

.meetup-actions .custom-btn .star-3 {
  position: absolute;
  top: 40%;
  left: 40%;
  width: 5px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 1s cubic-bezier(0, 0.4, 0, 1.01);
}

.meetup-actions .custom-btn .star-4 {
  position: absolute;
  top: 20%;
  left: 40%;
  width: 8px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 0.8s cubic-bezier(0, 0.4, 0, 1.01);
}

.meetup-actions .custom-btn .star-5 {
  position: absolute;
  top: 25%;
  left: 45%;
  width: 15px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 0.6s cubic-bezier(0, 0.4, 0, 1.01);
}

.meetup-actions .custom-btn .star-6 {
  position: absolute;
  top: 5%;
  left: 50%;
  width: 5px;
  height: auto;
  filter: drop-shadow(0 0 0 #fffdef);
  z-index: -5;
  transition: all 0.8s ease;
}

.meetup-actions .custom-btn:hover {
  background: transparent;
  color: #fec195;
  box-shadow: 0 0 25px #fec1958c;
}

.meetup-actions .custom-btn:hover .star-1 {
  position: absolute;
  top: -80%;
  left: -30%;
  width: 25px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn:hover .star-2 {
  position: absolute;
  top: -25%;
  left: 10%;
  width: 15px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn:hover .star-3 {
  position: absolute;
  top: 55%;
  left: 25%;
  width: 5px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn:hover .star-4 {
  position: absolute;
  top: 30%;
  left: 80%;
  width: 8px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn:hover .star-5 {
  position: absolute;
  top: 25%;
  left: 20%;
  width: 15px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn:hover .star-6 {
  position: absolute;
  top: 5%;
  left: 60%;
  width: 5px;
  height: auto;
  filter: drop-shadow(0 0 10px #fffdef);
  z-index: 2;
}

.meetup-actions .custom-btn .fil0 {
  fill: #FFD700;
}

/* Ensure buttons stay side by side in a row */
.meetup-actions {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  gap: 12px !important;
  margin-top: 24px !important;
  align-items: center !important;
}

/* Override media query that might stack buttons */
@media (max-width: 768px) {
  .meetup-actions {
    flex-direction: row !important;
    flex-wrap: wrap !important;
  }
}

/* Display 2 person cards per row */
.meetup-container {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 24px !important;
}

.meetup-container .person-card {
  margin-bottom: 0 !important;
}

@media (max-width: 768px) {
  .meetup-container {
    grid-template-columns: 1fr !important;
  }
}

/* Shrink delete button size */
.person-card .btn-outline-danger {
  padding: 0.35rem 0.4rem !important;
  font-size: 0.75rem !important;
  height: 32px !important;
  min-width: 32px !important;
  width: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.person-card .btn-outline-danger .material-icons {
  font-size: 18px !important;
  line-height: 1;
  margin: 0 !important;
}

/* Results card - styled like person-card but spans full width */
.meetup-results-card {
  grid-column: 1 / -1 !important; /* Span all columns */
  width: 100%;
}

.close-results-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: var(--color-muted);
  outline: none !important;
  box-shadow: none !important;
  flex-shrink: 0;
}

.close-results-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
  transform: rotate(90deg);
}

.close-results-btn:active {
  background: rgba(0, 0, 0, 0.1);
  outline: none !important;
  box-shadow: none !important;
}

.close-results-btn:focus {
  outline: none !important;
  box-shadow: none !important;
}

.close-results-btn .material-icons {
  font-size: 24px;
}

/* Station code badges */
.station-code-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.station-code-badge strong {
  font-weight: 700;
}

/* From Uiverse.io by PriyanshuGupta28 - Red Cancel Button */
.pushable {
  position: relative;
  background: transparent;
  padding: 0px;
  border: none;
  cursor: pointer;
  outline-offset: 4px;
  outline-color: deeppink;
  transition: filter 250ms;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.pushable .shadow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: hsl(0, 25%, 69%);
  border-radius: 8px;
  filter: blur(2px);
  will-change: transform;
  transform: translateY(2px);
  transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
}

.pushable .edge {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    hsl(0, 70%, 35%) 0%,
    hsl(0, 70%, 45%) 8%,
    hsl(0, 70%, 35%) 92%,
    hsl(0, 70%, 25%) 100%
  );
}

.pushable .front {
  display: block;
  position: relative;
  border-radius: 8px;
  background: hsl(0, 75%, 50%);
  padding: 16px 32px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 1rem;
  transform: translateY(-4px);
  transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
}

.pushable:hover {
  filter: brightness(110%);
}

.pushable:hover .front {
  transform: translateY(-6px);
  transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
}

.pushable:active .front {
  transform: translateY(-2px);
  transition: transform 34ms;
}

.pushable:hover .shadow {
  transform: translateY(4px);
  transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
}

.pushable:active .shadow {
  transform: translateY(1px);
  transition: transform 34ms;
}

.pushable:focus:not(:focus-visible) {
  outline: none;
}

/* Cancel button in same row as heading, takes 2/12 of width */
.pushable-cancel {
  flex: 0 0 16.666667% !important; /* 2/12 = 16.666667% */
  max-width: 16.666667% !important;
  flex-shrink: 0;
  min-width: 0; /* Allow content to shrink if needed */
}

.pushable-cancel .front {
  padding: 8px 12px !important;
  font-size: 0.7rem !important;
  letter-spacing: 0.5px !important;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
}

</style>
