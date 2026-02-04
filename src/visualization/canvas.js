/**
 * Canvas Rendering Engine for Pitch Visualization
 */

import { getNoteRange, hzToMidi } from '../utils/noteConverter.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Display settings
        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;

        // Visualization settings
        this.timeWindow = 10; // seconds of history to show
        this.minMidiNote = 48; // C3
        this.maxMidiNote = 84; // C6
        this.zoomLevel = 1;
        this.panOffsetY = 0; // Vertical pan offset in MIDI notes

        // Auto-ranging
        this.autoRangeEnabled = true;
        this.hasAutoRanged = false;
        this.autoRangeSamples = [];
        this.autoRangeSampleCount = 10; // Number of samples before auto-centering

        // Pitch data buffer
        this.pitchData = [];
        this.maxDataPoints = 600; // ~10s at 60fps

        // Line rendering settings
        this.gapThreshold = 3; // Number of null points before breaking line (adjustable)

        // Visual mode
        this.mode = 'normal'; // 'normal', 'target', 'range'
        this.targetFrequency = null;
        this.rangeMin = null;
        this.rangeMax = null;

        // Colors
        this.colors = {
            background: '#0a0a0a',
            grid: 'rgba(255, 255, 255, 0.08)',
            gridBold: 'rgba(255, 255, 255, 0.15)',
            pitchLine: '#00ff88',
            targetLine: '#00d4ff',
            rangeZone: 'rgba(0, 212, 255, 0.15)',
            noteLabel: 'rgba(255, 255, 255, 0.7)'
        };

        // Initialize
        this.resize();
        this.setupResizeListener();
    }

    /**
     * Resize canvas to fill viewport with high DPI support
     */
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(this.dpr, this.dpr);
    }

    /**
     * Setup resize listener for responsive behavior
     */
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resize(), 100);
        });
    }

    /**
   * Add pitch data point
   * @param {number|null} frequency - Frequency in Hz
   */
    addPitchData(frequency) {
        const timestamp = performance.now();

        // Auto-range on first valid pitches
        if (frequency && this.autoRangeEnabled && !this.hasAutoRanged) {
            this.autoRangeSamples.push(frequency);

            if (this.autoRangeSamples.length >= this.autoRangeSampleCount) {
                this.performAutoRange();
                this.hasAutoRanged = true;
            }
        }

        this.pitchData.push({
            frequency,
            timestamp
        });

        // Update range tracking
        if (frequency && this.mode === 'range') {
            if (this.rangeMin === null || frequency < this.rangeMin) {
                this.rangeMin = frequency;
            }
            if (this.rangeMax === null || frequency > this.rangeMax) {
                this.rangeMax = frequency;
            }
        }

        // Trim old data based on time window
        const cutoffTime = timestamp - (this.timeWindow * 1000);
        this.pitchData = this.pitchData.filter(d => d.timestamp > cutoffTime);
    }

    /**
     * Automatically adjust range based on detected pitch
     */
    performAutoRange() {
        if (this.autoRangeSamples.length === 0) return;

        // Calculate average of collected samples
        const avgFreq = this.autoRangeSamples.reduce((a, b) => a + b, 0) / this.autoRangeSamples.length;
        const centerMidi = hzToMidi(avgFreq);

        // Set 3-octave range centered on detected pitch
        const rangeInSemitones = 36; // 3 octaves
        this.minMidiNote = Math.round(centerMidi - rangeInSemitones / 2);
        this.maxMidiNote = Math.round(centerMidi + rangeInSemitones / 2);

        console.log(`🎯 Auto-ranged to ${this.minMidiNote}-${this.maxMidiNote} MIDI (centered on ${Math.round(avgFreq)}Hz)`);
    }

    /**
     * Clear all pitch data
     */
    clearData() {
        this.pitchData = [];
        this.rangeMin = null;
        this.rangeMax = null;

        // Reset auto-range state
        this.hasAutoRanged = false;
        this.autoRangeSamples = [];
    }

    /**
     * Main render loop
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw layers
        this.drawGrid();
        this.drawNoteLabels();

        if (this.mode === 'range' && this.rangeMin && this.rangeMax) {
            this.drawRangeZone();
        }

        if (this.mode === 'target' && this.targetFrequency) {
            this.drawTargetLine();
        }

        this.drawPitchGraph();
    }

    /**
     * Draw musical grid (horizontal lines for each note)
     */
    drawGrid() {
        const notes = getNoteRange(this.minMidiNote, this.maxMidiNote);
        const labelWidth = 60; // Space for note labels on left

        notes.forEach(noteInfo => {
            const y = this.frequencyToY(noteInfo.frequency);

            // Bold line for C notes (octave boundaries)
            const isOctaveBoundary = noteInfo.note === 'C';
            this.ctx.strokeStyle = isOctaveBoundary ? this.colors.gridBold : this.colors.grid;
            this.ctx.lineWidth = isOctaveBoundary ? 1.5 : 0.5;

            this.ctx.beginPath();
            this.ctx.moveTo(labelWidth, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        });
    }

    /**
     * Draw note labels on left side
     */
    drawNoteLabels() {
        const notes = getNoteRange(this.minMidiNote, this.maxMidiNote);

        this.ctx.fillStyle = this.colors.noteLabel;
        this.ctx.font = '11px "Courier New", monospace';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        notes.forEach(noteInfo => {
            const y = this.frequencyToY(noteInfo.frequency);

            // Only show labels for natural notes and C# to avoid clutter
            if (!noteInfo.note.includes('#') || noteInfo.note === 'C#') {
                this.ctx.fillText(noteInfo.noteName, 50, y);
            }
        });
    }

    /**
     * Draw target pitch reference line
     */
    drawTargetLine() {
        const y = this.frequencyToY(this.targetFrequency);
        const labelWidth = 60;

        this.ctx.strokeStyle = this.colors.targetLine;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);

        this.ctx.beginPath();
        this.ctx.moveTo(labelWidth, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    /**
     * Draw range zone (min/max frequency area)
     */
    drawRangeZone() {
        const yMin = this.frequencyToY(this.rangeMax);
        const yMax = this.frequencyToY(this.rangeMin);
        const labelWidth = 60;

        this.ctx.fillStyle = this.colors.rangeZone;
        this.ctx.fillRect(labelWidth, yMin, this.width - labelWidth, yMax - yMin);
    }

    /**
     * Draw scrolling pitch line graph
     */
    drawPitchGraph() {
        if (this.pitchData.length < 2) return;

        const labelWidth = 60;
        const graphWidth = this.width - labelWidth;
        const now = performance.now();
        const timeWindowMs = this.timeWindow * 1000;

        // Draw smooth line
        this.ctx.strokeStyle = this.colors.pitchLine;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        let isDrawing = false;
        let consecutiveNulls = 0;

        this.pitchData.forEach((point, index) => {
            // Calculate x position (scroll from right to left)
            const timeDelta = now - point.timestamp;
            const x = this.width - (timeDelta / timeWindowMs) * graphWidth;

            if (!point.frequency) {
                // Track consecutive null points
                consecutiveNulls++;

                // Only break line if we have a sustained gap
                if (consecutiveNulls >= this.gapThreshold && isDrawing) {
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    isDrawing = false;
                }
                return;
            }

            // Reset null counter when we get valid pitch
            consecutiveNulls = 0;

            // Calculate y position
            const y = this.frequencyToY(point.frequency);

            if (!isDrawing) {
                // Start new line segment
                this.ctx.moveTo(x, y);
                isDrawing = true;
            } else {
                // Continue line
                this.ctx.lineTo(x, y);
            }
        });

        // Stroke final segment if we were drawing
        if (isDrawing) {
            this.ctx.stroke();
        }
    }

    /**
     * Convert frequency to Y coordinate
     * @param {number} frequency - Frequency in Hz
     * @returns {number} Y coordinate
     */
    frequencyToY(frequency) {
        const midiNote = hzToMidi(frequency);
        const noteRange = this.maxMidiNote - this.minMidiNote;
        const normalizedPosition = (midiNote - this.minMidiNote) / noteRange;

        // Invert Y (higher pitch = higher on screen)
        return this.height - (normalizedPosition * this.height);
    }

    /**
     * Set time window (in seconds)
     */
    setTimeWindow(seconds) {
        this.timeWindow = seconds;
        this.maxDataPoints = Math.ceil(seconds * 60); // Assuming 60fps
    }

    /**
     * Set visualization mode
     */
    setMode(mode) {
        this.mode = mode;
        if (mode !== 'range') {
            this.rangeMin = null;
            this.rangeMax = null;
        }
    }

    /**
     * Set target frequency for target mode
     */
    setTargetFrequency(frequency) {
        this.targetFrequency = frequency;
    }

    /**
     * Set gap threshold for line continuity
     * @param {number} threshold - Number of consecutive null points before breaking line
     */
    setGapThreshold(threshold) {
        this.gapThreshold = Math.max(1, Math.round(threshold));
    }

    /**
     * Zoom in/out (adjust visible note range)
     * @param {number} delta - Positive = zoom out (expand range), Negative = zoom in (shrink range)
     */
    zoom(delta) {
        const currentRange = this.maxMidiNote - this.minMidiNote;

        // Use exponential zoom: 1.2x per step
        // delta > 0: zoom out (multiply by 1.2)
        // delta < 0: zoom in (divide by 1.2)
        const zoomFactor = Math.pow(1.2, delta);
        let newRange = currentRange * zoomFactor;

        // Clamp to reasonable bounds
        newRange = Math.max(6, Math.min(120, newRange)); // 6 semitones to 10 octaves

        const center = (this.maxMidiNote + this.minMidiNote) / 2;
        this.minMidiNote = Math.round(center - newRange / 2);
        this.maxMidiNote = Math.round(center + newRange / 2);
    }

    /**
     * Pan vertically (move view up/down)
     * @param {number} deltaY - Pixel delta (positive = pan down, negative = pan up)
     */
    pan(deltaY) {
        // Convert pixel delta to MIDI note delta
        const currentRange = this.maxMidiNote - this.minMidiNote;
        const panSensitivity = 0.05; // Adjust sensitivity
        const midiDelta = (deltaY / this.height) * currentRange * panSensitivity;

        // Apply pan (inverted because positive deltaY means finger moved down = view moves down)
        this.minMidiNote -= midiDelta;
        this.maxMidiNote -= midiDelta;
    }
}
