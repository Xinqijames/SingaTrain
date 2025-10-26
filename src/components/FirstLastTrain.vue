<template>
  <section class="section-card">
    <h2 class="section-title mb-3">First & Last Train Timings</h2>
    <p class="text-muted">
      Reference departures for selected lines and directions. Integrate with the real LTA DataMall feed by replacing
      the static dataset in <code>src/data/trainTimings.js</code>.
    </p>

    <div class="row g-3 align-items-end">
      <div class="col-md-4">
        <label class="form-label" for="timingLine">Line</label>
        <select id="timingLine" v-model="selectedLine" class="form-select">
          <option v-for="line in lines" :key="line" :value="line">{{ line }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label" for="timingDirection">Direction</label>
        <select id="timingDirection" v-model="selectedDirection" class="form-select">
          <option v-for="direction in directions" :key="direction" :value="direction">
            {{ direction }}
          </option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label" for="timingSearch">Search station</label>
        <input
          id="timingSearch"
          v-model="searchTerm"
          type="search"
          class="form-control"
          placeholder="Start typing a station…"
        />
      </div>
    </div>

    <div class="border rounded-3 p-3 mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <strong>{{ selectedLine }} — {{ selectedDirection }}</strong>
        <span class="badge bg-secondary">{{ filteredTimings.length }} station(s)</span>
      </div>
      <div v-if="!filteredTimings.length" class="text-muted">No stations match your search.</div>
      <div v-for="station in filteredTimings" :key="station.code" class="d-flex justify-content-between py-2 border-top">
        <div>
          <div class="fw-semibold">{{ station.station }}</div>
          <div class="text-muted small">{{ station.code }}</div>
        </div>
        <div class="text-end">
          <div><strong>First</strong> {{ station.first }}</div>
          <div class="text-muted small"><strong>Last</strong> {{ station.last }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { TRAIN_TIMINGS } from '../data/trainTimings';

const lines = Object.keys(TRAIN_TIMINGS);
const selectedLine = ref(lines[0]);
const directions = computed(() => Object.keys(TRAIN_TIMINGS[selectedLine.value] || {}));
const selectedDirection = ref('');
const searchTerm = ref('');

watch(
  directions,
  (dirs) => {
    if (!dirs.includes(selectedDirection.value)) {
      selectedDirection.value = dirs[0] || '';
    }
  },
  { immediate: true }
);

const filteredTimings = computed(() => {
  const list = TRAIN_TIMINGS[selectedLine.value]?.[selectedDirection.value] || [];
  if (!searchTerm.value) return list;
  const term = searchTerm.value.toLowerCase();
  return list.filter((item) => item.station.toLowerCase().includes(term) || item.code.toLowerCase().includes(term));
});
</script>
