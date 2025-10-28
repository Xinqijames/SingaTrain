<script setup lang="ts">
import { computed } from 'vue'
import {
  MapLocation,
  SuccessFilled,
  WarningFilled,
  RefreshRight,
  Sunny,
  Connection
} from '@element-plus/icons-vue'

const liveUpdatedAt = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const liveLines = [
  {
    id: 'nsl',
    name: 'North South Line',
    status: 'On schedule',
    tone: 'success',
    load: 62,
    trend: 'Normal crowd levels observed across city-bound platforms.',
    highlights: ['2 min headways between Orchard ↔ City Hall', 'Express transfer at Dhoby Ghaut']
  },
  {
    id: 'dtl',
    name: 'Downtown Line',
    status: 'Monitoring',
    tone: 'warning',
    load: 74,
    trend: 'Slight crowding downstream to Expo due to evening peak.',
    highlights: ['Queue marshals active at Bugis platform', 'Extra train dispatched towards Bukit Panjang']
  },
  {
    id: 'tel',
    name: 'Thomson-East Coast Line',
    status: 'Smooth flow',
    tone: 'success',
    load: 54,
    trend: 'Ample standing room. Expect comfortable ride end-to-end.',
    highlights: ['Next train within 3 minutes at Woodlands', 'Direct bus bridges on standby']
  },
  {
    id: 'ccl',
    name: 'Circle Line',
    status: 'Crowd build-up',
    tone: 'warning',
    load: 81,
    trend: 'Crowd pockets around Serangoon and Paya Lebar. Allow 4 min buffer.',
    highlights: ['Additional platform staff deployed', 'Try Thomson Line transfer to Marina Bay']
  }
]

const incidents = [
  {
    title: 'Weather watch',
    description: 'Localized showers expected around Jurong East at 6.10pm. Minor door delays possible.',
    icon: Sunny,
    tone: 'info'
  },
  {
    title: 'Track maintenance complete',
    description: 'Routine works near Canberra finished ahead of schedule. Temporary slow zones cleared.',
    icon: Connection,
    tone: 'success'
  }
]
</script>

<template>
  <section id="live-tracking" class="st-section live-tracking">
    <div class="st-container">
      <header class="section-header">
        <div>
          <div class="st-pill">
            <el-icon><MapLocation /></el-icon>
            Live Tracking
          </div>
          <h2 class="st-section-title">Stay ahead with real-time train density insights</h2>
          <p class="st-section-subtitle">
            Track the pulse of the network with smart alerts and current platform conditions before
            you step onto the concourse.
          </p>
        </div>
        <el-tag type="warning" effect="plain">
          Updated at {{ liveUpdatedAt }}
        </el-tag>
      </header>

      <transition-group name="fade-slide-up" tag="div" class="st-grid two cards-grid">
        <article
          v-for="line in liveLines"
          :key="line.id"
          class="live-card st-card"
          :data-tone="line.tone"
        >
          <header class="card-header">
            <div class="title-group">
              <span class="line-name">{{ line.name }}</span>
              <el-tag :type="line.tone" round effect="dark" size="large">
                <el-icon>
                  <SuccessFilled v-if="line.tone === 'success'" />
                  <WarningFilled v-else />
                </el-icon>
                {{ line.status }}
              </el-tag>
            </div>
            <el-progress
              :percentage="line.load"
              :stroke-width="6"
              :color="line.tone === 'success' ? '#22c55e' : '#f97316'"
              striped
              :striped-flow="line.tone === 'warning'"
            />
            <span class="load-caption">Live crowd index</span>
          </header>

          <p class="trend">{{ line.trend }}</p>

          <ul class="highlights">
            <li v-for="highlight in line.highlights" :key="highlight">
              <el-icon><RefreshRight /></el-icon>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </article>
      </transition-group>

      <div class="incidents">
        <transition-group name="fade-slide-up" tag="div" class="incidents-grid">
          <div v-for="incident in incidents" :key="incident.title" class="incident st-card st-glass">
            <div class="incident-icon">
              <component :is="incident.icon" />
            </div>
            <div>
              <div class="incident-title">{{ incident.title }}</div>
              <div class="incident-description">{{ incident.description }}</div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.cards-grid {
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.live-card {
  display: grid;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.live-card::after {
  content: '';
  position: absolute;
  inset: auto -35% -35% auto;
  width: 200px;
  height: 200px;
  border-radius: 999px;
  background: radial-gradient(circle at center, rgba(249, 115, 22, 0.18), transparent 65%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 280ms ease;
}

.live-card:hover::after {
  opacity: 1;
}

.live-card[data-tone='warning']::after {
  background: radial-gradient(circle at center, rgba(194, 65, 12, 0.24), transparent 68%);
}

.card-header {
  display: grid;
  gap: 0.75rem;
}

.title-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.line-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.load-caption {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--st-muted);
}

.trend {
  margin: 0;
  color: rgba(31, 41, 55, 0.75);
  line-height: 1.6;
}

.highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.highlights li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(31, 41, 55, 0.78);
  font-size: 0.95rem;
}

.highlights li :deep(.el-icon) {
  color: var(--st-primary);
}

.incidents {
  margin-top: 1rem;
}

.incidents-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.incident {
  display: flex;
  gap: 1rem;
  align-items: center;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.incident-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(249, 115, 22, 0.12);
  color: var(--st-primary);
  font-size: 1.4rem;
}

.incident-title {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.incident-description {
  font-size: 0.9rem;
  color: var(--st-muted);
  line-height: 1.5;
}
</style>
