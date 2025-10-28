<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Coin, Discount, Tickets } from '@element-plus/icons-vue'

const stationOptions = [
  { label: 'Woodlands North', value: 'woodlands-north' },
  { label: 'Woodlands', value: 'woodlands' },
  { label: 'Sembawang', value: 'sembawang' },
  { label: 'Yishun', value: 'yishun' },
  { label: 'Bishan', value: 'bishan' },
  { label: 'Dhoby Ghaut', value: 'dhoby-ghaut' },
  { label: 'City Hall', value: 'city-hall' },
  { label: 'Raffles Place', value: 'raffles-place' },
  { label: 'Marina Bay', value: 'marina-bay' },
  { label: 'Bayfront', value: 'bayfront' },
  { label: 'Tampines', value: 'tampines' },
  { label: 'Pasir Ris', value: 'pasir-ris' },
  { label: 'Punggol', value: 'punggol' }
]

const defaultOrigin = stationOptions[0]?.value ?? ''
const defaultDestination = stationOptions[1]?.value ?? ''

const form = reactive({
  origin: defaultOrigin,
  destination: defaultDestination,
  passengers: 1,
  concessions: 0,
  cardType: 'adult',
  travelTime: 'peak'
})

const stationIndex = (value: string) => stationOptions.findIndex(option => option.value === value)

const distanceStops = computed(() => {
  const originIndex = stationIndex(form.origin)
  const destinationIndex = stationIndex(form.destination)
  if (originIndex === -1 || destinationIndex === -1) return 0
  const diff = Math.abs(destinationIndex - originIndex)
  return diff === 0 ? 1 : diff
})

const calculatedFare = computed(() => {
  const baseFare = form.cardType === 'adult' ? 0.92 : 0.72
  const stopMultiplier = form.cardType === 'adult' ? 0.17 : 0.12
  const crowdPremium =
    form.travelTime === 'peak' ? 0.18 : form.travelTime === 'latenight' ? 0.2 : 0
  const total = (baseFare + distanceStops.value * stopMultiplier + crowdPremium) * form.passengers
  const concessionDiscount = Math.min(form.concessions, form.passengers) * 0.31
  const finalFare = Math.max(total - concessionDiscount, 0.72)
  return finalFare.toFixed(2)
})

const estimatedDuration = computed(() => {
  const base = 6
  const perStop = 2.8
  const buffer =
    form.travelTime === 'peak' ? 4 : form.travelTime === 'latenight' ? 3.5 : 1.5
  const minutes = base + distanceStops.value * perStop + buffer
  return Math.round(minutes)
})

const recommendedCard = computed(() => {
  if (form.concessions > 0) return 'Link concession card fares applied automatically.'
  if (form.passengers >= 3) return 'Consider Group Saver top-ups for shared journeys.'
  return 'Adult SimplyGo card recommended for seamless transfers.'
})

const stopLabel = computed(() => (distanceStops.value === 1 ? 'stop' : 'stops'))
</script>

<template>
  <section id="fare-calculator" class="st-section fare-calculator">
    <div class="st-container">
      <div class="section-head">
        <div>
          <div class="st-pill">
            <el-icon><Coin /></el-icon>
            Fare Calculator
          </div>
          <h2 class="st-section-title">Know your fares before you tap in</h2>
          <p class="st-section-subtitle">
            Transparent fares with peak-hour adjustments, concession handling, and platform buffer
            timings baked in.
          </p>
        </div>
        <el-alert
          title="Tip: Save this journey to receive fare change alerts."
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <div class="calculator-grid">
        <div class="calculator-form st-card st-glass">
          <el-form label-position="top" :model="form">
            <el-form-item label="Departing station">
              <el-select v-model="form.origin" filterable placeholder="Select origin">
                <el-option
                  v-for="station in stationOptions"
                  :key="station.value"
                  :value="station.value"
                  :label="station.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Destination">
              <el-select v-model="form.destination" filterable placeholder="Select destination">
                <el-option
                  v-for="station in stationOptions"
                  :key="station.value"
                  :value="station.value"
                  :label="station.label"
                />
              </el-select>
            </el-form-item>

            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="Passengers">
                  <el-input-number v-model="form.passengers" :min="1" :max="6" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="Concession cards">
                  <el-input-number v-model="form.concessions" :min="0" :max="form.passengers" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="Card type">
              <el-radio-group v-model="form.cardType">
                <el-radio-button label="adult">Adult SimplyGo</el-radio-button>
                <el-radio-button label="student">Student</el-radio-button>
                <el-radio-button label="senior">Senior</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Travel window">
              <el-radio-group v-model="form.travelTime">
                <el-radio-button label="peak">Weekday peak</el-radio-button>
                <el-radio-button label="offpeak">Off-peak</el-radio-button>
                <el-radio-button label="latenight">Late night</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>

        <div class="calculator-results st-card">
          <div class="result-badge">
            Estimated Fare
          </div>
          <div class="fare-amount">
            S$ {{ calculatedFare }}
          </div>
          <div class="fare-caption">
            {{ distanceStops }} {{ stopLabel }} &middot; ~{{ estimatedDuration }} minutes door-to-door
          </div>

          <el-divider />

          <div class="insights">
            <div class="insight">
              <div class="insight-icon primary">
                <Coin />
              </div>
              <div>
                <div class="insight-title">Fare breakdown</div>
                <div class="insight-copy">
                  Base {{ form.cardType === 'adult' ? 'adult' : 'concession' }} fare with peak-hour
                  adjustments and {{ form.passengers }} rider(s).
                </div>
              </div>
            </div>
            <div class="insight">
              <div class="insight-icon">
                <Discount />
              </div>
              <div>
                <div class="insight-title">Smart savings</div>
                <div class="insight-copy">
                  {{ recommendedCard }}
                </div>
              </div>
            </div>
            <div class="insight">
              <div class="insight-icon">
                <Tickets />
              </div>
              <div>
                <div class="insight-title">Transfer ready</div>
                <div class="insight-copy">
                  Tap out &amp; in within 45 minutes to keep your through-fare protected.
                </div>
              </div>
            </div>
          </div>

          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="Heads up: Late-night services incur a flat $0.20 supplement after 11.30pm."
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

@media (min-width: 960px) {
  .section-head {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.calculator-grid {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
}

@media (min-width: 960px) {
  .calculator-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }
}

.calculator-form {
  display: grid;
  gap: 1.25rem;
}

.calculator-results {
  display: grid;
  gap: 1.1rem;
  align-content: start;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(249, 115, 22, 0.12);
  color: var(--st-primary);
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
}

.fare-amount {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.fare-caption {
  font-size: 0.95rem;
  color: var(--st-muted);
}

.insights {
  display: grid;
  gap: 1rem;
}

.insight {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.insight-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(249, 115, 22, 0.12);
  color: var(--st-primary);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.insight-icon.primary {
  background: linear-gradient(145deg, rgba(249, 115, 22, 0.2), rgba(194, 65, 12, 0.18));
}

.insight-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.insight-copy {
  font-size: 0.9rem;
  color: rgba(31, 41, 55, 0.75);
  line-height: 1.5;
}
</style>
