const apiKey = import.meta.env.VITE_LTA_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_LTA_API_KEY environment variable');
}

export const LTA_API_KEY = apiKey;
