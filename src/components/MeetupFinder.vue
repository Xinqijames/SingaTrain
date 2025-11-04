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
      <!-- Person cards - only show when no result AND not hiding -->
      <template v-if="result === null && !isHiding">
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
          <div class="station-selector position-relative">
            <div class="input-container">
            <div class="input-with-badges">
            <div class="input-wrapper">
            <input
                ref="inputRef"
              :value="participant.searchInput || participant.station || ''"
              type="text"
                class="input"
                :class="{ 'has-badges': participant.station && !participant.searchInput }"
              :placeholder="!participant.station && !participant.searchInput ? '-- Select station --' : ''"
                autocomplete="off"
                @input="(e) => handleInput(participant, e)"
                @keydown="(e) => handleKeydown(participant, e)"
              @focus="handleFocus(participant)"
              @blur="handleBlur(participant)"
            />
              <span 
                v-if="participant.autocompleteSuggestion && participant.searchInput && participant.searchInput.length > 0 && participant.autocompleteSuggestion.toLowerCase().startsWith(participant.searchInput.toLowerCase())"
                class="input-autocomplete"
              >
                {{ participant.searchInput }}{{ participant.autocompleteSuggestion.substring(participant.searchInput.length) }}
              </span>
            </div>
              <div v-if="participant.station && !participant.searchInput" class="input-badges">
                <span
                  v-for="code in getStationCodes(participant.station)"
                  :key="code.code"
                  class="input-line-badge"
                  :style="{ 
                    backgroundColor: code.bgColor,
                    color: code.color,
                    borderColor: code.borderColor
                  }"
                >
                  <strong>{{ code.code }}</strong>
                </span>
              </div>
              <span 
                class="icon material-icons"
                :class="{ 'icon-active': participant.searchInput || participant.station }"
              >place</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Results card - styled like person-card, spans full width -->
      <!-- Show when result exists OR when hiding animation is in progress -->
      <Transition name="meetup-result" mode="out-in">
        <div v-if="result !== null || isHiding" :key="(result || hidingResult)?.station || 'hiding'" class="meetup-results-card person-card">
        <div class="mb-3 d-flex align-items-center gap-3">
          <h4 class="mb-0 d-flex align-items-center flex-wrap gap-2 flex-grow-1" style="color: var(--color-text);">
            <span class="material-icons me-2 text-danger">place</span>
            <span 
              class="meetup-station-name" 
              style="cursor: pointer; transition: color 0.2s ease;"
              @click="zoomToMeetupStation((result || hidingResult)?.station)"
            >
              <strong>Suggested meet-up: {{ (result || hidingResult)?.station || '' }}</strong>
            </span>
            <div class="d-flex align-items-center gap-2 ms-2">
              <span
                v-for="code in getStationCodes((result || hidingResult)?.station)"
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
            <div class="border rounded-3 p-3 h-100" style="background: var(--color-surface); border-color: var(--color-border) !important;">
              <p class="mb-2" style="color: var(--color-text);">
                <strong>Total travel time:</strong> {{ (result || hidingResult)?.totalMinutes || 0 }} minutes
              </p>
              <p class="mb-0" style="color: var(--color-text);">
                <strong>Average per person:</strong> {{ (result || hidingResult)?.averageMinutes?.toFixed(1) || '0.0' }} minutes
              </p>
            </div>
          </div>
          <div class="col-md-8">
            <div class="border rounded-3 p-3" style="border-color: var(--color-border) !important;">
              <h6 class="text-uppercase fw-semibold mb-2" style="color: var(--color-text);">Individual journeys</h6>
              <div
                v-for="detail in (result || hidingResult)?.details || []"
                :key="detail.origin"
                class="d-flex justify-content-between align-items-center border-bottom py-2"
                style="border-bottom-color: var(--color-border) !important;"
              >
                <div>
                  <div class="fw-semibold" style="color: var(--color-text);">{{ detail.origin }}</div>
                  <div class="small" style="color: var(--color-muted);">{{ detail.steps.length }} stops / {{ detail.segments.length }} segment(s) </div>
                </div>
                <span class="badge bg-warning text-dark fs-6 meetup-time-badge">{{ detail.minutes }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Transition>
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

// Helper function to get station colors (excluding LRT)
function getStationColors(stationName) {
  const stationCodes = STATION_CODES_BY_LINE[stationName];
  if (!stationCodes) return null;
  
  const lines = Object.keys(stationCodes).filter(line => line !== 'LRT Line');
  
  if (lines.length === 0) return null;
  if (lines.length === 1) {
    return { primary: LINE_COLOR_MAP[lines[0]], secondary: null };
  }
  
  // For stations with 2+ lines, use first two (excluding LRT)
  return {
    primary: LINE_COLOR_MAP[lines[0]],
    secondary: LINE_COLOR_MAP[lines[1]]
  };
}

const { allStations: stations, shortestPath, estimateTimeMinutes, summariseSegments } = useRoutePlanner();

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlZWF1biIsImEiOiJja2NydG83cWMwaGJsMnBqdjR5aHc3MzdlIn0.YGTZpi7JQMquEOv9E8K_bg';
const GEOJSON_URL = '/sg-rail.geojson';
const MAX_PARTICIPANTS = 10;

let idCounter = 0;
const participants = ref([
  { id: ++idCounter, station: '', searchInput: '', showDropdown: false, filteredStations: [], autocompleteSuggestion: '' },
  { id: ++idCounter, station: '', searchInput: '', showDropdown: false, filteredStations: [], autocompleteSuggestion: '' }
]);

const loading = ref(false);
const errorMessage = ref('');
const result = ref(null);
const isHiding = ref(false); // Track if brush animation is in progress
const hidingResult = ref(null); // Store result data during hiding animation
const mapContainer = ref(null);
const mapInstance = ref(null);
const mapLoaded = ref(false);
const mapLoadError = ref('');
const mapFeedback = ref('');
let feedbackTimeout = null;
const stationLookup = new Map();
const participantMarkers = new Map();
let meetupMarker = null;

// Track clicked station for animation
let clickedStationName = null;
let stationAnimationTimeout = null;
// Exit markers removed - no exit data storage needed

const mapLoading = computed(() => !mapLoaded.value && !mapLoadError.value);

function addParticipant() {
  if (participants.value.length >= MAX_PARTICIPANTS) {
    setMapFeedback(`Maximum of ${MAX_PARTICIPANTS} people reached.`);
    return false;
  }
  participants.value.push({ id: ++idCounter, station: '', searchInput: '', showDropdown: false, filteredStations: [], autocompleteSuggestion: '' });
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
  if (!stationName) return [];
  
  // Try exact match first
  let stationCodes = STATION_CODES_BY_LINE[stationName];
  
  // If not found, try case-insensitive match
  if (!stationCodes) {
    const normalizedName = stationName.trim();
    const matchingKey = Object.keys(STATION_CODES_BY_LINE).find(
      key => key.toLowerCase() === normalizedName.toLowerCase()
    );
    if (matchingKey) {
      stationCodes = STATION_CODES_BY_LINE[matchingKey];
    }
  }
  
  if (!stationCodes) {
    console.warn(`Station "${stationName}" not found in STATION_CODES_BY_LINE`);
    return [];
  }
  
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

function getStationDisplayText(stationName) {
  if (!stationName) return '';
  const codes = getStationCodes(stationName);
  const codeList = codes.map(c => c.code).join(', ');
  return codeList ? `${stationName} (${codeList})` : stationName;
}

function clearResults() {
  // Store result data before clearing for animation
  if (result.value) {
    hidingResult.value = { ...result.value };
  }
  
  // Start hiding animation FIRST to prevent person cards from showing
  isHiding.value = true;
  
  // Clear result - person cards won't show because isHiding is true
  result.value = null;
  errorMessage.value = '';
  
  // Reset map colors to original
  resetMapColors();
  
  // Reset map view to flat (2D) mode so users can easily click stations again
  resetMapView();
  
  // Wait for brush animation to complete (0.8s) before showing person cards
  setTimeout(() => {
    isHiding.value = false;
    hidingResult.value = null;
    updateMeetupMarker();
  }, 800); // Match animation duration
}

function filterStations(participant) {
  const searchTerm = participant.searchInput ? participant.searchInput.toLowerCase().trim() : '';
  if (!searchTerm) {
    // No search term, hide dropdown
    participant.filteredStations = [];
    participant.showDropdown = false;
    participant.autocompleteSuggestion = '';
    return;
  }
  
  // Filter stations based on search term
  participant.filteredStations = stations.filter(station =>
    station.toLowerCase().includes(searchTerm)
  ).slice(0, 20); // Limit to 20 results
  
  // Set first match as autocomplete suggestion
  participant.autocompleteSuggestion = participant.filteredStations.length > 0 
    ? participant.filteredStations[0] 
    : '';
  
  // Dropdown removed - only using autocomplete
  participant.showDropdown = false;
}

function handleInput(participant, event) {
  const inputValue = event.target.value;
  
  // Update search input with what user typed
  participant.searchInput = inputValue;
  
  // Clear station when typing
  if (participant.searchInput) {
    participant.station = '';
  }
  
  filterStations(participant);
}

function handleKeydown(participant, event) {
  // If Tab or Enter is pressed, accept the autocomplete
  if (event.key === 'Tab' || event.key === 'Enter') {
    if (participant.autocompleteSuggestion) {
      event.preventDefault();
      participant.searchInput = participant.autocompleteSuggestion;
      selectStation(participant, participant.autocompleteSuggestion);
    }
  }
  // If Escape, clear autocomplete
  else if (event.key === 'Escape') {
    participant.autocompleteSuggestion = '';
  }
}

function handleFocus(participant) {
  // Clear search input on focus if there's already a selected station
  // This allows user to start fresh when clicking on input
  if (participant.station && !participant.searchInput) {
    participant.searchInput = '';
    participant.filteredStations = [];
    participant.autocompleteSuggestion = '';
  } else if (participant.searchInput) {
    // If there's already text, update autocomplete
    filterStations(participant);
  }
}

function selectStation(participant, station) {
  participant.station = station;
  participant.searchInput = '';
  participant.showDropdown = false;
  participant.filteredStations = [];
  participant.autocompleteSuggestion = '';
}

function handleBlur(participant) {
  // Clear search input and autocomplete on blur
  setTimeout(() => {
    participant.searchInput = '';
    participant.autocompleteSuggestion = '';
    participant.filteredStations = [];
  }, 200);
}

function reset() {
  // Clear everything including participants
  participants.value = [
    { id: ++idCounter, station: '', searchInput: '', showDropdown: false, filteredStations: [], autocompleteSuggestion: '' },
    { id: ++idCounter, station: '', searchInput: '', showDropdown: false, filteredStations: [], autocompleteSuggestion: '' }
  ];
  result.value = null;
  errorMessage.value = '';
  updateParticipantMarkers();
  updateMeetupMarker();
  resetMapView(); // Reset map to initial view
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
  
  // Zoom to meetup station when results appear and highlight it
  nextTick(() => {
    highlightMeetupStation(bestStation);
    zoomToMeetupStation(bestStation);
    updateMeetupMarker();
  });
  
  setMapFeedback(`Suggested meeting point: ${bestStation}`);
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

function animateStationClick(stationName) {
  if (!mapInstance.value || !mapLoaded.value || !stationName) return;
  
  // Clear any existing animation
  if (stationAnimationTimeout) {
    clearTimeout(stationAnimationTimeout);
    resetStationAnimation();
  }
  
  clickedStationName = stationName.trim().toLowerCase().replace(/\s+/g, ' ');
  
  if (!mapInstance.value.getLayer('singatrain-stations')) return;
  
  // First expand, then jello animation sequence
  const animationSteps = [
    { time: 0, radius: 6, strokeWidth: 2 },      // 0% - start normal
    { time: 50, radius: 18, strokeWidth: 5 },     // Initial expansion (quick)
    { time: 140, radius: 20, strokeWidth: 5 },    // 30% - scale3d(1.25, 0.75, 1) - wider from expanded
    { time: 170, radius: 15, strokeWidth: 5 },    // 40% - scale3d(0.75, 1.25, 1) - taller from expanded
    { time: 200, radius: 19, strokeWidth: 5 },    // 50% - scale3d(1.15, 0.85, 1) - wider from expanded
    { time: 245, radius: 17, strokeWidth: 5 },    // 65% - scale3d(0.95, 1.05, 1) - taller from expanded
    { time: 275, radius: 18, strokeWidth: 5 },    // 75% - scale3d(1.05, 0.95, 1) - wider from expanded
    { time: 350, radius: 6, strokeWidth: 2 }      // 100% - scale3d(1, 1, 1) - reset to normal
  ];
  
  let currentStep = 0;
  
  const animateStep = () => {
    if (currentStep >= animationSteps.length) {
      resetStationAnimation();
      return;
    }
    
    const step = animationSteps[currentStep];
    
    // Update radius with jello effect
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-radius', [
      'case',
      ['==', ['get', 'name_lower'], clickedStationName],
      step.radius,
      6   // Normal size for others
    ]);
    
    // Update stroke width for glow effect during animation
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-width', [
      'case',
      ['==', ['get', 'name_lower'], clickedStationName],
      step.strokeWidth,
      2  // Normal stroke
    ]);
    
    // Make stroke white/bright for glow effect
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-color', [
      'case',
      ['==', ['get', 'name_lower'], clickedStationName],
      '#ffffff', // White glow
      [
        'coalesce',
        ['get', 'secondary_color'],
        '#fff'
      ]
    ]);
    
    currentStep++;
    
    if (currentStep < animationSteps.length) {
      const nextStep = animationSteps[currentStep];
      const delay = nextStep.time - step.time;
      setTimeout(animateStep, delay);
    } else {
      // Final reset
      stationAnimationTimeout = setTimeout(() => {
        resetStationAnimation();
      }, 50);
    }
  };
  
  // Start animation
  animateStep();
}

function resetStationAnimation() {
  if (!mapInstance.value || !mapLoaded.value) return;
  
  clickedStationName = null;
  
  // If there's a meetup station highlighted, preserve that state
  const meetupStation = result.value?.station;
  
  if (mapInstance.value.getLayer('singatrain-stations')) {
    if (meetupStation) {
      // Restore meetup station highlighting
      highlightMeetupStation(meetupStation);
    } else {
      // Reset to normal size for all stations
      mapInstance.value.setPaintProperty('singatrain-stations', 'circle-radius', 6);
      
      // Reset stroke width
      mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-width', 2);
      
      // Reset stroke color
      mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-color', [
        'coalesce',
        ['get', 'secondary_color'],
        '#fff'
      ]);
      
      // Reset opacity
      mapInstance.value.setPaintProperty('singatrain-stations', 'circle-opacity', 1);
    }
  }
}

function handleMapStationSelection(stationName, event) {
  if (!stationName) return;
  
  // Prevent assigning the meetup station when results are shown
  if (result.value && result.value.station === stationName) {
    setMapFeedback('Cannot assign the suggested meet-up station. Click Cancel to modify participants.');
    return;
  }
  
  // Animate the station click
  animateStationClick(stationName);
  
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
  
  // Highlight meetup station and grey out the rest
  highlightMeetupStation(stationName);
  zoomToMeetupStation(stationName);
}

function highlightMeetupStation(meetupStationName) {
  if (!mapInstance.value || !mapLoaded.value || !meetupStationName) return;
  
  // Normalize station name (trim and normalize whitespace)
  const meetupStationNameLower = meetupStationName.trim().toLowerCase().replace(/\s+/g, ' ');
  
  console.log('Highlighting meetup station:', meetupStationName, 'normalized:', meetupStationNameLower);
  
  // Update stations layer - grey out all except meetup station
  if (mapInstance.value.getLayer('singatrain-stations')) {
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-color', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      [
        'coalesce',
        ['get', 'primary_color'],
        [
          'match',
          ['get', 'station_colors'],
          'red', '#d42e12',
          'green', '#009645',
          'orange', '#fa9e0d',
          'brown', '#9D5B25',
          'purple', '#9900aa',
          'blue', '#005ec4',
          '#748477'
        ]
      ],
      '#9ca3af' // Grey color for all other stations
    ]);
    
    // Make meetup station larger and more prominent
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-radius', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      10, // Larger for meetup station
      6   // Normal size for others
    ]);
    
    // Make meetup station stroke more prominent
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-width', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      4,
      2
    ]);
    
    // Make meetup station stroke color more prominent
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-color', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      [
        'coalesce',
        ['get', 'secondary_color'],
        '#fff'
      ],
      '#9ca3af' // Grey stroke for other stations
    ]);
  }
  
  // Update labels - grey out all except meetup station
  if (mapInstance.value.getLayer('singatrain-labels')) {
    mapInstance.value.setPaintProperty('singatrain-labels', 'text-color', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      '#2f3640', // Dark color for meetup station label
      '#9ca3af'  // Grey for other labels
    ]);
    
    // Make meetup station label more prominent
    mapInstance.value.setLayoutProperty('singatrain-labels', 'text-size', [
      'case',
      ['==', ['get', 'name_lower'], meetupStationNameLower],
      14,
      12
    ]);
  }
  
  // Grey out all lines
  if (mapInstance.value.getLayer('singatrain-lines')) {
    mapInstance.value.setPaintProperty('singatrain-lines', 'line-color', '#9ca3af');
    mapInstance.value.setPaintProperty('singatrain-lines', 'line-opacity', 0.4);
  }
}

function resetMapColors() {
  if (!mapInstance.value || !mapLoaded.value) return;
  
  // Reset stations to original colors
  if (mapInstance.value.getLayer('singatrain-stations')) {
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-color', [
      'coalesce',
      ['get', 'primary_color'],
      [
        'match',
        ['get', 'station_colors'],
        'red', '#d42e12',
        'green', '#009645',
        'orange', '#fa9e0d',
        'brown', '#9D5B25',
        'purple', '#9900aa',
        'blue', '#005ec4',
        '#748477'
      ]
    ]);
    
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-radius', 6);
    
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-width', [
      'case',
      ['has', 'secondary_color'],
      3,
      2
    ]);
    
    mapInstance.value.setPaintProperty('singatrain-stations', 'circle-stroke-color', [
      'coalesce',
      ['get', 'secondary_color'],
      '#fff'
    ]);
  }
  
  // Reset labels to original colors
  if (mapInstance.value.getLayer('singatrain-labels')) {
    mapInstance.value.setPaintProperty('singatrain-labels', 'text-color', '#2f3640');
    mapInstance.value.setLayoutProperty('singatrain-labels', 'text-size', 12);
  }
  
  // Reset lines to original colors
  if (mapInstance.value.getLayer('singatrain-lines')) {
    mapInstance.value.setPaintProperty('singatrain-lines', 'line-color', [
      'match',
      ['get', 'line_color'],
      'orangered', '#d42e12',
      'mediumseagreen', '#009645',
      'orange', '#fa9e0d',
      'saddlebrown', '#9D5B25',
      'darkmagenta', '#9900aa',
      'darkslateblue', '#005ec4',
      '#748477'
    ]);
    mapInstance.value.setPaintProperty('singatrain-lines', 'line-opacity', 0.8);
  }
}

function zoomToMeetupStation(stationName) {
  if (!mapInstance.value || !mapLoaded.value || !stationName) return;
  const feature = stationLookup.get(stationName.toLowerCase());
  if (!feature) return;
  
  // Get station codes for filtering nearby exits
  const stationCodes = getStationCodes(stationName).map(c => c.code);
  console.log('Zooming to station:', stationName, 'with codes:', stationCodes);
  
  // Use flyTo with 3D effect
  mapInstance.value.flyTo({
    center: feature.geometry.coordinates,
    zoom: 17.5, // Increased zoom for 3D view to see exits clearly
    pitch: 60, // 3D tilt effect (0-60 degrees)
    bearing: 0, // Rotation angle (0 = north up)
    essential: true,
    speed: 1.2 // Slightly faster for smoother animation
  });
  
  // Exit markers removed - no exit markers will be shown on the map
}

function resetMapView() {
  if (!mapInstance.value || !mapLoaded.value) return;
  mapInstance.value.flyTo({
    center: [103.8475, 1.3011], // Initial center
    zoom: 11, // Initial zoom
    pitch: 0, // Reset pitch to flat view
    bearing: 0, // Reset rotation
    essential: true,
    speed: 0.8
  });
  // Reset map colors when resetting view
  resetMapColors();
}

async function initMap() {
  if (mapInstance.value || !mapContainer.value) return;
  mapboxgl.accessToken = MAPBOX_TOKEN;

  mapInstance.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [103.8475, 1.3011],
    zoom: 11,
    pitch: 0, // Start with no pitch
    bearing: 0, // Start with no rotation
    renderWorldCopies: false,
    pitchWithRotate: true, // Enable 3D rotation and pitch
    attributionControl: false,
    cooperativeGestures: true
  });

  mapInstance.value.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

  // Remove cooperative gestures tooltip
  const removeTooltip = () => {
    const tooltip = mapContainer.value?.querySelector('.mapboxgl-ctrl-cooperative-gesture-hint');
    if (tooltip) {
      tooltip.remove();
    }
  };
  
  // Remove tooltip immediately and on load
  removeTooltip();
  setTimeout(removeTooltip, 100);
  setTimeout(removeTooltip, 500);
  
  // Continuously watch for and remove tooltip if it reappears
  const observer = new MutationObserver(() => {
    removeTooltip();
  });
  
  if (mapContainer.value) {
    observer.observe(mapContainer.value, {
      childList: true,
      subtree: true
    });
  }

  mapInstance.value.on('load', async () => {
    try {
      const response = await fetch(GEOJSON_URL);
      if (!response.ok) {
        throw new Error(`Unable to load map data (HTTP ${response.status})`);
      }
      const data = await response.json();
      
      // Process stations to add color properties for multi-line stations
      data.features
        .filter((feature) => feature.geometry?.type === 'Point' && feature.properties?.stop_type === 'station')
        .forEach((feature) => {
          const stationName = feature.properties.name;
          const colors = getStationColors(stationName);
          
          if (colors) {
            feature.properties.primary_color = colors.primary;
            if (colors.secondary) {
              feature.properties.secondary_color = colors.secondary;
            }
          }
          
          // Add lowercase name for filtering (normalize whitespace)
          const normalizedName = stationName.trim().toLowerCase().replace(/\s+/g, ' ');
          feature.properties.name_lower = normalizedName;
          
          stationLookup.set(normalizedName, feature);
        });
      
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
            'coalesce',
            ['get', 'primary_color'],
            [
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
            ]
          ],
          'circle-stroke-color': [
            'coalesce',
            ['get', 'secondary_color'],
            '#fff'
          ],
          'circle-stroke-width': [
            'case',
            ['has', 'secondary_color'],
            3,
            2
          ]
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

      // Exit markers removed - no exit markers will be shown on the map


      mapInstance.value.on('mouseenter', 'singatrain-stations', () => {
        mapInstance.value && (mapInstance.value.getCanvas().style.cursor = 'pointer');
      });
      mapInstance.value.on('mouseleave', 'singatrain-stations', () => {
        mapInstance.value && (mapInstance.value.getCanvas().style.cursor = '');
      });
      mapInstance.value.on('click', 'singatrain-stations', (event) => {
        const feature = event.features?.[0];
        const stationName = feature?.properties?.name;
        handleMapStationSelection(stationName, event);
      });

      // Double-click handler for 3D mode toggle
      let lastClickTime = 0;
      let lastClickLngLat = null;
      const DOUBLE_CLICK_DELAY = 400; // milliseconds
      const DOUBLE_CLICK_DISTANCE_THRESHOLD = 0.0001; // degrees (roughly 10 meters)

      mapInstance.value.on('click', (event) => {
        // Don't process double-click if clicking on a station (let station selection handle it)
        const clickedFeatures = mapInstance.value.queryRenderedFeatures(event.point, {
          layers: ['singatrain-stations']
        });
        if (clickedFeatures.length > 0) {
          // Reset double-click tracking when clicking on station
          lastClickTime = 0;
          lastClickLngLat = null;
          return;
        }
        
        const currentTime = Date.now();
        const currentLngLat = event.lngLat;
        
        // Check if this is a double click (within time and distance threshold)
        const isDoubleClick = 
          (currentTime - lastClickTime) < DOUBLE_CLICK_DELAY &&
          lastClickLngLat &&
          Math.abs(currentLngLat.lng - lastClickLngLat.lng) < DOUBLE_CLICK_DISTANCE_THRESHOLD &&
          Math.abs(currentLngLat.lat - lastClickLngLat.lat) < DOUBLE_CLICK_DISTANCE_THRESHOLD;
        
        if (isDoubleClick) {
          const currentPitch = mapInstance.value.getPitch();
          
          // If in 3D mode (pitch > 0), exit to flat view
          if (currentPitch > 0) {
            resetMapView();
          } 
          // If in flat view and meetup is suggested, go to 3D view
          else if (result.value?.station) {
            zoomToMeetupStation(result.value.station);
          }
          
          // Reset double-click tracking
          lastClickTime = 0;
          lastClickLngLat = null;
        } else {
          // Store this click for potential double-click detection
          lastClickTime = currentTime;
          lastClickLngLat = currentLngLat;
        }
      });

      // Exit hover interactions removed - no exit markers on map

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.meetup-actions .custom-btn .material-icons {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
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
  /* Prevent layout shifts during transitions */
  position: relative;
}

/* Ensure transition wrapper maintains grid position */
.meetup-container > .meetup-result-enter-active,
.meetup-container > .meetup-result-leave-active {
  grid-column: 1 / -1 !important;
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
  position: relative;
  overflow: hidden;
  z-index: 10;
  /* Prevent layout shifts during animation */
  will-change: clip-path, opacity;
  /* Maintain position during transitions */
  transform: translateZ(0);
}

/* Brush effect and fade animations */
.meetup-result-enter-active {
  animation: brushReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.meetup-result-leave-active {
  animation: brushHide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Ensure all transition states stay in place */
.meetup-result-enter-active,
.meetup-result-enter-from,
.meetup-result-enter-to,
.meetup-result-leave-active,
.meetup-result-leave-from,
.meetup-result-leave-to {
  /* Keep element in its grid position */
  grid-column: 1 / -1 !important;
  width: 100%;
  position: relative;
  overflow: hidden;
  /* Prevent layout shifts */
  transform: translateZ(0);
  will-change: clip-path, opacity;
}

.meetup-result-enter-from {
  opacity: 0;
}

.meetup-result-leave-to {
  opacity: 0;
}

@keyframes brushReveal {
  0% {
    opacity: 0;
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

@keyframes brushHide {
  0% {
    opacity: 1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
  }
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

.pushable-cancel:hover .front {
  transform: translateY(-10px) !important;
  transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5) !important;
}

.pushable-cancel:hover .shadow {
  transform: translateY(6px) !important;
  transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5) !important;
}

.pushable-cancel:hover {
  filter: brightness(115%) !important;
}

/* Searchable station dropdown */
.station-selector {
  position: relative;
}

.station-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 2px;
  color: var(--color-text);
}

.station-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.station-option:last-child {
  border-bottom: none;
}

.station-option:hover {
  background-color: var(--color-border);
  opacity: 0.5;
}

.station-option:active {
  background-color: var(--color-border);
  opacity: 0.7;
}

body.dark-mode .station-option:hover {
  background-color: rgba(255, 255, 255, 0.08);
  opacity: 1;
}

body.dark-mode .station-option:active {
  background-color: rgba(255, 255, 255, 0.12);
  opacity: 1;
}

/* Input container design - From Uiverse.io by boryanakrasteva (modified) */
.station-selector .input-container {
  width: 100%;
  position: relative;
}

.station-selector .input-with-badges {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-selector .input-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
}

.station-selector .input-autocomplete {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-muted);
  opacity: 0.5;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: nowrap;
  overflow: hidden;
  max-width: calc(100% - 55px);
}

.station-selector .icon {
  position: absolute;
  right: 10px;
  top: calc(50% - 6px);
  transform: translateY(-50%);
  color: var(--color-text);
  pointer-events: none;
  transition: color 0.2s ease;
  font-size: 20px;
  z-index: 2;
  line-height: 1;
}

.station-selector .icon.icon-active {
  color: #f97316;
}

body.dark-mode .station-selector .icon.icon-active {
  color: #f97316;
}

.station-selector .input {
  flex: 1;
  height: 40px;
  padding: 10px;
  padding-right: 45px; /* Space for icon */
  transition: 0.2s linear;
  border: 1.5px solid black;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 4px;
  cursor: text;
  line-height: 20px;
  display: flex;
  align-items: center;
  /* Remove browser autocomplete dropdown arrow */
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.station-selector .input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

.station-selector .input::-ms-clear {
  display: none;
}

.station-selector .input.has-badges {
  padding-right: 100px; /* Extra space for badges + icon (increased for text badges) */
}

.station-selector .input-badges {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  position: absolute;
  right: 45px;
  top: calc(50% - 6px);
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
  line-height: 1;
}

.station-selector .input-line-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 32px;
  height: 22px;
  line-height: 1;
  vertical-align: middle;
}

.station-selector .input-line-badge strong {
  font-weight: 700;
  line-height: 1;
  display: inline-block;
}

.station-selector .input::placeholder {
  text-transform: none;
  letter-spacing: normal;
  color: var(--color-muted);
  opacity: 0.7;
}

.station-selector .input:focus {
  outline: none;
  border: 0.5px solid black;
  box-shadow: -5px -5px 0px #f97316;
}

.station-selector .input-container:hover > .icon {
  animation: iconAnim 1s linear infinite;
  color: #f97316;
}

.station-codes-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.station-codes-badges .station-code-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

@keyframes iconAnim {
  0%,
  100% {
    transform: translateY(calc(-50% - 0px)) scale(1);
  }
  50% {
    transform: translateY(calc(-50% - 0px)) scale(1.1);
  }
}

/* Dark mode adjustments for MeetupFinder */
body.dark-mode .meetup-container {
  background: var(--color-bg) !important;
  border-color: var(--color-border) !important;
}

body.dark-mode .meetup-container::before {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%);
}

body.dark-mode .person-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

body.dark-mode .person-card.active {
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(249, 115, 22, 0.12) 100%);
  border-color: var(--color-primary);
}

body.dark-mode .person-info h6 {
  color: var(--color-text) !important;
}

body.dark-mode .person-info small {
  color: var(--color-muted) !important;
}

/* Ensure all text in person cards is visible */
body.dark-mode .person-card h6 {
  color: var(--color-text) !important;
}

body.dark-mode .person-card small {
  color: var(--color-muted) !important;
}

body.dark-mode .person-card .person-info h6 {
  color: var(--color-text) !important;
}

body.dark-mode .person-card .person-info small {
  color: var(--color-muted) !important;
}

/* Dark mode input styling */
body.dark-mode .station-selector .input {
  border-color: white;
  background: var(--color-surface);
  color: var(--color-text);
}

body.dark-mode .station-selector .input:focus {
  border: 0.5px solid white;
  box-shadow: -5px -5px 0px #f97316;
}

body.dark-mode .station-selector .icon {
  color: var(--color-text);
}

body.dark-mode .station-selector .input-container:hover > .icon {
  color: #f97316;
}

body.dark-mode .meetup-results-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

body.dark-mode .meetup-results-card .border {
  border-color: var(--color-border) !important;
}

body.dark-mode .map-loading-overlay {
  background: rgba(15, 17, 21, 0.95);
}

body.dark-mode .map-loading-content {
  color: var(--color-text);
}

body.dark-mode .map-loading-content h6 {
  color: var(--color-text);
}

body.dark-mode .map-loading-content p {
  color: var(--color-muted);
}

body.dark-mode .map-overlay-message {
  background: rgba(21, 24, 33, 0.95);
  color: var(--color-text);
  border-color: var(--color-border);
}

/* Hide Mapbox cooperative gestures tooltip */
.mapboxgl-ctrl-cooperative-gesture-hint {
  display: none !important;
}

.map-wrapper {
  position: relative;
}

body.dark-mode .map-wrapper {
  background: var(--color-surface);
  border-color: var(--color-border);
}

body.dark-mode .map-panel h5 {
  color: var(--color-text);
}

body.dark-mode .map-panel .small {
  color: var(--color-muted);
}

/* Time badge styling - works in both light and dark mode */
.meetup-time-badge {
  background-color: #f59e0b !important;
  color: #1f2937 !important;
  border: none !important;
}

body.dark-mode .meetup-time-badge {
  background-color: #f59e0b !important;
  color: #ffffff !important;
}

/* Ensure person cards use proper text colors */
.person-card {
  color: var(--color-text);
}

.person-card .fw-semibold {
  color: var(--color-text);
}

body.dark-mode .person-card .fw-semibold {
  color: var(--color-text);
}

/* Alert message styling */
body.dark-mode .alert {
  background-color: rgba(21, 24, 33, 0.95);
  border-color: var(--color-border);
  color: var(--color-text);
}

body.dark-mode .alert-danger {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

body.dark-mode .alert-warning {
  background-color: rgba(251, 146, 60, 0.15);
  border-color: rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

/* Clickable meetup station name styling */
.meetup-station-name {
  cursor: pointer;
  transition: color 0.2s ease;
}

.meetup-station-name:hover {
  color: var(--color-primary) !important;
}

.meetup-station-name strong {
  color: inherit;
}

</style>
