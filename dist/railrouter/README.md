# Singapore Rail Map - Standalone Version

This is a standalone version of the Singapore MRT/LRT rail map that can be easily integrated into other projects.

## Files Included

- `index.html` - Main HTML file
- `index.975ef6c8.js` - Compiled JavaScript bundle
- `index.61d3354a.css` - Compiled CSS styles
- `sg-rail.geo.json` - Singapore rail network data
- `sg-rail-walks.geo.json` - Walking routes between stations
- `stations.34803ec4.png` - Station icons sprite
- `exit.7a6b62b2.png` - Exit/entrance icons
- `walk.2579597d.png` - Walking route icons
- `sw.js` - Service worker for offline functionality
- `index.webmanifest` - Web app manifest

## How to Use

### Option 1: Direct Integration
Simply copy all files to your project and reference `index.html`:

```html
<iframe src="path/to/index.html" width="100%" height="600px"></iframe>
```

### Option 2: Embed as Component
Include the files in your project structure and reference them:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="index.61d3354a.css">
</head>
<body>
    <div id="map"></div>
    <script src="index.975ef6c8.js"></script>
</body>
</html>
```

## Features

- Interactive Singapore MRT/LRT map
- Real-time crowd density indicators
- Station information with exits
- Walking routes between stations
- Multi-language support (English, Chinese, Tamil)
- Offline functionality via service worker
- Progressive Web App (PWA) capabilities

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection for initial load and crowd data
- HTTPS recommended for service worker functionality

## Customization

To customize the map:
1. Replace the Mapbox access token in the JavaScript file
2. Update the Mapbox style URL if needed
3. Modify crowd data API endpoint if required

## License

MIT License - Feel free to use in your projects!
