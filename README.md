# 🚆 SingaTrain

<div align="center">

![SingaTrain Logo](public/logo.png)

**A comprehensive Singapore MRT navigation and planning application**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4.21-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.7.3-1867C0?style=flat&logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**SingaTrain** is a modern, feature-rich web application designed to enhance the Singapore MRT commuting experience. Built with Vue.js and powered by real-time data, it provides comprehensive tools for route planning, fare calculation, train tracking, and meetup coordination across Singapore's extensive rail network.

### Why SingaTrain?

- 🚀 **Fast & Responsive**: Built with Vite for lightning-fast performance
- 🎨 **Modern UI**: Sleek design with smooth animations and transitions
- 📱 **Mobile-First**: Fully responsive design for all devices
- 🗺️ **Interactive Maps**: Powered by Mapbox GL for stunning visualizations
- 📊 **Real-Time Data**: Live train arrival times and service updates
- 🎯 **Smart Algorithms**: Optimized pathfinding for the fastest routes

---

## ✨ Features

### 🗺️ Route Planner
- **Smart Route Planning**: Find the fastest MRT routes between any two stations
- **Interactive Map**: Visualize your journey with animated route display
- **Real-Time Simulation**: Watch a train marker animate along your planned route
- **Detailed Segments**: View line-by-line journey breakdown with stops and transfers
- **Time & Distance**: Accurate estimates for travel time and distance
- **Autocomplete Search**: Type-ahead station search for quick selection

### 💰 Fare Calculator
- **Comprehensive Fare Types**: Calculate fares for all commuter categories:
  - Adult (Standard)
  - Senior Citizen
  - Persons with Disabilities
  - Workfare Concession
  - Students (Primary, Secondary, Polytechnic, University)
  - National Serviceman
- **Visual Fare Breakdown**: Color-coded fare cards for easy comparison
- **Distance-Based Pricing**: Accurate fare calculation based on journey distance
- **Route Details**: View complete route information alongside fare estimates

### 🚊 Live Train Tracker
- **Real-Time Arrivals**: Live train arrival times for all MRT stations
- **Station Selection**: Quick access to any station on the network
- **Multiple Trains**: View arrival times for multiple upcoming trains
- **Service Status**: Real-time updates on train services and disruptions
- **Color-Coded Lines**: Visual indicators for different MRT lines

### 🕐 First & Last Train Times
- **Comprehensive Timetables**: View first and last train timings for all stations
- **Line Selection**: Filter by specific MRT lines
- **Direction Information**: Separate timings for both directions
- **Weekend Schedules**: Access to weekend service times

### 👥 Meetup Finder
- **Group Planning**: Find optimal meetup locations for multiple people
- **Multiple Participants**: Add unlimited starting locations
- **Smart Algorithm**: Calculates fairest meetup point based on travel time
- **Travel Time Breakdown**: See individual journey times for each participant
- **Interactive Map**: Visualize all participants and the suggested meetup point
- **Station Autocomplete**: Quick station search with inline suggestions

### 📊 Dashboard
- **User Profiles**: Personalized dashboard for registered users
- **Favorite Stations**: Save frequently used stations for quick access
- **Journey History**: Track your past route searches
- **Usage Statistics**: View your commuting patterns and insights

---

## 📸 Screenshots

### Route Planner
*Plan your MRT journey with an interactive map and detailed route information*

### Fare Calculator
*Calculate fares for all commuter types with visual breakdowns*

### Meetup Finder
*Find the perfect meetup location for your group*

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
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
   
   Create a `config.js` file in the root directory:
   ```javascript
   export const LTA_API_KEY = 'YOUR_LTA_API_KEY_HERE';
   ```

   Create a `.env` file for Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Fix Vite version (if needed)**
   ```bash
   npm uninstall vite
   npm install vite@6.4.1 --save-dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📖 Usage

### Getting Started

1. **Select a Feature**: Use the navigation bar to access different tools
2. **Route Planning**: Choose start and end stations to plan your journey
3. **Calculate Fares**: View fares for different commuter types
4. **Track Trains**: Check real-time arrival times at any station
5. **Find Meetups**: Add multiple starting locations to find optimal meetup points

### Tips

- Use the **autocomplete** feature for faster station selection
- **Hover** over route segments to see line colors
- Check the **dashboard** for saved favorites and history
- Use **keyboard shortcuts** (Tab/Enter) to accept autocomplete suggestions

---

## 🛠️ Tech Stack

### Frontend Framework
- **Vue 3.4.21** - Progressive JavaScript framework with Composition API
- **Vuetify 3.7.3** - Material Design component framework
- **Vite 6.4.1** - Next-generation frontend tooling

### Mapping & Visualization
- **Mapbox GL 2.15.0** - Interactive map rendering and visualization
- **Leaflet 1.9.4** - Additional mapping functionality
- **Chart.js 4.4.6** - Data visualization and charting

### UI & Animations
- **GSAP 3.12.5** - Professional-grade animation library
- **AOS 2.3.4** - Animate On Scroll library
- **Three.js 0.162.0** - 3D graphics and animations

### Backend & Data
- **Firebase 12.4.0** - Authentication and real-time database
- **LTA DataMall API** - Real-time train data from Singapore's Land Transport Authority

### Utilities
- **@vueuse/core 11.4.0** - Collection of Vue Composition utilities
- **Bootstrap 5.3.3** - CSS framework for responsive design

---

## 📁 Project Structure

```
SingaTrain/
├── public/                      # Static assets
│   ├── sg-rail.geojson         # Singapore MRT network GeoJSON data
│   └── railrouter/             # RailRouter standalone build
├── src/
│   ├── assets/                 # Images, videos, and styles
│   │   └── main.css           # Global styles and theme
│   ├── components/             # Vue components
│   │   ├── Dashboard.vue      # User dashboard
│   │   ├── FareCalculator.vue # Fare calculation tool
│   │   ├── FirstLastTrain.vue # Train timetables
│   │   ├── HeroSection.vue    # Landing page hero
│   │   ├── LiveTracker.vue    # Real-time train tracking
│   │   ├── MeetupFinder.vue   # Group meetup planner
│   │   ├── Navbar.vue         # Navigation component
│   │   ├── Profile.vue        # User profile management
│   │   ├── RoutePlanner.vue   # Route planning tool
│   │   ├── TextGenerateEffect.vue # Text animation component
│   │   └── TrainReveal.vue    # Train reveal animation
│   ├── composables/            # Reusable composition functions
│   │   ├── useAppState.js     # Global app state management
│   │   ├── useFareCalculator.js # Fare calculation logic
│   │   ├── useRouteAnimation.ts # Route animation controls
│   │   ├── useRoutePlanner.js  # Pathfinding algorithms
│   │   └── useTrainAPI.js     # Train data API integration
│   ├── data/                   # Static data and configurations
│   │   ├── fareTables.js      # Fare pricing data
│   │   ├── stationCoordinates.js # Station location data
│   │   ├── stations.js        # MRT station lists and line mappings
│   │   └── trainTimings.js    # First/last train schedules
│   ├── styles/                 # Additional stylesheets
│   │   ├── theme.css          # Theme variables and utilities
│   │   └── utilities.css      # Utility classes
│   ├── App.vue                # Root application component
│   ├── main.js                # Application entry point
│   ├── firebase.js            # Firebase configuration
│   └── theme.js               # Theme configuration
├── config.js                   # API keys configuration
├── vite.config.js             # Vite build configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## ⚙️ Configuration

### API Keys

#### LTA DataMall API
1. Register at [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en.html)
2. Get your API key
3. Add to `config.js`:
   ```javascript
   export const LTA_API_KEY = 'your_api_key_here';
   ```

#### Mapbox
1. Create account at [Mapbox](https://www.mapbox.com/)
2. Get your access token
3. Configure in your application settings

#### Firebase
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Add configuration to `.env` file

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
- Use the GitHub issue tracker
- Describe the bug in detail
- Include steps to reproduce
- Add screenshots if applicable

### Feature Requests
- Open an issue with the `enhancement` label
- Describe the feature and its benefits
- Discuss implementation approach

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Vue.js style guide
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 🗺️ Roadmap

- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Offline Mode**: Cached data for offline route planning
- [ ] **Bus Integration**: Include bus routes and connections
- [ ] **Saved Routes**: Bookmark frequently used routes
- [ ] **Notifications**: Push notifications for service disruptions
- [ ] **Multi-language**: Support for Chinese, Malay, and Tamil
- [ ] **Accessibility**: Enhanced accessibility features
- [ ] **Apple Watch**: Companion watchOS app

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Land Transport Authority (LTA)** for providing real-time train data
- **Mapbox** for mapping infrastructure
- **Vue.js Community** for excellent documentation and support
- **All Contributors** who have helped improve this project

---

## 📧 Contact

- **Project Repository**: [github.com/Xinqijames/SingaTrain](https://github.com/Xinqijames/SingaTrain)
- **Issue Tracker**: [github.com/Xinqijames/SingaTrain/issues](https://github.com/Xinqijames/SingaTrain/issues)

---

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Made with ❤️ for Singapore commuters**

</div>