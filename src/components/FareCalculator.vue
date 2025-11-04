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
              :loading="isCalculating"
              :disabled="isCalculating"
            >
              {{ isCalculating ? 'Crunching fares…' : fareResult ? 'Recalculate' : 'Calculate fare' }}
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

    <div class="fare-output-region" :class="{ 'is-active': fareResult, 'is-loading': isCalculating }">
      <div class="map-loading-overlay" :class="{ show: isCalculating }">
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
        </div>
      </div>
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
            <VCard class="fare-reco-card h-100" elevation="4" :class="bestPassToneClass">
              <div class="reco-header">
                <div class="reco-icon">
                  <VIcon :icon="bestPassIcon" size="28" />
                </div>
                <div class="reco-heading">
                  <span class="reco-eyebrow">Recommendation</span>
                  <h5 class="reco-title mb-0">{{ bestPassHeadline }}</h5>
                </div>
                <VChip
                  v-if="bestPass"
                  size="x-small"
                  variant="flat"
                  :color="bestPass?.worth ? 'success' : 'error'"
                  prepend-icon="mdi-star-circle-outline"
                >
                  {{ passLabel(bestPass.mode) }}
                </VChip>
              </div>
              <div class="reco-body">
                <p class="reco-summary mb-3">{{ bestPassSummary }}</p>
                <div class="reco-metrics">
                  <div class="reco-metric">
                    <span class="reco-metric-label">Single fare</span>
                    <span class="reco-metric-value">{{ formatCurrency(passAnalysis.singleFare) }}</span>
                  </div>
                  <div class="reco-metric">
                    <span class="reco-metric-label">Monthly spend</span>
                    <span class="reco-metric-value">{{ formatCurrency(passAnalysis.monthlyTotal) }}</span>
                  </div>
                  <div class="reco-metric">
                    <span class="reco-metric-label">Net impact</span>
                    <span class="reco-metric-value" :class="bestPass?.worth ? 'text-success' : 'text-danger'">
                      {{ formatSavings(bestPass?.savings ?? 0) }}
                    </span>
                  </div>
                </div>
                <VProgressLinear
                  class="reco-progress mt-4"
                  :model-value="bestPassProgress"
                  :color="bestPassTone"
                  height="8"
                  rounded="pill"
                />
                <div class="reco-progress-caption">
                  Potential savings captured (percentage of projected monthly spend)
                </div>
              </div>
            </VCard>
          </div>
          <div class="col-lg-8">
            <VCard class="fare-chart-card h-100" elevation="4">
              <div class="card-body">
                <div class="chart-header">
                  <div>
                    <h6 class="text-uppercase text-muted mb-2 pl-2">Savings vs monthly passes</h6>
                    <p class="chart-subtitle mb-0">
                      Compare how each pass stacks up against your projected rides.
                    </p>
                  </div>
                  <VChip variant="flat" color="primary" size="small" prepend-icon="mdi-counter">
                    {{ monthlyRides }} rides / month
                  </VChip>
                </div>
                <div class="chart-meta mt-3">
                  <div class="chart-meta-item">
                    <span class="chart-meta-label">Best option</span>
                    <span class="chart-meta-value">{{ bestPass ? passLabel(bestPass.mode) : '—' }}</span>
                  </div>
                  <div class="chart-meta-item">
                    <span class="chart-meta-label">Net impact</span>
                    <span class="chart-meta-value" :class="bestPass?.worth ? 'positive' : 'negative'">
                      {{ formatSavings(bestPass?.savings ?? 0) }}
                    </span>
                  </div>
                </div>
                <div class="chart-wrapper mt-3">
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
                  <tr
                    v-for="row in passAnalysis.breakdown"
                    :key="row.mode"
                    :class="[{ 'table-highlight': row.mode === bestPassMode }, row.worth ? 'pass-worth' : 'pass-loss']"
                  >
                    <td>
                      <div class="table-pass-name">
                        {{ passLabel(row.mode) }}
                        <span v-if="row.mode === bestPassMode" class="table-pass-tag">Recommended</span>
                      </div>
                    </td>
                    <td>{{ formatCurrency(row.passPrice) }}</td>
                    <td :class="row.worth ? 'text-success fw-semibold' : 'text-danger fw-semibold'">
                      {{ formatSavings(row.savings) }}
                    </td>
                    <td>
                      <VChip
                        v-if="row.worth"
                        color="success"
                        variant="flat"
                        size="small"
                        prepend-icon="mdi-check-circle-outline"
                      >
                        Worth it
                      </VChip>
                      <VChip
                        v-else
                        color="error"
                        variant="flat"
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
    </div>

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
const isCalculating = ref(false);

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

const bestPassMode = computed(() => bestPass.value?.mode ?? null);

const bestPassToneClass = computed(() => (bestPass.value?.worth ? 'is-positive' : 'is-negative'));

const bestPassHeadline = computed(() => {
  if (!bestPass.value) return 'Compare options';
  return bestPass.value.worth ? 'Monthly pass pays off' : 'Stick to pay-per-ride';
});

const bestPassSummary = computed(() => {
  if (!bestPass.value) {
    return 'Run a calculation to see personalised advice tailored to your commute.';
  }
  const label = passLabel(bestPass.value.mode);
  if (bestPass.value.worth) {
    return `The ${label} pass could save ${formatCurrency(bestPass.value.savings)} this month compared to pay-per-ride.`;
  }
  return `Pay-per-ride stays cheaper — the ${label} pass would cost ${formatCurrency(Math.abs(bestPass.value.savings))} more.`;
});

const bestPassIcon = computed(() => (bestPass.value?.worth ? 'mdi-ticket-percent' : 'mdi-cash-minus'));

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

async function calculate() {
  if (isCalculating.value) return;
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

  isCalculating.value = true;
  const startTime = Date.now();
  try {
    needsRecalculate.value = false;
    await new Promise((resolve) => setTimeout(resolve, 420));

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
    await runPassAnalysis();
    
    // Ensure loader shows for at least 2 seconds
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 2000 - elapsed);
    await new Promise((resolve) => setTimeout(resolve, remaining));
  } catch (err) {
    console.error(err);
    fareResult.value = null;
    passAnalysis.value = null;
    destroyChart();
    needsRecalculate.value = false;
    errorMessage.value =
      'Unable to calculate fare at the moment. Please try again in a moment.';
    
    // Ensure loader shows for at least 2 seconds even on error
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 2000 - elapsed);
    await new Promise((resolve) => setTimeout(resolve, remaining));
  } finally {
    isCalculating.value = false;
  }
}

async function runPassAnalysis() {
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

  await nextTick();
  renderPassChart(passAnalysis.value);
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

watch(commuterType, async () => {
  if (!fareResult.value) return;
  await calculate();
});

watchDebounced(
  [dailyTrips, workingDays],
  async () => {
    if (!fareResult.value) return;
    await runPassAnalysis();
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

.fare-output-region {
  position: relative;
}

.fare-output-region.is-active,
.fare-output-region.is-loading {
  min-height: 280px;
}

.fare-reco-card {
  padding: 20px 22px;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgb(var(--v-theme-surface)) 100%);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.fare-reco-card.is-positive {
  background: linear-gradient(160deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 100%);
}

.fare-reco-card.is-negative {
  background: linear-gradient(160deg, rgba(244, 63, 94, 0.16) 0%, rgba(244, 63, 94, 0.05) 100%);
}

.reco-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reco-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.reco-heading {
  flex: 1;
  min-width: 0;
}

.reco-eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.reco-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.reco-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reco-summary {
  color: rgba(var(--v-theme-on-surface), 0.78);
  line-height: 1.4;
}

.reco-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.reco-metric {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.38);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reco-metric-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.reco-metric-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.reco-progress {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
}

.reco-progress-caption {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.fare-chart-card {
  border: none;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.chart-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.85rem;
}

.chart-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-meta-item {
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-meta-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.chart-meta-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.chart-meta-value.positive {
  color: #15803d;
}

.chart-meta-value.negative {
  color: #dc2626;
}

.table-modern .table-pass-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.table-modern .table-pass-tag {
  display: inline-block;
  align-self: center;
  padding: 2px 10px;
  font-size: 0.7rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: rgba(37, 99, 235, 0.95);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.table-modern tr.table-highlight td {
  background: color-mix(in srgb, rgba(16, 185, 129, 0.2), rgba(255, 255, 255, 0.85));
}

.table-modern tr.pass-loss.table-highlight td {
  background: color-mix(in srgb, rgba(244, 63, 94, 0.18), rgba(255, 255, 255, 0.85));
}

.table-modern tr.table-highlight td,
.table-modern tr.table-highlight th {
  border-top: none;
}

@media (max-width: 992px) {
  .reco-metrics {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 600px) {
  .fare-loading-overlay {
    border-radius: 18px;
    padding: 28px 14px;
  }
  .chart-meta {
    flex-direction: column;
  }
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-radius: 12px;
}

.map-loading-overlay.show {
  opacity: 1;
  visibility: visible;
}

.map-loading-content {
  text-align: center;
  color: var(--color-text);
}

body.dark-mode .map-loading-overlay {
  background: rgba(15, 17, 21, 0.95);
}

body.dark-mode .map-loading-content {
  color: var(--color-text);
}

/* From Uiverse.io by Novaxlo - Capybara Loader */
.capybaraloader {
  width: 14em;
  height: 10em;
  position: relative;
  z-index: 1;
  --color: rgb(204, 125, 45);
  --color2: rgb(83, 56, 28);
  transform: scale(0.75);
}

.capybara {
  width: 100%;
  height: 7.5em;
  position: relative;
  z-index: 1;
}

.loader {
  width: 100%;
  height: 2.5em;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.capy {
  width: 85%;
  height: 100%;
  background: linear-gradient(var(--color), 90%, var(--color2));
  border-radius: 45%;
  position: relative;
  z-index: 1;
  animation: movebody 1s linear infinite;
}

.capyhead {
  width: 7.5em;
  height: 7em;
  bottom: 0em;
  right: 0em;
  position: absolute;
  background-color: var(--color);
  z-index: 3;
  border-radius: 3.5em;
  box-shadow: -1em 0em var(--color2);
  animation: movebody 1s linear infinite;
}

.capyear {
  width: 2em;
  height: 2em;
  background: linear-gradient(-45deg, var(--color), 90%, var(--color2));
  top: 0em;
  left: 0em;
  border-radius: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 3;
}

.capyear:nth-child(2) {
  left: 5em;
  background: linear-gradient(25deg, var(--color), 90%, var(--color2));
}

.capyear2 {
  width: 100%;
  height: 1em;
  background-color: var(--color2);
  bottom: 0em;
  left: 0.5em;
  border-radius: 100%;
  position: absolute;
  transform: rotate(-45deg);
}

.capymouth {
  width: 3.5em;
  height: 2em;
  background-color: var(--color2);
  position: absolute;
  bottom: 0em;
  left: 2.5em;
  border-radius: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5em;
}

.capylips {
  width: 0.25em;
  height: 0.75em;
  border-radius: 100%;
  transform: rotate(-45deg);
  background-color: var(--color);
}

.capylips:nth-child(2) {
  transform: rotate(45deg);
}

.capyeye {
  width: 2em;
  height: 0.5em;
  background-color: var(--color2);
  position: absolute;
  bottom: 3.5em;
  left: 1.5em;
  border-radius: 5em;
  transform: rotate(45deg);
}

.capyeye:nth-child(4) {
  transform: rotate(-45deg);
  left: 5.5em;
  width: 1.75em;
}

.capyleg {
  width: 6em;
  height: 5em;
  bottom: 0em;
  left: 0em;
  position: absolute;
  background: linear-gradient(var(--color), 95%, var(--color2));
  z-index: 2;
  border-radius: 2em;
  animation: movebody 1s linear infinite;
}

.capyleg2 {
  width: 1.75em;
  height: 3em;
  bottom: 0em;
  left: 3.25em;
  position: absolute;
  background: linear-gradient(var(--color), 80%, var(--color2));
  z-index: 2;
  border-radius: 0.75em;
  box-shadow: inset 0em -0.5em var(--color2);
  animation: moveleg 1s linear infinite;
}

.capyleg2:nth-child(3) {
  width: 1.25em;
  left: 0.5em;
  height: 2em;
  animation: moveleg2 1s linear infinite 0.075s;
}

@keyframes moveleg {
  0% {
    transform: rotate(-45deg) translateX(-5%);
  }
  50% {
    transform: rotate(45deg) translateX(5%);
  }
  100% {
    transform: rotate(-45deg) translateX(-5%);
  }
}

@keyframes moveleg2 {
  0% {
    transform: rotate(45deg);
  }
  50% {
    transform: rotate(-45deg);
  }
  100% {
    transform: rotate(45deg);
  }
}

@keyframes movebody {
  0% {
    transform: translateX(0%);
  }
  50% {
    transform: translateX(2%);
  }
  100% {
    transform: translateX(0%);
  }
}

.loaderline {
  width: 50em;
  height: 0.5em;
  border-top: 0.5em dashed var(--color2);
  animation: moveline 10s linear infinite;
}

@keyframes moveline {
  0% {
    transform: translateX(0%);
    opacity: 0%;
  }
  5% {
    opacity: 100%;
  }
  95% {
    opacity: 100%;
  }
  100% {
    opacity: 0%;
    transform: translateX(-70%);
  }
}
/* === GENERAL LAYOUT SPACING FIX === */
.section-card {
  padding: 2rem 1.5rem; /* restore breathing room */
}

/* Add consistent vertical rhythm */
.mt-4 {
  margin-top: 2rem !important;
}
.mb-4 {
  margin-bottom: 2rem !important;
}

/* === CARD SPACING === */
.v-card {
  padding: 1.5rem 1.75rem !important; /* restore inner padding */
  border-radius: 16px;
}

/* Give chart card more breathing space */
.fare-chart-card .card-body {
  padding: 2rem 1.75rem !important;
}

/* Ensure the chart header and chip have enough separation */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem !important;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: rgba(60, 60, 60, 0.75);
  margin-bottom: 0.75rem;
}

/* Add vertical padding between chart and chip row */
.chart-meta {
  margin-top: 1rem !important;
  margin-bottom: 0.75rem !important;
}

/* Add spacing between the chart itself and its labels */
.chart-wrapper {
  margin-top: 1.25rem !important;
  margin-bottom: 0.5rem !important;
  height: 320px !important;
}

/* === FARE RESULT CARD === */
.fare-result-card {
  padding: 2rem 2rem !important;
  gap: 1rem;
}

/* Give chips some room from top and bottom */
.fare-stat-chip-group {
  margin-top: 1rem !important;
  gap: 0.8rem !important;
}

/* === MONTHLY PASS COMPANION === */
.fare-input-sheet {
  padding: 1.25rem !important;
  border-radius: 14px;
}

/* Create room between each slider section */
.row.g-3 {
  row-gap: 1.5rem !important;
}

/* === TABLE SPACING === */
.table-responsive {
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
}

/* === CHIP TWEAKS === */
.v-chip {
  font-size: 0.9rem !important;
  padding: 0 12px !important;
  height: 34px !important;
}


</style>
