/**
 * Microphone Audio Capture using Web Audio API
 */

export class Microphone {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.buffer = null;
        this.isActive = false;
    }

    /**
     * Initialize and start microphone capture
     * @returns {Promise<void>}
     */
    async start() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    latency: 0
                }
            });

            // Create audio context (iOS Safari requires user gesture)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100
            });

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096; // Larger FFT for better low-frequency resolution
            this.analyser.smoothingTimeConstant = 0; // No smoothing (we'll handle that ourselves)

            // Create buffer for time-domain audio data
            this.buffer = new Float32Array(this.analyser.fftSize);

            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            this.isActive = true;
            console.log('🎤 Microphone started successfully');

        } catch (error) {
            console.error('Failed to start microphone:', error);
            throw error;
        }
    }

    /**
     * Get current audio buffer for pitch detection
     * @returns {Float32Array} Time-domain audio samples
     */
    getAudioBuffer() {
        if (!this.isActive || !this.analyser) {
            return null;
        }

        this.analyser.getFloatTimeDomainData(this.buffer);
        return this.buffer;
    }

    /**
     * Get RMS (volume level) of current audio
     * @returns {number} RMS value (0-1)
     */
    getRMS() {
        const buffer = this.getAudioBuffer();
        if (!buffer) return 0;

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Check if audio is above noise threshold
     * @param {number} threshold - Minimum RMS threshold (default: 0.01)
     * @returns {boolean}
     */
    isAboveNoiseThreshold(threshold = 0.01) {
        return this.getRMS() > threshold;
    }

    /**
     * Stop microphone and cleanup
     */
    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isActive = false;
        console.log('🎤 Microphone stopped');
    }

    /**
     * Get audio context sample rate
     * @returns {number} Sample rate in Hz
     */
    getSampleRate() {
        return this.audioContext?.sampleRate || 44100;
    }

    /**
     * Resume audio context (needed for iOS after user gesture)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🎤 Audio context resumed');
        }
    }
}
