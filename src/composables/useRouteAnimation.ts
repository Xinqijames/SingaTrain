import { ref } from 'vue';

const ARRIVAL_EVENT = 'route-animation-arrived';
const HOP_MS = 950;

export function useRouteAnimation() {
  const isPlaying = ref(false);
  const progressIndex = ref(0);
  const segmentProgress = ref(0);
  const totalStops = ref(0);
  const routeStationIds = ref<string[]>([]);

  let rafId: number | null = null;
  let tickLast = 0;
  let renderer: ((idx: number) => void) | null = null;

  function attachRenderer(fn: (idx: number) => void) {
    renderer = fn;
  }

  function detachRenderer() {
    renderer = null;
  }

  function cancel() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resetAnimation() {
    cancel();
    progressIndex.value = 0;
    segmentProgress.value = 0;
    isPlaying.value = false;
    renderer?.(progressIndex.value);
  }

  function startAnimation() {
    if (!routeStationIds.value.length) return;
    cancel();
    totalStops.value = routeStationIds.value.length;
    progressIndex.value = Math.min(progressIndex.value, totalStops.value - 1);
    segmentProgress.value = 0;
    renderer?.(progressIndex.value);

    if (routeStationIds.value.length <= 1) {
      window.dispatchEvent(new CustomEvent(ARRIVAL_EVENT));
      return;
    }

    isPlaying.value = true;
    tickLast = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function pauseAnimation() {
    isPlaying.value = false;
    cancel();
  }

  function loop(now: number) {
    if (!isPlaying.value) return;
    const dt = now - tickLast;
    tickLast = now;
    segmentProgress.value += dt / HOP_MS;

    while (segmentProgress.value >= 1 && isPlaying.value) {
      segmentProgress.value -= 1;
      if (progressIndex.value < Math.max(routeStationIds.value.length - 1, 0)) {
        progressIndex.value += 1;
        renderer?.(progressIndex.value);
      } else {
        arrive();
        return;
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function arrive() {
    cancel();
    isPlaying.value = false;
    segmentProgress.value = 0;
    window.dispatchEvent(new CustomEvent(ARRIVAL_EVENT));
  }

  return {
    isPlaying,
    progressIndex,
    segmentProgress,
    totalStops,
    routeStationIds,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    attachRenderer,
    detachRenderer
  };
}
