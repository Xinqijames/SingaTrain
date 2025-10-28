<script setup>
import { useAppState } from '../composables/useAppState';

const { setActiveTab } = useAppState();

const goToLive = () => setActiveTab('live');
const goToRoute = () => setActiveTab('route');
</script>

<template>
  <v-container class="hero-container" fluid>
    <v-row class="hero-row" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <div class="hero-copy">
          <v-chip color="primary" variant="tonal" label size="small" class="hero-chip">
            Smart journey planning
          </v-chip>
          <h1>Smart MRT Navigation for Singapore</h1>
          <p>
            SingaTrain brings live train telemetry, fare insights, and route intelligence into one
            calm, commuter‑centric experience.
          </p>
          <div class="hero-actions">
            <v-btn color="primary" class="hero-btn" @click="goToLive">
              Live Tracker
            </v-btn>
            <v-btn
              class="hero-btn"
              variant="outlined"
              color="primary"
              @click="goToRoute"
            >
              Plan Route
            </v-btn>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div class="hero-visual">
          <v-sheet class="visual-frame" elevation="2">
            <v-img src="/MRT-Map.png" alt="Singapore MRT network map" cover />
          </v-sheet>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.hero-container {
  padding-block: clamp(48px, 7vw, 96px);
  max-width: 1240px;
  margin: 0 auto;
}

.hero-row {
  gap: 24px;
}

.hero-copy {
  display: grid;
  gap: 16px;
  max-width: 520px;
}

.hero-chip {
  width: fit-content;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}

.hero-copy h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.hero-copy p {
  margin: 0;
  font-size: 18px;
  color: rgba(var(--v-theme-text), 0.72);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-btn {
  min-width: 160px;
}

.hero-visual {
  display: flex;
  justify-content: center;
  padding-inline: clamp(0px, 4vw, 24px);
}

.visual-frame {
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-border), 0.6);
  min-height: clamp(320px, 40vw, 420px);
  width: 100%;
}

@media (max-width: 960px) {
  .hero-actions {
    flex-direction: column;
  }
  .hero-btn {
    width: 100%;
  }
  .hero-container {
    padding-block: 48px;
  }
}
</style>
