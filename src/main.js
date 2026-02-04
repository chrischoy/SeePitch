/**
 * Voice Pitch Visualizer - Main Application
 * Mobile-first pitch visualization for vocal training
 */

import '../style.css';
import { Microphone } from './audio/microphone.js';
import { PitchDetector } from './audio/pitchDetector.js';
import { CanvasRenderer } from './visualization/canvas.js';
import { FloatingMenu } from './controls/floatingMenu.js';
import { ZoomHandler } from './controls/zoomHandler.js';

class VoicePitchVisualizer {
  constructor() {
    this.microphone = new Microphone();
    this.pitchDetector = null;
    this.renderer = new CanvasRenderer('pitchCanvas');
    this.floatingMenu = null;
    this.zoomHandler = null;

    this.isRunning = false;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    // Setup controls
    this.floatingMenu = new FloatingMenu(this.renderer);
    this.zoomHandler = new ZoomHandler(
      document.getElementById('pitchCanvas'),
      this.renderer
    );

    // Setup start button
    const startButton = document.getElementById('startButton');
    const startOverlay = document.getElementById('startOverlay');

    startButton.addEventListener('click', async () => {
      try {
        await this.start();
        startOverlay.classList.add('hidden');
      } catch (error) {
        console.error('Failed to start:', error);
        alert('Failed to access microphone. Please grant permission and try again.');
      }
    });
  }

  async start() {
    console.log('🚀 Starting Voice Pitch Visualizer...');

    // Start microphone
    await this.microphone.start();

    // Initialize pitch detector with microphone sample rate
    this.pitchDetector = new PitchDetector(this.microphone.getSampleRate());

    // Pass pitch detector to floating menu for sensitivity control
    this.floatingMenu.pitchDetector = this.pitchDetector;

    // Start rendering loop
    this.isRunning = true;
    this.loop();

    console.log('✅ Voice Pitch Visualizer started');
  }

  loop() {
    if (!this.isRunning) return;

    // Get audio buffer from microphone
    const buffer = this.microphone.getAudioBuffer();

    if (buffer) {
      // Only detect pitch if audio is above noise threshold
      let frequency = null;

      // Lowered threshold from 0.01 to 0.005 for better low-frequency detection
      if (this.microphone.isAboveNoiseThreshold(0.005)) {
        frequency = this.pitchDetector.detectPitch(buffer);
      }

      // Add to renderer
      this.renderer.addPitchData(frequency);
    }

    // Render frame
    this.renderer.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    console.log('⏹ Stopping Voice Pitch Visualizer...');

    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.microphone.stop();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new VoicePitchVisualizer();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.stop();
  });

  // Expose to window for debugging
  window.pitchViz = app;
});
