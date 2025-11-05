# 🚆 SingaTrain

<div align="center">

![SingaTrain Logo](public/singatrainlogo.png)

**A comprehensive Singapore MRT navigation and planning application**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4.21-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.7.3-1867C0?style=flat&logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack) • [Project-Structure](#project-structure) • [Configuration](#configuration)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## 🎯 About

**SingaTrain** delivers a polished, data-driven experience for navigating Singapore's MRT network. The Vue 3 single-page application combines animated route planning, dynamic fare projections, simulated live train telemetry, and collaborative meetup tooling backed by Firebase and the LTA DataMall API.

---

## ✨ Features

### 🗺️ Route Planner
- **Smart routing** between any pair of MRT stations with station autocomplete
- **Animated map view** powered by Mapbox GL with live train marker simulation
- **Journey breakdown** detailing per-line segments, transfers, duration, and distance
- **Saved context** so the last planned route remains cached during the session

### 💳 Fare Calculator
- **Commuter profiles** covering adult, concession, student, NS, and Workfare fares
- **Fare charts** rendered with Chart.js to highlight optimal travel passes
- **Cost analysis** including distance-based estimates and recommended pass selection

### 🚉 Live Train Tracker
- **LTA DataMall integration** for service alerts, coupled with simulated arrival boards
- **Line-aware crowd levels** with colour-coded status indicators
- **Favorite stations** with Firebase-backed persistence for authenticated users
- **First & last train timings** surfaced per line for quick reference

### 👥 Meetup Planner
- **Multi-origin meetups** that evaluate equitable MRT meetup locations
- **Travel time balancing** with individual journey summaries and line colours
- **Interactive visualization** that plots all participants and the suggested station

### 📊 Dashboard & Extras
- **Personalised landing dashboard** featuring shortcuts to all modules
- **Immersive loading and reveal animations** built with GSAP and custom Three.js scenes
- **Responsive Vuetify UI** paired with Bootstrap utility classes for layout polish

---

## 🚀 Installation

### Prerequisites

- **Node.js 18+** (tested with Node 18 LTS)
- **npm** (ships with Node) or **yarn**
- **Git**

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Xinqijames/SingaTrain.git
   cd SingaTrain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   VITE_LTA_API_KEY=your_lta_datamall_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id   # optional, required if Analytics is enabled
   ```
   `config.js` automatically reads `VITE_LTA_API_KEY` and warns at runtime if it is missing.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit `http://localhost:5173` in your browser.

6. **Build for production (optional)**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📖 Usage

- Use the navigation rail to switch between dashboard, live tracker, route planner, fare calculator, meetup finder, profile, and timetable views.
- Plan a trip by selecting an origin and destination; the map animates the journey and displays transfer details.
- Calculate fares by selecting a commuter category; tap the recommended pass chip for insight into savings.
- Monitor live status by choosing a station and line; refresh to fetch new alerts and update simulations.
- Add multiple participants in the meetup planner to determine the fairest station for everyone.
- Sign in (if Firebase auth is enabled) to save favourite stations and personalised dashboard preferences.

---

## 🛠️ Tech Stack

### Core
- **Vue 3.4.21** – Composition API with script setup
- **Vite 6.4.1** – Lightning-fast dev server and bundler
- **Vuetify 3.7.3** – Material-inspired component library
- **Bootstrap 5.3.3** – Utility classes for rapid layout tuning

### Data & APIs
- **Firebase 12.4.0** – Authentication and persistence
- **LTA DataMall API** – Train service alerts

### Mapping & Visualisation
- **Mapbox GL 2.15.0** – MRT network rendering and route animation
- **Chart.js 4.4.6** – Fare comparison visuals
- **Three.js 0.162.0** – Train reveal hero animation

### Motion & UX
- **GSAP 3.12.5** – Micro-interactions and transitions
- **AOS 2.3.4** – Scroll-based animation primitives
- **@vueuse/core 11.3.0** – Composable utilities

---

## 📁 Project Structure

```
SingaTrain/
├── MrtFootage.mp4              # Background video
├── config.js                   # Reads env variables (VITE_LTA_API_KEY)
├── public/
│   ├── railrouter/             # Prebuilt RailRouter assets
│   ├── sg-rail.geojson         # Singapore MRT network geometry
│   ├── singatrain.png          # Marketing artwork
│   └── singatrainlogo.png      # App favicon & README branding
├── src/
│   ├── App.vue                 # Root application shell
│   ├── main.js                 # Vite entry point
│   ├── assets/
│   │   └── main.css            # Global styles
│   ├── components/
│   │   ├── Dashboard.vue
│   │   ├── FareCalculator.vue
│   │   ├── FirstLastTrain.vue
│   │   ├── LiveTracker.vue
│   │   ├── LoadingPage.vue
│   │   ├── MeetupFinder.vue
│   │   ├── Navbar.vue
│   │   ├── Profile.vue
│   │   ├── RoutePlanner.vue
│   │   ├── TextGenerateEffect.vue
│   │   ├── TrainReveal.vue
│   │   └── ui/
│   │       └── BackgroundLines.vue
│   ├── composables/
│   │   ├── useAppState.js
│   │   ├── useFareCalculator.js
│   │   ├── useFirestore.js
│   │   ├── useRouteAnimation.ts
│   │   ├── useRoutePlanner.js
│   │   └── useTrainAPI.js
│   ├── data/
│   │   ├── fareTables.js
│   │   ├── stationCoordinates.js
│   │   ├── stations.js
│   │   └── trainTimings.js
│   ├── firebase.js             # Firebase client bootstrap
│   ├── styles/
│   │   ├── theme.css
│   │   └── utilities.css
│   └── theme.js                # Dynamic theme definitions
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Configuration

### LTA DataMall
1. Register at [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en.html).
2. Generate an API key.
3. Place the key in `.env` as `VITE_LTA_API_KEY`. `config.js` will surface a console warning when it is missing.

### Mapbox
1. Create a Mapbox account and obtain an access token.
2. Update the `MAPBOX_TOKEN` constant in `src/components/MeetupFinder.vue` with your token (environment variable support is planned).
3. Restart the dev server so the updated token is picked up.

### Firebase
1. Create a Firebase project via the [Firebase Console](https://console.firebase.google.com/).
2. Enable Authentication and Firestore if you intend to use favourites and profiles.
3. Populate the Firebase values shown in the `.env` template above. Optional analytics requires `VITE_FIREBASE_MEASUREMENT_ID`.

---

## 📝 License

No explicit licence has been published yet. Please contact the maintainers before redistributing the code.

---

## 🙏 Acknowledgments

- **Land Transport Authority (LTA)** for transport data access
- **Mapbox** for mapping infrastructure
- **Firebase** for the developer tooling ecosystem
- Everyone who has contributed feedback and improvements to SingaTrain

---

## 📧 Contact

- **Project Repository**: [github.com/Xinqijames/SingaTrain](https://github.com/Xinqijames/SingaTrain)
- **Issues**: [github.com/Xinqijames/SingaTrain/issues](https://github.com/Xinqijames/SingaTrain/issues)

---

<div align="center">

**Made with ❤️ for Singapore commuters**

</div>
