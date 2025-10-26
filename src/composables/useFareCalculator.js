import {
  fareBandsAdult,
  fareBandsSenior,
  fareBandsStudent,
  fareBandsWorkfare,
  monthlyPasses
} from '../data/fareTables';

function selectBands(type) {
  switch (type) {
    case 'primary':
    case 'secondary':
    case 'polytechnic':
      return fareBandsStudent;
    case 'senior':
    case 'disability':
      return fareBandsSenior;
    case 'workfare':
      return fareBandsWorkfare;
    case 'university':
    case 'ns':
    case 'adult':
    default:
      return fareBandsAdult;
  }
}

function fareByType(distanceKm, type) {
  const bands = selectBands(type);
  for (const band of bands) {
    if (distanceKm <= band.max) {
      return band.fare;
    }
  }
  return bands[bands.length - 1].fare;
}

function analyseMonthlyPass({ distanceKm, type, dailyTrips, workingDays }) {
  const singleFare = fareByType(distanceKm, type);
  const monthlyTotal = singleFare * dailyTrips * workingDays;
  const modes = ['train', 'bus', 'hybrid'];

  const breakdown = modes.map((mode) => {
    const cost = monthlyPasses[mode][type] ?? monthlyPasses[mode].adult;
    const savings = monthlyTotal - cost;
    return {
      mode,
      passPrice: cost,
      savings,
      worth: savings > 0
    };
  });

  return {
    singleFare,
    monthlyTotal,
    breakdown
  };
}

export function useFareCalculator() {
  return {
    fareByType,
    analyseMonthlyPass
  };
}
