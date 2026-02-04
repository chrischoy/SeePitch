/**
 * Pitch Detector using YIN Algorithm
 * Reference: http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf
 */

export class PitchDetector {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
        this.bufferSize = 4096;
        this.threshold = 0.1; // YIN threshold for pitch detection

        // Smoothing parameters
        this.smoothingFactor = 0.3; // 0 = no smoothing, 1 = max smoothing
        this.lastPitch = null;
    }

    /**
     * Detect pitch from audio buffer using simplified autocorrelation
     * @param {Float32Array} buffer - Audio samples
     * @returns {number|null} Frequency in Hz, or null if no pitch detected
     */
    detectPitch(buffer) {
        // Step 1: Difference function (simplified YIN)
        const yinBuffer = this._differenceFunction(buffer);

        // Step 2: Cumulative mean normalized difference
        const cmndf = this._cumulativeMeanNormalizedDifference(yinBuffer);

        // Step 3: Find absolute threshold
        const tau = this._absoluteThreshold(cmndf);

        if (tau === -1) {
            return null; // No pitch detected
        }

        // Step 4: Parabolic interpolation for better precision
        const betterTau = this._parabolicInterpolation(cmndf, tau);

        // Convert period (tau) to frequency
        let pitch = this.sampleRate / betterTau;

        // Filter out unrealistic frequencies for human voice
        if (pitch < 60 || pitch > 2000) {
            return null;
        }

        // Apply smoothing
        if (this.lastPitch !== null) {
            pitch = this.lastPitch * this.smoothingFactor + pitch * (1 - this.smoothingFactor);
        }

        this.lastPitch = pitch;
        return pitch;
    }

    /**
     * Compute difference function (step 1 of YIN)
     */
    _differenceFunction(buffer) {
        const yinBuffer = new Float32Array(buffer.length / 2);

        for (let tau = 0; tau < yinBuffer.length; tau++) {
            let sum = 0;
            for (let i = 0; i < yinBuffer.length; i++) {
                const delta = buffer[i] - buffer[i + tau];
                sum += delta * delta;
            }
            yinBuffer[tau] = sum;
        }

        return yinBuffer;
    }

    /**
     * Cumulative mean normalized difference (step 2 of YIN)
     */
    _cumulativeMeanNormalizedDifference(yinBuffer) {
        const cmndf = new Float32Array(yinBuffer.length);
        cmndf[0] = 1;

        let runningSum = 0;
        for (let tau = 1; tau < yinBuffer.length; tau++) {
            runningSum += yinBuffer[tau];
            cmndf[tau] = yinBuffer[tau] / (runningSum / tau);
        }

        return cmndf;
    }

    /**
     * Find first tau below threshold (step 3 of YIN)
     */
    _absoluteThreshold(cmndf) {
        // Start searching from a minimum period (corresponding to max freq ~2000Hz)
        const minTau = Math.floor(this.sampleRate / 2000);

        for (let tau = minTau; tau < cmndf.length; tau++) {
            if (cmndf[tau] < this.threshold) {
                // Find local minimum
                while (tau + 1 < cmndf.length && cmndf[tau + 1] < cmndf[tau]) {
                    tau++;
                }
                return tau;
            }
        }

        return -1; // No pitch found
    }

    /**
     * Parabolic interpolation for sub-sample precision (step 4 of YIN)
     */
    _parabolicInterpolation(cmndf, tau) {
        if (tau === 0 || tau === cmndf.length - 1) {
            return tau;
        }

        const s0 = cmndf[tau - 1];
        const s1 = cmndf[tau];
        const s2 = cmndf[tau + 1];

        const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        return tau + adjustment;
    }

    /**
     * Set smoothing factor (0-1)
     */
    setSmoothingFactor(factor) {
        this.smoothingFactor = Math.max(0, Math.min(1, factor));
    }

    /**
     * Reset smoothing state
     */
    reset() {
        this.lastPitch = null;
    }
}
