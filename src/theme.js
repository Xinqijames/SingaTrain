import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const lightTheme = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    primary: '#f97316',
    accent: '#f97316',
    'primary-darken-1': '#c2410c',
    secondary: '#1e1e1e',
    info: '#2563eb',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e5e7eb',
    text: '#1e1e1e'
  }
};

const darkTheme = {
  dark: true,
  colors: {
    background: '#0f1115',
    surface: '#1a1d24',
    primary: '#f97316',
    accent: '#f97316',
    'primary-darken-1': '#ff8a3a',
    secondary: '#ffffff',
    info: '#60a5fa',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    border: '#2d3139',
    text: '#ffffff'
  }
};

export function createSingaTrainVuetify() {
  return createVuetify({
    theme: {
      defaultTheme: 'lightTheme',
      themes: {
        lightTheme,
        darkTheme
      },
      variations: {
        colors: ['primary'],
        lighten: 1,
        darken: 2
      }
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi }
    },
    defaults: {
      VBtn: {
        height: 48,
        rounded: 'lg',
        class: 'text-none font-weight-semibold',
        style: 'letter-spacing:0.01em'
      },
      VSheet: {
        rounded: 'lg'
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable'
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable'
      },
      VCard: {
        rounded: 'lg',
        elevation: 1
      },
      VAppBar: {
        elevation: 0,
        flat: true
      }
    }
  });
}
