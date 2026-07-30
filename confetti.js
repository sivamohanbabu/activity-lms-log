/**
 * High Performance Canvas Confetti & Particle Celebration Engine
 */
class ConfettiEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animating = false;
        this.colors = [
            '#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
            '#ec4899', '#06b6d4', '#84cc16', '#eab308', '#d946ef'
        ];
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.getElementById('confettiCanvas');
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'confettiCanvas';
                this.canvas.style.position = 'fixed';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.width = '100vw';
                this.canvas.style.height = '100vh';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '9999';
                document.body.appendChild(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire(options = {}) {
        this.init();
        const particleCount = options.particleCount || 150;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 16;
            
            // Origin centered or customized
            const startX = options.x !== undefined ? options.x : this.canvas.width / 2;
            const startY = options.y !== undefined ? options.y : this.canvas.height * 0.4;

            this.particles.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
                vy: Math.sin(angle) * speed - (4 + Math.random() * 6), // upward bias
                size: 6 + Math.random() * 8,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                opacity: 1,
                decay: 0.008 + Math.random() * 0.008,
                shape: Math.random() > 0.3 ? 'rect' : 'circle',
                gravity: 0.28 + Math.random() * 0.1
            });
        }

        if (!this.animating) {
            this.animating = true;
            this.loop();
        }
    }

    loop() {
        if (!this.particles.length) {
            this.animating = false;
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98; // air resistance
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.loop());
    }
}

window.confettiEngine = new ConfettiEngine();
