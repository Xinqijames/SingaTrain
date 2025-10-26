<template>
  <section class="section-card">
    <h2 class="section-title mb-3">Fare Calculator</h2>
    <p class="text-muted">
      Distance-based fares with the latest LTA tables. Estimate concession pricing and find out whether a monthly pass
      could save you more.
    </p>

    <form class="row g-3" @submit.prevent="calculate">
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

      <div class="col-12 d-flex gap-3">
        <button class="btn btn-primary" type="submit">
          <span class="material-icons me-1">attach_money</span>
          Calculate fare
        </button>
        <button class="btn btn-outline-danger" type="button" @click="reset">
          <span class="material-icons me-1">restart_alt</span>
          Reset
        </button>
      </div>
    </form>

    <div v-if="fareResult" class="mt-4 feature-result-animate">
      <div class="fare-result mb-3">
        <div class="fs-2 fw-bold">${{ fareResult.fare.toFixed(2) }}</div>
        <div class="small text-uppercase">{{ selectedCommuterLabel }}</div>
      </div>
      <div class="border rounded p-3 bg-light">
        <p class="mb-1"><strong>Journey:</strong> {{ startStation }} → {{ endStation }}</p>
        <p class="mb-1"><strong>Approx distance:</strong> {{ fareResult.distanceKm }} km</p>
        <p class="mb-0"><strong>Estimated travel time:</strong> {{ fareResult.minutes }} minutes</p>
      </div>
    </div>

    <div v-if="fareResult" class="mt-4">
      <h5 class="mb-3">Monthly Pass Calculator</h5>
      <div class="row g-3">
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
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-outline-danger w-100" type="button" @click="runPassAnalysis">
            <span class="material-icons me-1">assessment</span>
            Evaluate pass
          </button>
        </div>
      </div>

      <div v-if="passAnalysis" class="mt-4">
        <div class="border rounded p-3 bg-light mb-3">
          <p class="mb-1"><strong>Single trip fare:</strong> ${{ passAnalysis.singleFare.toFixed(2) }}</p>
          <p class="mb-1"><strong>Estimated monthly spend:</strong> ${{ passAnalysis.monthlyTotal.toFixed(2) }}</p>
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead class="table-warning text-center">
              <tr>
                <th>Pass type</th>
                <th>Price ($)</th>
                <th>Net savings / loss ($)</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody class="text-center">
              <tr v-for="row in passAnalysis.breakdown" :key="row.mode">
                <td class="text-capitalize">{{ row.mode }}</td>
                <td>{{ row.passPrice.toFixed(2) }}</td>
                <td :class="row.worth ? 'text-success' : 'text-danger'">
                  {{ row.worth ? '+' : '−' }}{{ Math.abs(row.savings).toFixed(2) }}
                </td>
                <td>{{ row.worth ? '✅ Worth it' : '❌ Not worth it' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoutePlanner } from '../composables/useRoutePlanner';
import { useFareCalculator } from '../composables/useFareCalculator';

const { allStations: stations, shortestPath, estimateDistanceKm, estimateTimeMinutes } = useRoutePlanner();
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

const startStation = ref('Jurong East');
const endStation = ref('City Hall');
const commuterType = ref('adult');
const fareResult = ref(null);
const passAnalysis = ref(null);
const errorMessage = ref('');

const dailyTrips = ref(2);
const workingDays = ref(22);

const selectedCommuterLabel = computed(
  () => commuterTypes.find((type) => type.value === commuterType.value)?.label ?? 'Adult'
);

function calculate() {
  errorMessage.value = '';
  passAnalysis.value = null;

  if (startStation.value === endStation.value) {
    errorMessage.value = 'Please choose two different stations.';
    return;
  }

  const path = shortestPath(startStation.value, endStation.value);
  if (!path) {
    errorMessage.value = 'No valid MRT route found between these stations.';
    return;
  }

  const distanceKm = estimateDistanceKm(path.totalWeight);
  const fare = fareByType(distanceKm, commuterType.value);
  const minutes = estimateTimeMinutes(path.totalWeight);

  fareResult.value = { fare, distanceKm, minutes };
}

function runPassAnalysis() {
  if (!fareResult.value) return;
  passAnalysis.value = analyseMonthlyPass({
    distanceKm: fareResult.value.distanceKm,
    type: commuterType.value,
    dailyTrips: dailyTrips.value,
    workingDays: workingDays.value
  });
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
}
</script>
