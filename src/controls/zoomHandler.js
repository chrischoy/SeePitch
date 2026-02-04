/**
 * Zoom Handler with Pinch-to-Zoom and Vertical Pan Support
 */

export class ZoomHandler {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Touch tracking
        this.touches = [];
        this.lastDistance = null;
        this.lastTouchY = null;
        this.isPanning = false;

        this.setupTouchListeners();
    }

    setupTouchListeners() {
        this.canvas.addEventListener('touchstart', (e) => {
            this.touches = Array.from(e.touches);

            if (this.touches.length === 2) {
                // Two fingers - prepare for pinch zoom
                this.lastDistance = this.getTouchDistance();
                this.isPanning = false;
                e.preventDefault();
            } else if (this.touches.length === 1) {
                // Single finger - prepare for pan
                this.lastTouchY = this.touches[0].clientY;
                this.isPanning = true;
                e.preventDefault();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            this.touches = Array.from(e.touches);

            if (this.touches.length === 2) {
                // Two-finger pinch zoom
                const currentDistance = this.getTouchDistance();

                if (this.lastDistance) {
                    const delta = currentDistance - this.lastDistance;
                    const zoomDelta = delta / 50; // Sensitivity adjustment

                    this.renderer.zoom(zoomDelta);
                }

                this.lastDistance = currentDistance;
                e.preventDefault();
            } else if (this.touches.length === 1 && this.isPanning) {
                // Single-finger vertical pan
                const currentY = this.touches[0].clientY;

                if (this.lastTouchY !== null) {
                    const deltaY = currentY - this.lastTouchY;
                    this.renderer.pan(deltaY);
                }

                this.lastTouchY = currentY;
                e.preventDefault();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.touches = [];
            this.lastDistance = null;
            this.lastTouchY = null;
            this.isPanning = false;
        });

        // Mouse wheel zoom for desktop
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (e.shiftKey) {
                // Shift + wheel = vertical pan
                const panDelta = e.deltaY;
                this.renderer.pan(panDelta);
            } else {
                // Normal wheel = zoom
                const zoomDelta = e.deltaY > 0 ? -1 : 1;
                this.renderer.zoom(zoomDelta);
            }
        }, { passive: false });
    }

    getTouchDistance() {
        if (this.touches.length < 2) return 0;

        const dx = this.touches[0].clientX - this.touches[1].clientX;
        const dy = this.touches[0].clientY - this.touches[1].clientY;

        return Math.sqrt(dx * dx + dy * dy);
    }
}
