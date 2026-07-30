/**
 * Audio Synthesizer Engine using Web Audio API
 * Guarantees zero external audio loading failures / CORS issues.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.7;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.enabled = !muted;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Short crisp tick sound for wheel pointer crossing slices
    playTick(pitch = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440 * pitch, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120 * pitch, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {
            console.warn("Audio tick error:", e);
        }
    }

    // Slot machine reel chime sound
    playChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = this.ctx.currentTime + idx * 0.06;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.2 * this.volume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.2);
            });
        } catch (e) {
            console.warn("Audio chime error:", e);
        }
    }

    // Mystery Box / Card Flip Pop sound
    playPop() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.4 * this.volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {
            console.warn("Audio pop error:", e);
        }
    }

    // Triumphant Fanfare Sound for Winner Celebration
    playCelebrationFanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            // Brass-like triumphant melody (C5 -> E5 -> G5 -> C6 -> A5 -> C6 hold)
            const melody = [
                { freq: 523.25, duration: 0.12, delay: 0 },
                { freq: 659.25, duration: 0.12, delay: 0.12 },
                { freq: 783.99, duration: 0.12, delay: 0.24 },
                { freq: 1046.50, duration: 0.45, delay: 0.36 },
                { freq: 880.00, duration: 0.15, delay: 0.85 },
                { freq: 1046.50, duration: 0.8, delay: 1.0 }
            ];

            melody.forEach(note => {
                const osc = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                const startTime = this.ctx.currentTime + note.delay;

                osc.type = 'triangle';
                osc2.type = 'sawtooth';

                osc.frequency.setValueAtTime(note.freq, startTime);
                osc2.frequency.setValueAtTime(note.freq * 1.002, startTime);

                const noteVol = 0.25 * this.volume;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(noteVol, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc2.start(startTime);
                osc.stop(startTime + note.duration);
                osc2.stop(startTime + note.duration);
            });

            this.playCheerNoise(this.ctx.currentTime + 0.35, 1.5);
        } catch (e) {
            console.warn("Celebration fanfare error:", e);
        }
    }

    playCheerNoise(startTime, duration) {
        if (!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 1.5;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12 * this.volume, startTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(startTime);
            noise.stop(startTime + duration);
        } catch (e) {
            console.warn("Cheer noise error:", e);
        }
    }

    playTimerAlarm() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            for (let i = 0; i < 3; i++) {
                const startTime = this.ctx.currentTime + i * 0.25;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, startTime);

                gain.gain.setValueAtTime(0.3 * this.volume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.18);
            }
        } catch (e) {
            console.warn("Timer alarm error:", e);
        }
    }
}

window.soundEngine = new SoundEngine();
