<script setup lang="ts">
import { ref } from 'vue'
import { Connection, Guide, SwitchButton } from '@element-plus/icons-vue'

type RouteSegment = {
  title: string
  details: string
  time: string
  tip: string
}

type RouteOption = {
  id: string
  label: string
  duration: string
  transfers: number
  fare: string
  comfort: string
  segments: RouteSegment[]
  highlights: string[]
}

const routeOptions: RouteOption[] = [
  {
    id: 'fastest',
    label: 'Fastest arrival',
    duration: '34 mins',
    transfers: 1,
    fare: 'S$1.85',
    comfort: 'Moderate crowds expected',
    segments: [
      {
        title: 'Board Thomson-East Coast Line',
        details: 'Woodlands → Orchard',
        time: '18 mins',
        tip: 'Stand near car 3 for quickest exit at Orchard.'
      },
      {
        title: 'Transfer to North-South Line',
        details: 'Orchard → City Hall',
        time: '10 mins',
        tip: 'Follow orange signage, escalator to Platform A.'
      },
      {
        title: 'Alight at City Hall',
        details: 'Exit B toward Raffles City',
        time: '6 mins buffer',
        tip: 'Use lift lobby for a barrier-free exit.'
      }
    ],
    highlights: ['Transfer buffer pre-calculated', 'Live crowd monitoring enabled']
  },
  {
    id: 'comfort',
    label: 'Most comfortable',
    duration: '38 mins',
    transfers: 0,
    fare: 'S$1.95',
    comfort: 'Optimal space availability',
    segments: [
      {
        title: 'Board Downtown Line',
        details: 'Bukit Panjang → Bayfront',
        time: '29 mins',
        tip: 'Choose middle carriage for easiest Bayfront exit.'
      },
      {
        title: 'Walk linkway to Circle Line',
        details: 'Bayfront → Promenade',
        time: '5 mins',
        tip: 'Stay on the left; moving walkways in service.'
      },
      {
        title: 'Circle Line hop',
        details: 'Promenade → Esplanade',
        time: '4 mins',
        tip: 'Platforms currently reporting light crowd density.'
      }
    ],
    highlights: ['Keeps to sheltered paths', 'All lifts verified operational']
  },
  {
    id: 'walking',
    label: 'Fewest transfers',
    duration: '41 mins',
    transfers: 0,
    fare: 'S$1.72',
    comfort: 'Direct & predictable',
    segments: [
      {
        title: 'North-South Line direct',
        details: 'Jurong East → Raffles Place',
        time: '32 mins',
        tip: 'Board front car for swift interchange exit.'
      },
      {
        title: 'City Link Walk',
        details: 'Raffles Place → Esplanade by foot',
        time: '9 mins',
        tip: 'Sheltered walkway, guiding lights active after 7pm.'
      }
    ],
    highlights: ['Avoids platform changes', 'Weather-proof walking link']
  }
]

const defaultRouteId = routeOptions[0]?.id ?? ''
const activeRoute = ref(defaultRouteId)
</script>

<template>
  <section id="route-planner" class="st-section route-planner">
    <div class="st-container">
      <div class="section-head">
        <div class="st-pill">
          <el-icon><Connection /></el-icon>
          Route Planner
        </div>
        <h2 class="st-section-title">Intelligent routing tuned for your priorities</h2>
        <p class="st-section-subtitle">
          Compare routes by arrival time, platform transfers, and comfort. We blend network data with
          walking links so every connection feels intuitive.
        </p>
      </div>

      <el-tabs v-model="activeRoute" class="route-tabs" stretch>
        <el-tab-pane
          v-for="option in routeOptions"
          :key="option.id"
          :name="option.id"
        >
          <template #label>
            <div class="route-label">
              <strong>{{ option.label }}</strong>
              <span>{{ option.duration }} · {{ option.fare }}</span>
            </div>
          </template>
          <transition name="fade-slide-up" mode="out-in">
            <div v-if="activeRoute === option.id" class="route-details st-card">
              <div class="route-metrics">
                <div>
                  <span class="metric-heading">Duration</span>
                  <span class="metric-value">{{ option.duration }}</span>
                </div>
                <div>
                  <span class="metric-heading">Transfers</span>
                  <span class="metric-value">{{ option.transfers }}</span>
                </div>
                <div>
                  <span class="metric-heading">Fare</span>
                  <span class="metric-value">{{ option.fare }}</span>
                </div>
                <div>
                  <span class="metric-heading">Comfort</span>
                  <span class="metric-value">{{ option.comfort }}</span>
                </div>
              </div>

              <el-steps align-center class="route-steps">
                <el-step
                  v-for="(segment, index) in option.segments"
                  :key="segment.title"
                  :title="segment.title"
                  :description="segment.details"
                  :status="index === option.segments.length - 1 ? 'finish' : 'process'"
                />
              </el-steps>

              <el-timeline>
                <el-timeline-item
                  v-for="segment in option.segments"
                  :key="segment.details"
                  type="primary"
                  :timestamp="segment.time"
                >
                  <div class="timeline-entry">
                    <div class="entry-title">{{ segment.title }}</div>
                    <div class="entry-details">{{ segment.details }}</div>
                    <div class="entry-tip">
                      <el-icon><Guide /></el-icon>
                      <span>{{ segment.tip }}</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>

              <div class="route-highlights">
                <div
                  v-for="highlight in option.highlights"
                  :key="highlight"
                  class="highlight"
                >
                  <el-icon><SwitchButton /></el-icon>
                  <span>{{ highlight }}</span>
                </div>
              </div>
            </div>
          </transition>
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<style scoped>
.section-head {
  display: grid;
  gap: 0.75rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.route-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.route-label {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.route-label strong {
  font-weight: 600;
  letter-spacing: -0.01em;
}

.route-label span {
  font-size: 0.8rem;
  color: var(--st-muted);
}

.route-details {
  margin-top: 1.25rem;
  display: grid;
  gap: 1.5rem;
}

.route-metrics {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.metric-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--st-muted);
}

.metric-value {
  display: block;
  font-weight: 600;
  font-size: 1.05rem;
  margin-top: 0.35rem;
}

.route-steps {
  background: rgba(255, 255, 255, 0.75);
  padding: 1rem;
  border-radius: var(--st-radius-md);
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.timeline-entry {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--st-radius-md);
  padding: 0.9rem 1.1rem;
  border: 1px solid rgba(249, 115, 22, 0.12);
  display: grid;
  gap: 0.4rem;
}

.entry-title {
  font-weight: 600;
  font-size: 1rem;
}

.entry-details {
  font-size: 0.95rem;
  color: rgba(31, 41, 55, 0.7);
}

.entry-tip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  color: var(--st-primary);
}

.route-highlights {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.highlight {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  padding: 0.85rem 1rem;
  border-radius: var(--st-radius-md);
  background: rgba(249, 115, 22, 0.12);
  color: var(--st-primary-dark);
}
</style>
