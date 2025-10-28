<script setup lang="ts">
import { Compass, Opportunity, MapLocation, Timer } from '@element-plus/icons-vue'

const stats = [
  {
    label: 'Active trains',
    value: '118',
    caption: '+12 vs typical weekday',
    icon: MapLocation
  },
  {
    label: 'Avg. wait time',
    value: '2.5 min',
    caption: 'Across core interchanges',
    icon: Timer
  },
  {
    label: 'Peak load',
    value: '68%',
    caption: 'Down 5% from yesterday',
    icon: Opportunity
  }
]

const liveHighlights = [
  {
    title: 'Downtown Line',
    message: 'Trains running smoothly. Expect light crowds.',
    eta: 'Next train in 2 mins',
    tone: 'success'
  },
  {
    title: 'Thomson-East Coast Line',
    message: 'Additional trains deployed between Woodlands & Orchard.',
    eta: 'Next train in 3 mins',
    tone: 'info'
  },
  {
    title: 'Circle Line',
    message: 'Minor platform crowding at Serangoon. Staff on standby.',
    eta: 'Next train in 4 mins',
    tone: 'warning'
  }
]
</script>

<template>
  <section id="overview" class="hero st-section">
    <div class="st-container hero-grid">
      <transition name="fade-slide-up" appear>
        <div class="hero-copy st-card st-glass">
          <div class="st-pill">
            <el-icon><Compass /></el-icon>
            All-in-one MRT companion
          </div>
          <h1>
            Real-time insights for every Singapore MRT journey.
          </h1>
          <p class="hero-lead">
            SingaTrain combines live train telemetry, fare intelligence, smart routing, and meet-up
            planning so you and your friends arrive together, calmer.
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" color="var(--st-primary)">
              Launch Route Planner
            </el-button>
            <el-button class="ghost" size="large" text>
              View live network map
            </el-button>
          </div>
          <transition-group name="fade-slide-up" tag="div" class="hero-stats">
            <div v-for="stat in stats" :key="stat.label" class="stat-card">
              <div class="stat-icon">
                <component :is="stat.icon" />
              </div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-caption">{{ stat.caption }}</div>
            </div>
          </transition-group>
        </div>
      </transition>

      <transition name="fade-slide-up" appear>
        <div class="hero-panel st-card">
          <div class="hero-panel__header">
            <div>
              <div class="panel-title">Live network snapshot</div>
              <div class="panel-subtitle">Updated moments ago</div>
            </div>
            <el-tag type="info" effect="dark">Smooth commute outlook</el-tag>
          </div>
          <el-timeline class="hero-timeline">
            <el-timeline-item
              v-for="item in liveHighlights"
              :key="item.title"
              :type="item.tone"
              :timestamp="item.eta"
              hollow
            >
              <div class="timeline-card">
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-message">{{ item.message }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <div class="hero-panel__footer">
            <el-progress :percentage="82" :stroke-width="6" status="success" />
            <div class="progress-copy">
              <strong>Network Reliability</strong>
              <span>82% of trains arriving within 2 minutes of schedule.</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
.hero-grid {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: stretch;
}

@media (min-width: 940px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  }
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vw, 2rem);
  padding: clamp(1.75rem, 4vw, 2.5rem);
}

h1 {
  font-size: clamp(2rem, 4vw, 2.6rem);
  letter-spacing: -0.02em;
  margin: 0;
}

.hero-lead {
  margin: 0;
  color: rgba(31, 41, 55, 0.78);
  font-size: clamp(1.05rem, 2.5vw, 1.18rem);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-actions .ghost {
  color: var(--st-primary);
  font-weight: 600;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: clamp(1rem, 3vw, 1.5rem);
}

.stat-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-radius: var(--st-radius-md);
  padding: 1.2rem;
  display: grid;
  gap: 0.35rem;
  box-shadow: 0 16px 40px -32px rgba(249, 115, 22, 0.5);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 38px -24px rgba(194, 65, 12, 0.45);
}

.stat-icon {
  font-size: 1.4rem;
  color: var(--st-primary);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
}

.stat-caption {
  font-size: 0.85rem;
  color: var(--st-muted);
}

.hero-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: -40% 65% 18% -40%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.18), transparent 65%);
  pointer-events: none;
}

.hero-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.panel-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.panel-subtitle {
  font-size: 0.9rem;
  color: var(--st-muted);
}

.hero-timeline {
  margin-inline-start: 0.2rem;
}

.timeline-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--st-radius-md);
  padding: 1rem 1.1rem;
  border: 1px solid rgba(249, 115, 22, 0.12);
  backdrop-filter: blur(6px);
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.timeline-message {
  font-size: 0.95rem;
  color: rgba(31, 41, 55, 0.72);
  line-height: 1.5;
}

.hero-panel__footer {
  display: grid;
  gap: 0.75rem;
}

.progress-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: rgba(31, 41, 55, 0.75);
}

.progress-copy strong {
  font-size: 1rem;
  color: var(--st-primary-dark);
}
</style>
