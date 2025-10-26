import { MRT_STATIONS, ALL_STATIONS } from '../data/stations';

const loopLines = new Set(['BPL', 'SWPL', 'SEPL', 'PEPLRT', 'PWLRT']);
const graph = new Map();
let graphBuilt = false;

function nodeKey(station, line) {
  return `${station} (${line})`;
}

function addEdge(a, b, weight = 1) {
  if (!graph.has(a)) graph.set(a, []);
  if (!graph.has(b)) graph.set(b, []);
  graph.get(a).push({ to: b, weight });
  graph.get(b).push({ to: a, weight });
}

function buildGraph() {
  if (graphBuilt) return;

  Object.entries(MRT_STATIONS).forEach(([line, stations]) => {
    stations.forEach((station, index) => {
      const key = nodeKey(station, line);

      if (index > 0) {
        addEdge(key, nodeKey(stations[index - 1], line), 1);
      }
      if (index < stations.length - 1) {
        addEdge(key, nodeKey(stations[index + 1], line), 1);
      }

      if (loopLines.has(line) && index === stations.length - 1 && index > 0) {
        const firstNonInterchange = nodeKey(stations[1], line);
        addEdge(key, firstNonInterchange, 1);
      }
      if (loopLines.has(line) && index === 1 && stations.length > 2) {
        const lastStation = nodeKey(stations[stations.length - 1], line);
        addEdge(key, lastStation, 1);
      }
    });
  });

  const stationToLines = new Map();
  Object.entries(MRT_STATIONS).forEach(([line, stations]) => {
    stations.forEach((station) => {
      if (!stationToLines.has(station)) {
        stationToLines.set(station, []);
      }
      stationToLines.get(station).push(line);
    });
  });

  stationToLines.forEach((lines, station) => {
    if (lines.length < 2) return;
    for (let i = 0; i < lines.length; i += 1) {
      for (let j = i + 1; j < lines.length; j += 1) {
        addEdge(nodeKey(station, lines[i]), nodeKey(station, lines[j]), 0.5);
      }
    }
  });

  graphBuilt = true;
}

function shortestPath(startStation, endStation) {
  if (!startStation || !endStation) return null;
  buildGraph();

  const startNodes = Object.keys(MRT_STATIONS)
    .filter((line) => MRT_STATIONS[line].includes(startStation))
    .map((line) => nodeKey(startStation, line));

  const endNodes = Object.keys(MRT_STATIONS)
    .filter((line) => MRT_STATIONS[line].includes(endStation))
    .map((line) => nodeKey(endStation, line));

  if (!startNodes.length || !endNodes.length) {
    return null;
  }

  const distances = new Map();
  const previous = new Map();
  const pq = [];

  function push(node, distance) {
    pq.push({ node, distance });
    pq.sort((a, b) => a.distance - b.distance);
  }

  graph.forEach((_, node) => distances.set(node, Infinity));
  startNodes.forEach((node) => {
    distances.set(node, 0);
    push(node, 0);
  });

  const endSet = new Set(endNodes);
  let target = null;

  while (pq.length) {
    const { node, distance } = pq.shift();
    if (distance !== distances.get(node)) continue;
    if (endSet.has(node)) {
      target = node;
      break;
    }
    const neighbours = graph.get(node) || [];
    neighbours.forEach(({ to, weight }) => {
      const newDistance = distance + weight;
      if (newDistance < distances.get(to)) {
        distances.set(to, newDistance);
        previous.set(to, node);
        push(to, newDistance);
      }
    });
  }

  if (!target) {
    return null;
  }

  const path = [];
  let current = target;
  while (current) {
    const match = current.match(/^(.*) \((.*)\)$/);
    path.unshift({
      station: match ? match[1] : current,
      line: match ? match[2] : '?'
    });
    current = previous.get(current);
  }

  return {
    steps: path,
    totalWeight: distances.get(target)
  };
}

function estimateTimeMinutes(totalWeight) {
  const stopsApprox = Math.max(0, Math.round(totalWeight));
  const transfersApprox = Math.max(0, Math.round((totalWeight - stopsApprox) * 2));
  return Math.round(stopsApprox * 2.2 + transfersApprox * 4 + 3);
}

function estimateDistanceKm(totalWeight) {
  const stops = Math.max(0, Math.round(totalWeight));
  const transfers = Math.round((totalWeight - stops) * 2);
  return Number((stops * 1.1 + transfers * 0.3).toFixed(1));
}

function getStopsBetween(fromStep, toStep) {
  const lineStations = MRT_STATIONS[fromStep.line] || [];
  const fromIndex = lineStations.indexOf(fromStep.station);
  const toIndex = lineStations.indexOf(toStep.station);
  return Math.abs(toIndex - fromIndex);
}

function summariseSegments(path) {
  if (!path?.steps?.length) return [];
  const segments = [];

  let index = 0;
  while (index < path.steps.length - 1) {
    const current = path.steps[index];
    let j = index + 1;
    while (j < path.steps.length && path.steps[j].line === current.line) {
      j += 1;
    }
    const last = path.steps[j - 1];
    segments.push({
      line: current.line,
      from: current.station,
      to: last.station,
      stops: getStopsBetween(current, last)
    });
    index = j;
  }

  return segments;
}

export function useRoutePlanner() {
  return {
    allStations: ALL_STATIONS,
    shortestPath,
    estimateTimeMinutes,
    estimateDistanceKm,
    summariseSegments
  };
}
