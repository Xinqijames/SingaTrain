<template>
  <section class="section-card">
    <h2 class="section-title mb-3">Fare Calculator</h2>
    <p class="tab-desc">
      Distance-based fares with the latest LTA tables. Estimate concession pricing, understand line changes, and see
      whether a monthly pass could save you more.
    </p>

    <form class="row g-3 align-items-end" @submit.prevent="calculate">
      <div class="col-md-4">
        <label class="form-label" for="fareStart">From</label>
        <select id="fareStart" v-model="startStation" class="form-select">
          <option v-for="station in stations" :key="station" :value="station">{{ station }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label" for="fareEnd">To</label>
        <select id="fareEnd" v-model="endStation" class="form-select">
          <option v-for="station in stations" :key="station" :value="station">{{ station }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label" for="commuterType">Commuter Type</label>
        <select id="commuterType" v-model="commuterType" class="form-select">
          <option v-for="type in commuterTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="col-12 d-flex flex-wrap align-items-center gap-2">
        <button class="btn btn-primary" type="submit">
          <span class="material-icons me-1">attach_money</span>
          {{ fareResult ? 'Recalculate' : 'Calculate fare' }}
        </button>
        <button class="btn btn-outline-secondary" type="button" @click="swapStations">
          <span class="material-icons me-1">swap_horiz</span>
          Swap stations
        </button>
        <button class="btn btn-outline-danger" type="button" @click="reset">
          <span class="material-icons me-1">restart_alt</span>
          Reset
        </button>
        <span v-if="needsRecalculate" class="text-warning small d-flex align-items-center gap-1">
          <span class="material-icons fs-6 align-middle">info</span>
          Inputs changed — calculate again to refresh.
        </span>
      </div>
    </form>

    <div v-if="fareResult" class="mt-4 feature-result-animate">
      <div class="row g-3">
        <div class="col-lg-4">
          <div class="fare-result-card h-100">
            <div class="fare-result-amount">{{ formatCurrency(fareResult.fare) }}</div>
            <div class="fare-result-commuter">{{ selectedCommuterLabel }}</div>
            <ul class="list-unstyled mt-4 mb-0 small text-muted">
              <li class="d-flex align-items-center gap-2 mb-2">
                <span class="material-icons text-primary">train</span>
                <span class="tab-desc">{{ startStation }} → {{ endStation }}</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <span class="material-icons text-primary">route</span>
                <span class="tab-desc">{{ fareResult.distanceKm }} km · {{ fareResult.totalStops }} {{ fareResult.totalStops === 1 ? 'stop' : 'stops' }}</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <span class="material-icons text-primary">schedule</span>
                <span class="tab-desc">{{ fareResult.minutes }} minutes · {{ fareResult.transfers }} {{ fareResult.transfers === 1 ? 'transfer' : 'transfers' }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="fare-route-card h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-dark mb-0">Route overview</h5>
              <span class="badge bg-light text-muted border">{{ fareResult.segments.length }} {{ fareResult.segments.length === 1 ? 'segment' : 'segments' }}</span>
            </div>
            <p class="text-muted small mb-3">
              We recommend the quickest MRT path. Look out for “Transfer” badges to change lines with minimal walking.
            </p>
            <div
              v-for="segment in fareResult.segments"
              :key="`${segment.line}-${segment.from}-${segment.to}`"
              class="route-segment"
            >
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="route-line-badge" :class="lineClass(segment.line)">
                      {{ lineDisplay(segment.line) }}
                    </span>
                    <span class="badge rounded-pill bg-secondary-subtle text-secondary">
                      {{ segment.stops === 0 ? 'Transfer' : `${segment.stops} ${segment.stops === 1 ? 'stop' : 'stops'}` }}
                    </span>
                  </div>
                  <div class="fw-semibold text-dark">{{ segment.from }} → {{ segment.to }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="fareResult" class="mt-4">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h5 class="mb-0">Monthly Pass Companion</h5>
        <span class="badge bg-info-subtle text-info-emphasis">Auto-updates with your inputs</span>
      </div>
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label" for="dailyTrips">Daily round trips</label>
          <input
            id="dailyTrips"
            v-model.number="dailyTrips"
            type="number"
            class="form-control"
            min="1"
            max="10"
          />
          <small class="tab-desc">Two rides count as one round trip.</small>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="workingDays">Working days / month</label>
          <input
            id="workingDays"
            v-model.number="workingDays"
            type="number"
            class="form-control"
            min="1"
            max="31"
          />
          <small class="tab-desc">Include study days if you commute then.</small>
        </div>
        <div class="col-md-4">
          <div class="info-pill">
            <span class="material-icons">equalizer</span>
            <div>
              <div class="fw-semibold">{{ monthlyRides }} rides / month</div>
              <div class="small tab-desc">Used for the monthly pass comparison.</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="passAnalysis" class="row g-3 mt-1">
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h6 class="text-uppercase text-muted mb-2">Recommendation</h6>
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
              <p class="mb-0">
                <strong>Estimated monthly spend:</strong> {{ formatCurrency(passAnalysis.monthlyTotal) }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h6 class="text-uppercase text-muted mb-2">Savings vs monthly passes</h6>
              <div class="chart-wrapper">
                <canvas ref="passChartRef"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="table-responsive shadow-sm border rounded-3">
            <table class="table align-middle mb-0">
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
                    <span v-if="row.worth" class="badge bg-success-subtle text-success-emphasis px-3">Worth it</span>
                    <span v-else class="badge bg-danger-subtle text-danger-emphasis px-3">Skip it</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import Chart from 'chart.js/auto';
import { useRoutePlanner } from '../composables/useRoutePlanner';
import { useFareCalculator } from '../composables/useFareCalculator';

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

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatSavings(value) {
  const formatted = currencyFormatter.format(Math.abs(value));
  return `${value >= 0 ? '+' : '−'}${formatted}`;
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
