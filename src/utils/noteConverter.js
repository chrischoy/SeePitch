/**
 * Note Converter Utility
 * Converts between Hz frequencies and musical notes (A440 standard)
 */

const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert frequency in Hz to musical note information
 * @param {number} frequency - Frequency in Hz
 * @returns {Object} { note: string, octave: number, cents: number, midiNumber: number }
 */
export function hzToNote(frequency) {
    if (!frequency || frequency <= 0) {
        return null;
    }

    // Calculate MIDI note number (can be fractional)
    const midiNumber = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
    const roundedMidi = Math.round(midiNumber);

    // Calculate cents deviation from nearest note (-50 to +50)
    const cents = Math.round((midiNumber - roundedMidi) * 100);

    // Get note name and octave
    const noteIndex = roundedMidi % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    const note = NOTE_NAMES[noteIndex];

    return {
        note,
        octave,
        cents,
        midiNumber: roundedMidi,
        frequency: frequency,
        noteName: `${note}${octave}`
    };
}

/**
 * Convert musical note to frequency in Hz
 * @param {string} note - Note name (e.g., "A", "C#")
 * @param {number} octave - Octave number
 * @returns {number} Frequency in Hz
 */
export function noteToHz(note, octave) {
    const noteIndex = NOTE_NAMES.indexOf(note);
    if (noteIndex === -1) {
        throw new Error(`Invalid note: ${note}`);
    }

    const midiNumber = (octave + 1) * 12 + noteIndex;
    const frequency = A4_FREQUENCY * Math.pow(2, (midiNumber - A4_MIDI_NUMBER) / 12);

    return frequency;
}

/**
 * Parse note string like "C4" or "A#5" to frequency
 * @param {string} noteString - Note string (e.g., "C4", "A#5")
 * @returns {number} Frequency in Hz
 */
export function parseNoteString(noteString) {
    const match = noteString.match(/^([A-G]#?)(\d+)$/);
    if (!match) {
        throw new Error(`Invalid note string: ${noteString}`);
    }

    const [, note, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);

    return noteToHz(note, octave);
}

/**
 * Get all note frequencies for a given range
 * @param {number} minMidiNumber - Minimum MIDI note number
 * @param {number} maxMidiNumber - Maximum MIDI note number
 * @returns {Array} Array of { note, octave, frequency, noteName, midiNumber }
 */
export function getNoteRange(minMidiNumber, maxMidiNumber) {
    const notes = [];

    for (let midi = minMidiNumber; midi <= maxMidiNumber; midi++) {
        const noteIndex = midi % 12;
        const octave = Math.floor(midi / 12) - 1;
        const note = NOTE_NAMES[noteIndex];
        const frequency = A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI_NUMBER) / 12);

        notes.push({
            note,
            octave,
            frequency,
            noteName: `${note}${octave}`,
            midiNumber: midi
        });
    }

    return notes;
}

/**
 * Get frequency from MIDI note number
 * @param {number} midiNumber - MIDI note number (0-127)
 * @returns {number} Frequency in Hz
 */
export function midiToHz(midiNumber) {
    return A4_FREQUENCY * Math.pow(2, (midiNumber - A4_MIDI_NUMBER) / 12);
}

/**
 * Get MIDI note number from frequency
 * @param {number} frequency - Frequency in Hz
 * @returns {number} MIDI note number
 */
export function hzToMidi(frequency) {
    return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
}
