<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { TabsPaneContext } from 'element-plus'

const props = defineProps<{
  sections: Array<{
    id: string
    label: string
    icon: any
  }>
  activeSection: string
}>()

const emit = defineEmits<{
  (e: 'navigate', sectionId: string): void
}>()

const localActive = ref(props.activeSection)
const isScrolled = ref(false)

watch(
  () => props.activeSection,
  value => {
    localActive.value = value
  }
)

const handleTabClick = (tab: TabsPaneContext | { paneName?: string | number }) => {
  const target = tab?.paneName ?? localActive.value
  emit('navigate', String(target))
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 16
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="['app-navbar', { 'is-scrolled': isScrolled }]">
    <div class="st-container nav-inner">
      <div class="brand">
        <div class="brand-logo">ST</div>
        <div class="brand-text">
          <span class="brand-title">SingaTrain</span>
          <span class="brand-subtitle">Smarter, calmer commutes</span>
        </div>
      </div>
      <el-tabs
        v-model="localActive"
        class="nav-tabs"
        @tab-click="handleTabClick"
        stretch
        type="card"
      >
        <el-tab-pane
          v-for="section in props.sections"
          :key="section.id"
          :name="section.id"
        >
          <template #label>
            <span class="tab-label">
              <component :is="section.icon" class="tab-icon" />
              <span class="tab-text">{{ section.label }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(255, 244, 230, 0.88);
  transition: box-shadow 220ms ease, background-color 220ms ease;
}

.app-navbar.is-scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14px 36px -28px rgba(194, 65, 12, 0.75);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(1rem, 3vw, 2rem);
  padding-block: clamp(0.65rem, 2vw, 1rem);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--st-primary), var(--st-primary-dark));
  display: grid;
  place-items: center;
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.brand-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--st-muted);
}

.nav-tabs {
  max-width: min(100%, 680px);
  margin-left: auto;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  color: var(--st-text);
}

.tab-icon {
  font-size: 1.15rem;
  color: var(--st-primary);
}

.tab-text {
  white-space: nowrap;
}

@media (max-width: 860px) {
  .nav-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-tabs {
    margin-inline: -0.5rem;
  }

  .tab-label {
    justify-content: center;
  }
}

@media (max-width: 540px) {
  .nav-tabs :deep(.el-tabs__header) {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .tab-text {
    font-size: 0.85rem;
  }

  .tab-icon {
    font-size: 1rem;
  }
}
</style>
