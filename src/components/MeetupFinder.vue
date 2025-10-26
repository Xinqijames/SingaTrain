<template>
  <section class="section-card">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h2 class="section-title mb-2">Meet-up Point Finder</h2>
        <p class="text-muted mb-0">
          Enter origin stations for your group and we’ll suggest the fairest MRT interchange, minimising total travel
          time for everyone.
        </p>
      </div>
      <button class="btn btn-outline-danger hover-float" type="button" @click="addParticipant">
        <span class="material-icons me-1">person_add</span>
        Add person
      </button>
    </div>

    <div class="meetup-container">
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
            v-if="participants.length > 1"
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

      <div class="meetup-actions">
        <button class="btn btn-primary hover-float" type="button" @click="findMeetup">
          <span class="material-icons">travel_explore</span>
          Find optimal meet-up
        </button>
        <button class="btn btn-outline-danger hover-float" type="button" @click="reset">
          <span class="material-icons">restart_alt</span>
          Clear
        </button>
      </div>
    </div>

    <div class="mt-4">
      <div class="text-muted mb-2">Quick add</div>
      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="station in quickStations"
          :key="station"
          class="btn btn-sm btn-outline-secondary quick-station-btn"
          type="button"
          @click="assignNextEmpty(station)"
        >
          {{ station }}
        </button>
      </div>
    </div>

    <div class="map-panel mt-5">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div class="d-flex align-items-center gap-2">
          <span class="material-icons text-danger">map</span>
          <h5 class="mb-0">Interactive MRT Network</h5>
        </div>
        <div class="text-muted small">Click a station to assign or remove it for the next available person.</div>
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
      <p class="mt-3 text-muted">Crunching routes…</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>

    <div v-if="result" class="meetup-results mt-4 feature-result-animate">
      <h4 class="mb-3">
        <span class="material-icons align-middle me-2 text-danger">place</span>
        Suggested meet-up: {{ result.station }}
      </h4>
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
            <h6 class="text-uppercase text-muted fw-semibold mb-2">Individual journeys</h6>
            <div
              v-for="detail in result.details"
              :key="detail.origin"
              class="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <div>
                <div class="fw-semibold">{{ detail.origin }}</div>
                <div class="text-muted small">{{ detail.steps.length }} stops / {{ detail.segments.length }} segment(s) </div>
              </div>
              <span class="badge bg-warning text-dark fs-6">{{ detail.minutes }} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import { useRoutePlanner } from '../composables/useRoutePlanner';

const { allStations: stations, shortestPath, estimateTimeMinutes, summariseSegments } = useRoutePlanner();

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlZWF1biIsImEiOiJja2NydG83cWMwaGJsMnBqdjR5aHc3MzdlIn0.YGTZpi7JQMquEOv9E8K_bg';
const GEOJSON_URL = '/sg-rail.geojson';
const MAX_PARTICIPANTS = 10;

let idCounter = 0;
const participants = ref([
  { id: ++idCounter, station: '' },
  { id: ++idCounter, station: '' }
]);

const quickStations = ['Bishan', 'Dhoby Ghaut', 'Jurong East', 'Paya Lebar', 'City Hall', 'HarbourFront'];
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
  participants.value = participants.value.filter((p) => p.id !== id);
  updateParticipantMarkers();
}

function reset() {
  participants.value = [
    { id: ++idCounter, station: '' },
    { id: ++idCounter, station: '' }
  ];
  result.value = null;
  errorMessage.value = '';
  updateParticipantMarkers();
  updateMeetupMarker();
}

function assignNextEmpty(station) {
  const empty = participants.value.find((p) => !p.station);
  if (empty) {
    empty.station = station;
    setMapFeedback(`${station} assigned to Person ${participants.value.indexOf(empty) + 1}.`);
  } else {
    const added = addParticipant();
    if (!added) return;
    const last = participants.value[participants.value.length - 1];
    last.station = station;
    setMapFeedback(`${station} assigned to new Person ${participants.value.length}.`);
  }
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
  let bestTotalWeight = Infinity;
  let bestDetails = null;

  stations.forEach((candidate) => {
    let totalWeight = 0;
    const detailRows = [];

    for (const origin of selectedStations) {
      if (origin === candidate) continue;
      const path = shortestPath(origin, candidate);
      if (!path) {
        totalWeight = Infinity;
        break;
      }
      totalWeight += path.totalWeight;
      detailRows.push({
        origin,
        path,
        minutes: estimateTimeMinutes(path.totalWeight),
        segments: summariseSegments(path),
        steps: path.steps
      });
    }

    if (totalWeight < bestTotalWeight) {
      bestTotalWeight = totalWeight;
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
  result.value = {
    station: bestStation,
    totalMinutes,
    averageMinutes: totalMinutes / bestDetails.length,
    details: bestDetails
  };

  loading.value = false;
  updateMeetupMarker();
  setMapFeedback(`Suggested meeting point: ${bestStation}`);
}

function getAvatarEmoji(personNumber) {
  const cars = ['🚇', '🚉', '🚝', '🚆', '🚈', '🚊', '🚃', '🚋', '🚟', '🚄'];
  return cars[(personNumber - 1) % cars.length];
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
  if (!mapInstance.value || !mapLoaded.value) return;
  participantMarkers.forEach((marker) => marker.remove());
  participantMarkers.clear();

  participants.value.forEach((participant, index) => {
    if (!participant.station) return;
    const feature = stationLookup.get(participant.station.toLowerCase());
    if (!feature) return;
    const el = document.createElement('div');
    el.className = 'avatar-marker';
    el.textContent = getAvatarEmoji(index + 1);
    const marker = new mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .addTo(mapInstance.value);
    participantMarkers.set(participant.id, marker);
  });
}

function updateMeetupMarker() {
  if (!mapInstance.value || !mapLoaded.value) return;
  if (meetupMarker) {
    meetupMarker.remove();
    meetupMarker = null;
  }
  const stationName = result.value?.station;
  if (!stationName) return;
  const feature = stationLookup.get(stationName.toLowerCase());
  if (!feature) return;
  const el = document.createElement('div');
  el.className = 'meetup-marker';
  el.innerHTML = '<span class="material-icons">place</span>';
  meetupMarker = new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(mapInstance.value);
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
