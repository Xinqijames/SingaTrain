const apiKey = import.meta.env.VITE_LTA_API_KEY;

if (!apiKey) {
  console.warn('Warning: Missing VITE_LTA_API_KEY environment variable. Some features may not work. Create a .env file with: VITE_LTA_API_KEY=your_api_key_here');
}

export const LTA_API_KEY = apiKey || '';
