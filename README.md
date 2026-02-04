# Voice Pitch Visualizer

- **Status:** ✅ Complete (Ready for Deployment)
- **Started:** 2026-02-03
- **Finished:** 2026-02-03
- **URL:** [pitch.chrischoy.org](https://pitch.chrischoy.org) *(pending deployment)*

## Overview

A mobile-first web application for real-time voice pitch visualization designed for vocal training. Features vibrato analysis, musical grid display, and interactive controls optimized for portrait mode on mobile devices.

## Features

- 🎤 **Real-time Pitch Detection** - YIN algorithm for accurate voice analysis
- 📊 **Musical Grid Visualization** - Chromatic scale with note labels
- 📱 **Mobile-First Design** - Portrait-optimized with touch controls
- 🌙 **Dark Theme** - Easy on the eyes during practice sessions
- 🎯 **Target Pitch Mode** - Visual reference for hitting specific notes
- 📈 **Range Display** - Track min/max frequency over session
- 🔍 **Pinch-to-Zoom** - Adjust visible octave range
- ⏱️ **Adjustable Time Window** - 5-30 second history view
- ⚡ **60fps Rendering** - Smooth, responsive visualization

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+)
- **Build Tool:** Vite
- **Audio:** Web Audio API
- **Pitch Detection:** YIN Algorithm
- **Rendering:** HTML5 Canvas
- **Deployment:** GitHub Pages + Cloudflare

## Project Structure

```
voice-pitch-viz/
├── index.html              # Mobile-optimized entry point
├── style.css               # Dark theme with glassmorphism
├── vite.config.js          # Build configuration
├── .github/workflows/
│   └── deploy.yml          # Automated deployment
└── src/
    ├── main.js             # Application orchestrator
    ├── audio/
    │   ├── microphone.js   # Web Audio API capture
    │   └── pitchDetector.js # YIN algorithm
    ├── visualization/
    │   └── canvas.js       # Musical grid + pitch graph
    ├── controls/
    │   ├── floatingMenu.js # Collapsible settings
    │   └── zoomHandler.js  # Pinch-to-zoom
    └── utils/
        └── noteConverter.js # Hz ↔ Note conversion
```

## Getting Started

### Prerequisites

- Node.js 18+ (managed via nvm)
- Modern browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd voice-pitch-viz

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## Usage

1. **Grant Microphone Access** - Click "Tap to Start" when prompted
2. **Start Singing** - Your pitch will be visualized in real-time
3. **Adjust Settings** - Click the gear icon (⚙️) in the top-right corner
4. **Zoom** - Pinch-to-zoom on mobile or use mouse wheel on desktop
5. **Switch Modes:**
   - **Normal** - Standard pitch visualization
   - **Target Pitch** - Add reference line for practice
   - **Range Display** - Track your vocal range

## Deployment

### GitHub Pages

1. **Enable GitHub Pages** in repository settings
2. **Set Source** to "GitHub Actions"
3. **Push to main branch** - Deployment happens automatically

### Cloudflare DNS

Add CNAME record for custom domain:
```
Type: CNAME
Name: pitch
Content: <your-username>.github.io
Proxy: Enabled (Orange Cloud)
```

Set SSL/TLS mode to "Full" in Cloudflare dashboard.

## Technical Details

### Pitch Detection Algorithm

Uses the **YIN algorithm** with 4-step process:
1. Difference function (autocorrelation)
2. Cumulative mean normalized difference
3. Absolute threshold detection
4. Parabolic interpolation for sub-sample precision

### Performance Optimizations

- High DPI canvas scaling for retina displays
- 60fps rendering with requestAnimationFrame
- Noise threshold filtering
- Exponential smoothing for stable readings
- Efficient data culling based on time window

### Browser Compatibility

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (desktop & iOS)
- ✅ Firefox (desktop & mobile)

**Note:** Microphone access requires HTTPS in production.

## Development

### Key Files

- `src/main.js` - Application entry point and orchestration
- `src/audio/pitchDetector.js` - Core YIN algorithm implementation
- `src/visualization/canvas.js` - Canvas rendering engine
- `src/controls/floatingMenu.js` - UI controls

### Adding Features

To add vibrato analysis or other enhancements, see the implementation plan in `/brain/implementation_plan.md`

## License

MIT

## Acknowledgments

- YIN Algorithm: [Cheveigné & Kawahara (2002)](http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf)
- Web Audio API: [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

