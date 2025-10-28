<script setup lang="ts">
import { computed } from 'vue'
import { Coordinate, BellFilled, ChatDotRound, UserFilled } from '@element-plus/icons-vue'

const meetups = [
  {
    id: 'team-sync',
    title: 'Project team sync',
    meetingPoint: 'Paya Lebar MRT · Exit C',
    arrivalWindow: '6:10 – 6:15 PM',
    note: 'All rides synced. Rain shelter path reserved.',
    participants: [
      { name: 'Alicia', origin: 'Jurong East', eta: '6:05 PM', mode: 'North South Line', color: '#f97316' },
      { name: 'Dev', origin: 'HarbourFront', eta: '6:08 PM', mode: 'Circle Line', color: '#facc15' },
      { name: 'Marcus', origin: 'Serangoon', eta: '6:11 PM', mode: 'NEL + Circle', color: '#fb923c' }
    ],
    actions: ['Share boarding reminders', 'Notify on first arrival'],
    chats: [
      { user: 'Alicia', message: 'I’ll board the 5:42pm North South Line from Jurong East.' },
      { user: 'Dev', message: 'Copy that. Bringing coffee from Tiong Bahru Bakery.' }
    ]
  },
  {
    id: 'family',
    title: 'Family dinner meetup',
    meetingPoint: 'Dhoby Ghaut MRT · Basement concourse',
    arrivalWindow: '5:45 – 5:55 PM',
    note: 'Grandparents assisted travel enabled',
    participants: [
      { name: 'Mum', origin: 'Bukit Batok', eta: '5:46 PM', mode: 'North South Line', color: '#34d399' },
      { name: 'Dad', origin: 'Pasir Ris', eta: '5:49 PM', mode: 'East West Line', color: '#60a5fa' },
      { name: 'Sophie', origin: 'HarbourFront', eta: '5:51 PM', mode: 'NEL + NSL', color: '#f472b6' }
    ],
    actions: ['Enable escalator preference', 'Broadcast arrival status'],
    chats: [
      { user: 'Dad', message: 'Switching to first car for easier platform exit.' },
      { user: 'Sophie', message: 'Circle line looks clear, see you soon!' }
    ]
  }
]

const activeMeetupCount = computed(() => meetups.length)
</script>

<template>
  <section id="meet-up" class="st-section meetup-section">
    <div class="st-container">
      <div class="head">
        <div class="st-pill">
          <el-icon><Coordinate /></el-icon>
          Meet-up Planner
        </div>
        <h2 class="st-section-title">Keep your crew in sync without the frantic texting</h2>
        <p class="st-section-subtitle">
          SingaTrain aligns arrivals across lines, shares smart reminders, and surfaces gentle
          nudges so your meet-ups start on time.
        </p>
        <el-tag type="success" effect="dark" round>
          {{ activeMeetupCount }} meet-ups tracking live
        </el-tag>
      </div>

      <div class="meetup-grid">
        <transition-group name="fade-slide-up" tag="div" class="meetup-cards">
          <article v-for="meetup in meetups" :key="meetup.id" class="meetup-card st-card">
            <header class="meetup-header">
              <div>
                <h3>{{ meetup.title }}</h3>
                <div class="meeting-point">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ meetup.meetingPoint }}</span>
                </div>
              </div>
              <el-tag type="primary" effect="dark">{{ meetup.arrivalWindow }}</el-tag>
            </header>

            <div class="participants">
              <div
                v-for="person in meetup.participants"
                :key="person.name"
                class="participant"
              >
                <el-avatar :style="{ backgroundColor: person.color }">
                  {{ person.name.charAt(0) }}
                </el-avatar>
                <div class="participant-meta">
                  <div class="name">{{ person.name }}</div>
                  <div class="details">{{ person.origin }} · {{ person.mode }}</div>
                </div>
                <div class="eta">
                  <span>{{ person.eta }}</span>
                  <el-tag size="small" type="warning" round>ETA</el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="actions">
              <div v-for="action in meetup.actions" :key="action" class="action-pill">
                <el-icon><BellFilled /></el-icon>
                <span>{{ action }}</span>
              </div>
            </div>

            <div class="chat-preview st-glass">
              <header>
                <el-icon><ChatDotRound /></el-icon>
                <span>Live coordination</span>
              </header>
              <ul>
                <li v-for="chat in meetup.chats" :key="chat.user + chat.message">
                  <strong>{{ chat.user }}:</strong>
                  <span>{{ chat.message }}</span>
                </li>
              </ul>
            </div>

            <el-alert :title="meetup.note" type="success" :closable="false" show-icon />
          </article>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: grid;
  gap: 0.75rem;
  align-items: start;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.meetup-grid {
  display: grid;
}

.meetup-cards {
  display: grid;
  gap: clamp(1rem, 3vw, 1.75rem);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.meetup-card {
  display: grid;
  gap: 1.25rem;
}

.meetup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.meetup-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.meeting-point {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--st-muted);
  font-size: 0.95rem;
}

.participants {
  display: grid;
  gap: 0.75rem;
}

.participant {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
}

.participant-meta {
  display: grid;
  gap: 0.25rem;
}

.name {
  font-weight: 600;
}

.details {
  font-size: 0.85rem;
  color: rgba(31, 41, 55, 0.6);
}

.eta {
  display: grid;
  gap: 0.25rem;
  justify-items: end;
  font-weight: 600;
  color: var(--st-primary-dark);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(249, 115, 22, 0.12);
  color: var(--st-primary);
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.chat-preview {
  border-radius: var(--st-radius-md);
  padding: 0.9rem;
  border: 1px solid rgba(249, 115, 22, 0.14);
  display: grid;
  gap: 0.6rem;
}

.chat-preview header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--st-primary);
}

.chat-preview ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
  font-size: 0.9rem;
  color: rgba(31, 41, 55, 0.7);
}
</style>
