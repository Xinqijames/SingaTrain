<script setup lang="ts">
import { ref } from 'vue'
import { Timer, Notebook, AlarmClock } from '@element-plus/icons-vue'

interface TimingRow {
  station: string
  firstTrain: string
  lastTrain: string
  towards: string
}

interface LineTimings {
  id: string
  name: string
  color: string
  note: string
  data: TimingRow[]
}

const lineTimings: LineTimings[] = [
  {
    id: 'nsl',
    name: 'North South Line',
    color: '#f97316',
    note: 'City-bound services start as early as 5:15am from northern stations.',
    data: [
      { station: 'Jurong East', firstTrain: '05:19', lastTrain: '23:51', towards: 'Marina South Pier' },
      { station: 'Woodlands', firstTrain: '05:30', lastTrain: '23:45', towards: 'Marina South Pier' },
      { station: 'Ang Mo Kio', firstTrain: '05:24', lastTrain: '00:02', towards: 'Jurong East' },
      { station: 'City Hall', firstTrain: '05:34', lastTrain: '00:21', towards: 'Jurong East' }
    ]
  },
  {
    id: 'ewl',
    name: 'East West Line',
    color: '#0ea5e9',
    note: 'Changi bound commuters after midnight should transfer at Tanah Merah.',
    data: [
      { station: 'Pasir Ris', firstTrain: '05:15', lastTrain: '23:50', towards: 'Tuas Link' },
      { station: 'Bedok', firstTrain: '05:24', lastTrain: '00:16', towards: 'Tuas Link' },
      { station: 'City Hall', firstTrain: '05:36', lastTrain: '00:29', towards: 'Tuas Link' },
      { station: 'Tampines', firstTrain: '05:19', lastTrain: '23:58', towards: 'Pasir Ris' }
    ]
  },
  {
    id: 'dtl',
    name: 'Downtown Line',
    color: '#38bdf8',
    note: 'Late-night short-working trips end at Expo; check in-app alerts after 11pm.',
    data: [
      { station: 'Bukit Panjang', firstTrain: '05:42', lastTrain: '00:09', towards: 'Expo' },
      { station: 'Bugis', firstTrain: '05:51', lastTrain: '00:16', towards: 'Expo' },
      { station: 'MacPherson', firstTrain: '05:39', lastTrain: '00:12', towards: 'Bukit Panjang' },
      { station: 'Expo', firstTrain: '05:40', lastTrain: '23:50', towards: 'Bukit Panjang' }
    ]
  },
  {
    id: 'tel',
    name: 'Thomson-East Coast Line',
    color: '#a855f7',
    note: 'Most stations provide last train updates 15 minutes before closure.',
    data: [
      { station: 'Woodlands North', firstTrain: '05:39', lastTrain: '23:54', towards: 'Gardens by the Bay' },
      { station: 'Springleaf', firstTrain: '05:44', lastTrain: '23:46', towards: 'Woodlands North' },
      { station: 'Caldecott', firstTrain: '05:51', lastTrain: '23:56', towards: 'Gardens by the Bay' },
      { station: 'Orchard', firstTrain: '05:44', lastTrain: '23:59', towards: 'Gardens by the Bay' }
    ]
  }
]

const activePanels = ref(['nsl'])
</script>

<template>
  <section id="train-timings" class="st-section train-timings">
    <div class="st-container">
      <div class="header">
        <div class="st-pill">
          <el-icon><Timer /></el-icon>
          First &amp; Last Trains
        </div>
        <h2 class="st-section-title">Plan around first and last trains to never miss the last ride</h2>
        <p class="st-section-subtitle">
          Static schedules for each MRT line, refreshed every timetable release. Use these timings to
          coordinate early airport transfers or late-night meet-ups.
        </p>
      </div>

      <el-collapse v-model="activePanels" class="timings-collapse">
        <el-collapse-item
          v-for="line in lineTimings"
          :key="line.id"
          :name="line.id"
        >
          <template #title>
            <div class="collapse-title">
              <span class="dot" :style="{ background: line.color }"></span>
              <span>{{ line.name }}</span>
            </div>
          </template>

          <div class="line-content st-card st-glass">
            <div class="line-note">
              <el-icon><Notebook /></el-icon>
              <span>{{ line.note }}</span>
            </div>
            <el-table :data="line.data" style="width: 100%" size="small" border fit>
              <el-table-column prop="station" label="Station" />
              <el-table-column prop="firstTrain" label="First train" width="130" />
              <el-table-column prop="lastTrain" label="Last train" width="130" />
              <el-table-column prop="towards" label="Direction" />
            </el-table>
            <div class="line-footnote">
              <el-icon><AlarmClock /></el-icon>
              <span>
                Arrive at the platform at least 2 minutes before last train timings to clear the
                gates comfortably.
              </span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </section>
</template>

<style scoped>
.header {
  display: grid;
  gap: 0.75rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.timings-collapse :deep(.el-collapse-item__header) {
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 0.5rem;
}

.timings-collapse :deep(.el-collapse-item__arrow) {
  color: var(--st-primary);
}

.collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.line-content {
  margin-top: 0.9rem;
  display: grid;
  gap: 0.9rem;
}

.line-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(31, 41, 55, 0.7);
}

.line-footnote {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--st-muted);
}
</style>
