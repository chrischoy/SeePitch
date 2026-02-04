/**
 * Floating Menu Controls
 */

export class FloatingMenu {
    constructor(renderer, pitchDetector = null) {
        this.renderer = renderer;
        this.pitchDetector = pitchDetector;

        // DOM elements
        this.menuContainer = document.getElementById('floatingMenu');
        this.menuToggle = document.getElementById('menuToggle');
        this.menuPanel = document.getElementById('menuPanel');
        this.timeWindowSlider = document.getElementById('timeWindow');
        this.timeWindowValue = document.getElementById('timeWindowValue');
        this.gapToleranceSlider = document.getElementById('gapTolerance');
        this.gapToleranceValue = document.getElementById('gapToleranceValue');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.visualModeSelect = document.getElementById('visualMode');
        this.targetPitchGroup = document.getElementById('targetPitchGroup');
        this.targetNoteSelect = document.getElementById('targetNote');

        this.isExpanded = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle menu expansion
        this.menuToggle.addEventListener('click', () => {
            this.toggle();
        });

        // Time window adjustment
        this.timeWindowSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.timeWindowValue.textContent = value;
            this.renderer.setTimeWindow(value);
        });

        // Gap tolerance adjustment
        this.gapToleranceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.gapToleranceValue.textContent = value;
            this.renderer.setGapThreshold(value);
        });

        // Sensitivity adjustment
        this.sensitivitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.sensitivityValue.textContent = value;
            if (this.pitchDetector) {
                // Map slider value to YIN threshold (inverted: higher slider = more sensitive)
                // Slider: -120 to -40, map to YIN threshold: 0.3 to 0.05
                const yinThreshold = 0.3 - ((value + 120) / 80) * 0.25;
                this.pitchDetector.threshold = yinThreshold;
            }
        });

        // Visual mode selection
        this.visualModeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            this.renderer.setMode(mode);

            // Show/hide target pitch controls
            if (mode === 'target') {
                this.targetPitchGroup.style.display = 'block';
                this.updateTargetPitch();
            } else {
                this.targetPitchGroup.style.display = 'none';
            }

            // Clear data when switching to range mode
            if (mode === 'range') {
                this.renderer.clearData();
            }
        });

        // Target pitch selection
        this.targetNoteSelect.addEventListener('change', () => {
            this.updateTargetPitch();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isExpanded &&
                !this.menuContainer.contains(e.target)) {
                this.collapse();
            }
        });
    }

    toggle() {
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    expand() {
        this.menuContainer.classList.remove('collapsed');
        this.isExpanded = true;
    }

    collapse() {
        this.menuContainer.classList.add('collapsed');
        this.isExpanded = false;
    }

    updateTargetPitch() {
        const noteString = this.targetNoteSelect.value;
        const frequency = this.parseTargetNote(noteString);
        this.renderer.setTargetFrequency(frequency);
    }

    parseTargetNote(noteString) {
        // Extract frequency from option value (e.g., "A4")
        const frequencies = {
            'C4': 261.63,
            'D4': 293.66,
            'E4': 329.63,
            'F4': 349.23,
            'G4': 392.00,
            'A4': 440.00,
            'B4': 493.88,
            'C5': 523.25
        };
        return frequencies[noteString] || 440;
    }
}
