import { TRAIN_STATION_LINES, LINE_COLOR_MAP } from '../data/stations';

export const DEFAULT_LINE_INTERVALS = {
  default: {
    peak: [60, 180],
    shoulder: [120, 240],
    offPeak: [180, 360]
  }
};

const DEFAULT_DELAY_CONFIG = {
  enabled: true,
  probability: 0.2,
  checkEvery: 4,
  durationRangeSeconds: [180, 300]
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveLineInterval(lineIntervals, lineName, servicePeriod) {
  const lineConfig = lineIntervals[lineName] || lineIntervals.default;
  const range = lineConfig[servicePeriod] || lineConfig.offPeak || lineIntervals.default.offPeak;
  return Array.isArray(range) ? range : lineIntervals.default.offPeak;
}

function getServicePeriod(date = new Date()) {
  const hour = date.getHours();
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) return 'peak';
  if (
    (hour >= 6 && hour < 7) ||
    (hour >= 9 && hour < 11) ||
    (hour >= 16 && hour < 17) ||
    (hour >= 20 && hour < 22)
  ) {
    return 'shoulder';
  }
  return 'offPeak';
}

function generateNextArrival(lineIntervals, lineName, tailSeconds, servicePeriod) {
  const [minGap, maxGap] = resolveLineInterval(lineIntervals, lineName, servicePeriod);
  const gapSeconds = randomInt(minGap, maxGap);
  return tailSeconds + gapSeconds;
}

export function getLineColor(lineName) {
  return LINE_COLOR_MAP[lineName] || '#6b7280';
}

export function createTrainArrivalSimulator(customConfig = {}) {
  const config = {
    stationLines: TRAIN_STATION_LINES,
    lineIntervals: DEFAULT_LINE_INTERVALS,
    updateIntervalMs: 30000,
    trainsPerLine: 3,
    delay: { ...DEFAULT_DELAY_CONFIG },
    ...customConfig,
    delay: { ...DEFAULT_DELAY_CONFIG, ...(customConfig.delay || {}) }
  };

  const state = {
    arrivals: {},
    delayFlags: {},
    cycles: 0,
    intervalId: null
  };

  function ensureStation(station, lineName) {
    if (!state.arrivals[station]) {
      state.arrivals[station] = {};
    }
    if (!Array.isArray(state.arrivals[station][lineName])) {
      state.arrivals[station][lineName] = [];
    }
  }

  function seedLine(station, lineName) {
    ensureStation(station, lineName);
    const queue = state.arrivals[station][lineName];
    queue.length = 0;
    let tail = 0;
    const period = getServicePeriod();
    for (let i = 0; i < config.trainsPerLine; i += 1) {
      tail = generateNextArrival(config.lineIntervals, lineName, tail, period);
      queue.push(tail);
    }
  }

  function initialiseState() {
    Object.entries(config.stationLines).forEach(([station, lines]) => {
      lines.forEach((line) => {
        ensureStation(station, line);
        const queue = state.arrivals[station][line];
        if (!queue.length) {
          seedLine(station, line);
        } else {
          while (queue.length < config.trainsPerLine) {
            const tail = queue[queue.length - 1] || 0;
            queue.push(generateNextArrival(config.lineIntervals, line, tail, getServicePeriod()));
          }
        }
      });
    });
  }

  function pruneDelayFlags(now = Date.now()) {
    Object.keys(state.delayFlags).forEach((station) => {
      const entries = state.delayFlags[station];
      if (!entries) return;

      Object.keys(entries).forEach((line) => {
        if (entries[line] < now) {
          delete entries[line];
        }
      });

      if (!Object.keys(entries).length) {
        delete state.delayFlags[station];
      }
    });
  }

  function applyDelayIfNeeded() {
    if (!config.delay.enabled) return;
    if (state.cycles % config.delay.checkEvery !== 0) return;
    if (Math.random() > config.delay.probability) return;

    const stations = Object.keys(state.arrivals);
    if (!stations.length) return;
    const station = stations[randomInt(0, stations.length - 1)];

    const lines = Object.keys(state.arrivals[station] || {});
    if (!lines.length) return;
    const line = lines[randomInt(0, lines.length - 1)];

    const queue = state.arrivals[station][line];
    if (!queue?.length) return;

    const [minDelay, maxDelay] = config.delay.durationRangeSeconds;
    const extraSeconds = randomInt(minDelay, maxDelay);
    for (let i = 0; i < queue.length; i += 1) {
      queue[i] += extraSeconds;
    }

    if (!state.delayFlags[station]) state.delayFlags[station] = {};
    state.delayFlags[station][line] = Date.now() + extraSeconds * 1000;
  }

  function tick() {
    state.cycles += 1;
    const delta = config.updateIntervalMs / 1000;
    pruneDelayFlags();

    Object.entries(state.arrivals).forEach(([station, lines]) => {
      Object.entries(lines).forEach(([line, queue]) => {
        for (let i = 0; i < queue.length; i += 1) {
          queue[i] = Math.max(0, queue[i] - delta);
        }
        while (queue.length && queue[0] <= 0) {
          queue.shift();
        }
        while (queue.length < config.trainsPerLine) {
          const tail = queue.length ? queue[queue.length - 1] : 0;
          queue.push(generateNextArrival(config.lineIntervals, line, tail, getServicePeriod()));
        }
      });
    });

    applyDelayIfNeeded();
  }

  function start() {
    initialiseState();
    if (state.intervalId !== null) return;
    state.intervalId = setInterval(tick, config.updateIntervalMs);
    tick();
  }

  function stop() {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function getArrivals({ returnSeconds = false } = {}) {
    const snapshot = {};
    Object.entries(state.arrivals).forEach(([station, lines]) => {
      snapshot[station] = {};
      Object.entries(lines).forEach(([line, queue]) => {
        snapshot[station][line] = queue.map((seconds) =>
          returnSeconds ? Math.max(0, Math.round(seconds)) : Math.max(0, Math.ceil(seconds / 60))
        );
      });
    });
    return snapshot;
  }

  function getStationArrivals(station) {
    return getArrivals()[station] || {};
  }

  return {
    config,
    start,
    stop,
    refresh: tick,
    getArrivals,
    getStationArrivals
  };
}
