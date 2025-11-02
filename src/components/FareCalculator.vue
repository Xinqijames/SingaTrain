<template>
  <section class="section-card">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="section-title mb-1">Fare Calculator</h2>
        <p class="tab-desc">
          Distance-based fares with the latest LTA tables. Estimate concession pricing, understand line changes, and see
          whether a monthly pass could save you more.
        </p>
      </div>
    </div>

    <form class="fare-form" @submit.prevent="calculate">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <VSelect
            v-model="startStation"
            :items="stations"
            label="From station"
            prepend-inner-icon="mdi-map-marker"
            variant="solo-filled"
            density="comfortable"
            color="primary"
            hide-details="auto"
            class="fare-field"
          />
        </div>
        <div class="col-md-4">
          <VSelect
            v-model="endStation"
            :items="stations"
            label="To station"
            prepend-inner-icon="mdi-flag"
            variant="solo-filled"
            density="comfortable"
            color="primary"
            hide-details="auto"
            class="fare-field"
          />
        </div>
        <div class="col-md-4">
          <VSelect
            v-model="commuterType"
            :items="commuterTypes"
            item-title="label"
            item-value="value"
            label="Commuter type"
            prepend-inner-icon="mdi-account-group-outline"
            variant="solo-filled"
            density="comfortable"
            color="primary"
            hide-details="auto"
            class="fare-field"
          />
        </div>
        <div class="col-12">
          <div class="fare-actions">
            <VBtn
              type="submit"
              color="primary"
              prepend-icon="mdi-cash-multiple"
              class="fare-action-btn"
              elevation="2"
            >
              {{ fareResult ? 'Recalculate' : 'Calculate fare' }}
            </VBtn>
            <VBtn
              type="button"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-swap-horizontal"
              class="fare-action-btn"
              @click="swapStations"
            >
              Swap stations
            </VBtn>
            <VBtn
              type="button"
              variant="text"
              color="error"
              prepend-icon="mdi-restart"
              class="fare-action-btn"
              @click="reset"
            >
              Reset
            </VBtn>
            <VChip
              v-if="needsRecalculate"
              color="warning"
              variant="flat"
              size="small"
              prepend-icon="mdi-information-outline"
              class="ms-auto"
            >
              Inputs changed — calculate again to refresh.
            </VChip>
          </div>
        </div>
      </div>
    </form>

    <VSlideYTransition mode="out-in">
      <div v-if="fareResult" class="mt-4 feature-result-animate">
        <div class="row g-3">
          <div class="col-lg-4">
            <VCard class="fare-result-card h-100" elevation="4">
              <div class="fare-result-amount">{{ formatCurrency(fareResult.fare) }}</div>
              <div class="fare-result-commuter">{{ selectedCommuterLabel }}</div>
              <div class="fare-result-route text-muted">{{ startStation }} → {{ endStation }}</div>
              <div class="fare-stat-chip-group">
                <VChip variant="tonal" color="primary" prepend-icon="mdi-map-marker-distance">
                  {{ Number(fareResult.distanceKm).toFixed(1) }} km
                </VChip>
                <VChip variant="tonal" color="primary" prepend-icon="mdi-timer-sand">
                  {{ Math.round(fareResult.minutes) }} mins
                </VChip>
                <VChip variant="tonal" color="primary" prepend-icon="mdi-transit-connection">
                  {{ fareResult.totalStops }} {{ fareResult.totalStops === 1 ? 'stop' : 'stops' }}
                </VChip>
                <VChip variant="outlined" color="primary" prepend-icon="mdi-transfer">
                  {{ fareResult.transfers }} {{ fareResult.transfers === 1 ? 'transfer' : 'transfers' }}
                </VChip>
              </div>
            </VCard>
          </div>
          <div class="col-lg-8">
            <VCard class="fare-route-card h-100" elevation="4">
              <div class="fare-route-header">
                <div>
                  <h5 class="text-dark mb-1">Route overview</h5>
                  <p class="text-muted mb-0 small">
                    We recommend the quickest MRT path. Look out for timeline dots to spot transfers at a glance.
                  </p>
                </div>
                <VChip variant="tonal" color="primary" size="small">
                  {{ fareResult.segments.length }} {{ fareResult.segments.length === 1 ? 'segment' : 'segments' }}
                </VChip>
              </div>

              <div class="fare-route-timeline">
                <div
                  v-for="segment in fareResult.segments"
                  :key="`${segment.line}-${segment.from}-${segment.to}`"
                  class="timeline-node"
                  :style="{ '--segment-color': segmentColor(segment.line) }"
                >
                  <div class="timeline-dot">
                    <VIcon icon="mdi-train-variant" size="20" />
                  </div>
                  <div class="timeline-body">
                    <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                      <span class="route-line-badge" :class="lineClass(segment.line)">
                        {{ lineDisplay(segment.line) }}
                      </span>
                      <VChip variant="tonal" color="primary" size="small">
                        {{ segment.stops === 0 ? 'Transfer' : `${segment.stops} ${segment.stops === 1 ? 'stop' : 'stops'}` }}
                      </VChip>
                    </div>
                    <div class="fw-semibold text-dark">{{ segment.from }} → {{ segment.to }}</div>
                  </div>
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </VSlideYTransition>

    <VSlideYTransition mode="out-in">
      <div v-if="fareResult" class="mt-4">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h5 class="mb-0">Monthly Pass Companion</h5>
          <VChip color="info" variant="tonal" size="small" prepend-icon="mdi-update">
            Auto-updates with your inputs
          </VChip>
        </div>

        <div class="row g-3">
          <div class="col-md-4">
            <VSheet class="fare-input-sheet h-100" elevation="2">
              <div class="fare-input-header">
                <VIcon icon="mdi-repeat-variant" size="22" />
                <div>
                  <div class="fw-semibold">Trips per day</div>
                  <div class="small text-muted">Enter how many MRT rides you usually take daily.</div>
                </div>
              </div>
              <div class="fare-slider">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small text-muted">1</span>
                  <VChip size="small" variant="flat" color="primary">{{ dailyTrips }}</VChip>
                  <span class="small text-muted">10</span>
                </div>
                <VSlider
                  v-model="dailyTrips"
                  :min="1"
                  :max="10"
                  :step="1"
                  color="primary"
                  thumb-label="always"
                  show-ticks="always"
                  tick-size="3"
                />
              </div>
            </VSheet>
          </div>
          <div class="col-md-4">
            <VSheet class="fare-input-sheet h-100" elevation="2">
              <div class="fare-input-header">
                <VIcon icon="mdi-calendar-blank-outline" size="22" />
                <div>
                  <div class="fw-semibold">Days travelled each month</div>
                  <div class="small text-muted">Adjust to match your regular commute schedule.</div>
                </div>
              </div>
              <div class="fare-slider">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small text-muted">1</span>
                  <VChip size="small" variant="flat" color="primary">{{ workingDays }}</VChip>
                  <span class="small text-muted">31</span>
                </div>
                <VSlider
                  v-model="workingDays"
                  :min="1"
                  :max="31"
                  :step="1"
                  color="primary"
                  thumb-label="always"
                  show-ticks="always"
                  tick-size="3"
                />
              </div>
            </VSheet>
          </div>
          <div class="col-md-4">
            <VSheet class="fare-input-sheet h-100" elevation="2">
              <div class="fare-input-header">
                <VIcon icon="mdi-chart-line" size="22" />
                <div>
                  <div class="fw-semibold">Projected rides</div>
                  <div class="small text-muted">Used for the monthly pass comparison.</div>
                </div>
              </div>
              <div class="fare-metric-display">
                <div class="fare-metric-value">{{ monthlyRides }}</div>
                <div class="small text-muted">rides / month</div>
              </div>
            </VSheet>
          </div>
        </div>

        <div v-if="passAnalysis" class="row g-3 mt-1">
          <div class="col-lg-4">
            <VCard class="h-100" elevation="3">
              <div class="card-body">
                <h6 class="text-uppercase text-muted mb-3">Recommendation</h6>
                <p v-if="bestPass" class="fw-semibold mb-2">
                  <template v-if="bestPass.worth">
                    The {{ passLabel(bestPass.mode) }} pass could save {{ formatCurrency(bestPass.savings) }} this month.
                  </template>
                  <template v-else>
                    Stick to pay-per-ride — the {{ passLabel(bestPass.mode) }} pass costs
                    {{ formatCurrency(Math.abs(bestPass.savings)) }} more.
                  </template>
                </p>
                <p class="mb-1">
                  <strong>Single trip fare:</strong> {{ formatCurrency(passAnalysis.singleFare) }}
                </p>
                <p class="mb-3">
                  <strong>Estimated monthly spend:</strong> {{ formatCurrency(passAnalysis.monthlyTotal) }}
                </p>
                <VProgressLinear :model-value="bestPassProgress" :color="bestPassTone" height="10" rounded="pill" />
              </div>
            </VCard>
          </div>
          <div class="col-lg-8">
            <VCard class="h-100" elevation="3">
              <div class="card-body">
                <h6 class="text-uppercase text-muted mb-2">Savings vs monthly passes</h6>
                <div class="chart-wrapper">
                  <canvas ref="passChartRef"></canvas>
                </div>
              </div>
            </VCard>
          </div>
          <div class="col-12">
            <div class="table-responsive shadow-sm border rounded-3">
              <table class="table align-middle mb-0 table-modern">
                <thead class="table-light">
                  <tr class="text-center">
                    <th scope="col">Pass type</th>
                    <th scope="col">Pass price</th>
                    <th scope="col">Net savings</th>
                    <th scope="col">Recommendation</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr v-for="row in passAnalysis.breakdown" :key="row.mode">
                    <td>{{ passLabel(row.mode) }}</td>
                    <td>{{ formatCurrency(row.passPrice) }}</td>
                    <td :class="row.worth ? 'text-success fw-semibold' : 'text-danger fw-semibold'">
                      {{ formatSavings(row.savings) }}
                    </td>
                    <td>
                      <VChip
                        v-if="row.worth"
                        color="success"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-check-circle-outline"
                      >
                        Worth it
                      </VChip>
                      <VChip
                        v-else
                        color="error"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-close-circle-outline"
                      >
                        Skip it
                      </VChip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </VSlideYTransition>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import Chart from 'chart.js/auto';
import { useRoutePlanner } from '../composables/useRoutePlanner';
import { useFareCalculator } from '../composables/useFareCalculator';
import { getLineColor } from '../composables/useTrainAPI';

const {
  allStations: stations,
  shortestPath,
  estimateDistanceKm,
  estimateTimeMinutes,
  summariseSegments
} = useRoutePlanner();
const { fareByType, analyseMonthlyPass } = useFareCalculator();

const commuterTypes = [
  { value: 'adult', label: 'Adult' },
  { value: 'primary', label: 'Primary School Student' },
  { value: 'secondary', label: 'Secondary School Student' },
  { value: 'polytechnic', label: 'Polytechnic Student' },
  { value: 'university', label: 'University Student' },
  { value: 'ns', label: 'National Serviceman' },
  { value: 'senior', label: 'Senior Citizen' },
  { value: 'disability', label: 'Person with Disabilities' },
  { value: 'workfare', label: 'Workfare Concession' }
];

const lineMeta = {
  NSL: { name: 'North South Line' },
  EWL: { name: 'East West Line' },
  CGL: { name: 'Changi Airport Branch' },
  DTL: { name: 'Downtown Line' },
  CCL: { name: 'Circle Line' },
  NEL: { name: 'North East Line' },
  TEL: { name: 'Thomson–East Coast Line' },
  BPL: { name: 'Bukit Panjang LRT' },
  SWPL: { name: 'Sengkang West LRT' },
  SEPL: { name: 'Sengkang East LRT' },
  PEPLRT: { name: 'Punggol East LRT' },
  PWLRT: { name: 'Punggol West LRT' }
};

const passLabels = {
  train: 'Train-only',
  bus: 'Bus-only',
  hybrid: 'Hybrid (Bus + Train)'
};

const startStation = ref('Jurong East');
const endStation = ref('City Hall');
const commuterType = ref('adult');
const fareResult = ref(null);
const passAnalysis = ref(null);
const errorMessage = ref('');
const needsRecalculate = ref(false);

const dailyTrips = ref(2);
const workingDays = ref(22);

const passChartRef = ref(null);
let passChart = null;

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2
});

const selectedCommuterLabel = computed(
  () => commuterTypes.find((type) => type.value === commuterType.value)?.label ?? 'Adult'
);

const monthlyRides = computed(() => Math.max(0, dailyTrips.value * workingDays.value * 2));

const bestPass = computed(() => {
  if (!passAnalysis.value) return null;
  return passAnalysis.value.breakdown.reduce((best, current) => {
    if (!best) return current;
    return current.savings > best.savings ? current : best;
  }, null);
});

const bestPassTone = computed(() => (bestPass.value?.worth ? 'success' : 'error'));

const bestPassProgress = computed(() => {
  if (!passAnalysis.value) return 0;
  const base = Math.max(passAnalysis.value.monthlyTotal, 1);
  const savings = Math.abs(bestPass.value?.savings ?? 0);
  return Math.min(100, Math.round((savings / base) * 100));
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatSavings(value) {
  const formatted = currencyFormatter.format(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

function lineDisplay(code) {
  return lineMeta[code]?.name ?? code;
}

function lineClass(code) {
  return code ? `line-${code.toLowerCase()}` : '';
}

function passLabel(mode) {
  return passLabels[mode] ?? mode;
}

function segmentColor(lineCode) {
  const color = getLineColor(lineDisplay(lineCode));
  return color || '#6b7280';
}

function calculate() {
  errorMessage.value = '';
  passAnalysis.value = null;

  if (startStation.value === endStation.value) {
    fareResult.value = null;
    destroyChart();
    errorMessage.value = 'Please choose two different stations.';
    needsRecalculate.value = false;
    return;
  }

  const path = shortestPath(startStation.value, endStation.value);
  if (!path) {
    fareResult.value = null;
    destroyChart();
    errorMessage.value = 'No valid MRT route found between these stations.';
    needsRecalculate.value = false;
    return;
  }

  const distanceKm = estimateDistanceKm(path.totalWeight);
  const minutes = estimateTimeMinutes(path.totalWeight);
  const segments = summariseSegments(path) ?? [];
  const totalStops = segments.reduce((sum, segment) => sum + segment.stops, 0);
  const transfers = Math.max(0, segments.length - 1);
  const fare = fareByType(distanceKm, commuterType.value);

  fareResult.value = {
    fare,
    distanceKm,
    minutes,
    segments,
    totalStops,
    transfers
  };

  needsRecalculate.value = false;
  runPassAnalysis();
}

function runPassAnalysis() {
  if (!fareResult.value) {
    passAnalysis.value = null;
    destroyChart();
    return;
  }

  passAnalysis.value = analyseMonthlyPass({
    distanceKm: fareResult.value.distanceKm,
    type: commuterType.value,
    dailyTrips: dailyTrips.value,
    workingDays: workingDays.value
  });

  nextTick(() => {
    renderPassChart(passAnalysis.value);
  });
}

function renderPassChart(analysis) {
  if (!analysis || !passChartRef.value) {
    destroyChart();
    return;
  }

  const labels = analysis.breakdown.map((row) => passLabel(row.mode));
  const dataset = analysis.breakdown.map((row) => Number(row.savings.toFixed(2)));

  if (passChart) {
    passChart.destroy();
  }

  passChart = new Chart(passChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Net savings vs monthly pass ($)',
          data: dataset,
          backgroundColor: dataset.map((value) => (value >= 0 ? 'rgba(25,135,84,0.6)' : 'rgba(220,53,69,0.65)')),
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed?.y ?? 0;
              const formatted = currencyFormatter.format(Math.abs(value));
              return `${value >= 0 ? '+' : '−'}${formatted}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback(value) {
              return typeof value === 'number' ? currencyFormatter.format(value) : value;
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function destroyChart() {
  if (passChart) {
    passChart.destroy();
    passChart = null;
  }
}

function reset() {
  startStation.value = 'Jurong East';
  endStation.value = 'City Hall';
  commuterType.value = 'adult';
  fareResult.value = null;
  passAnalysis.value = null;
  errorMessage.value = '';
  dailyTrips.value = 2;
  workingDays.value = 22;
  needsRecalculate.value = false;
  destroyChart();
}

function swapStations() {
  [startStation.value, endStation.value] = [endStation.value, startStation.value];
}

watch([startStation, endStation, commuterType], () => {
  if (fareResult.value) {
    needsRecalculate.value = true;
  }
});

watch(commuterType, () => {
  if (!fareResult.value) return;
  calculate();
});

watchDebounced(
  [dailyTrips, workingDays],
  () => {
    if (!fareResult.value) return;
    runPassAnalysis();
  },
  { debounce: 300, maxWait: 800 }
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
/* Fix long text inside chips */
.v-chip {
  max-width: none !important;
  min-width: fit-content !important;
  white-space: nowrap;
  padding: 0 10px !important;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Ensure chips inside fare-route-header stay aligned */
.fare-route-header .v-chip {
  flex-shrink: 0;
}


.fare-route-header {
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fare-result-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  min-height: auto !important; /* remove Vuetify’s built-in min height */
  background: linear-gradient(180deg, #fff9f6 0%, #fff 100%);
}

.fare-result-amount {
  font-size: 2.4rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.fare-result-commuter {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: #666;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.fare-result-route {
  font-size: 1rem;
  color: #444;
  margin-bottom: 1.25rem;
}

/* tighten the bottom chip group */
.fare-stat-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: auto; /* keeps chips pinned to the bottom */
}

/* ensure consistent chip sizing and alignment */
.v-chip {
  font-size: 0.85rem;
  padding: 0 10px !important;
  min-width: fit-content !important;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
  height: 32px !important;
}

/* add subtle fade-in animation when fare appears */
.feature-result-animate {
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fare-result-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 1.5rem 1.75rem;
  gap: 0.6rem;
  min-height: unset !important; 
}

.fare-stat-chip-group {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

</style>
