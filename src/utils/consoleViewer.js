/**
 * On-screen console viewer for debugging on mobile devices
 */

export class ConsoleViewer {
    constructor() {
        this.maxLines = 50;
        this.element = null;
        this.init();
        this.interceptConsole();
    }

    init() {
        // Create console viewer element
        this.element = document.createElement('div');
        this.element.id = 'console-viewer';
        this.element.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 40vh;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            padding: 10px;
            overflow-y: auto;
            z-index: 10000;
            border-top: 2px solid #00ff00;
            display: none;
        `;
        document.body.appendChild(this.element);

        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '📋 Console';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            padding: 10px 15px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            border: 2px solid #00ff00;
            border-radius: 5px;
            font-size: 12px;
            z-index: 10001;
            cursor: pointer;
        `;
        toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(toggleBtn);
    }

    toggle() {
        if (this.element.style.display === 'none') {
            this.element.style.display = 'block';
        } else {
            this.element.style.display = 'none';
        }
    }

    addLine(type, ...args) {
        const line = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();

        let color = '#00ff00';
        let prefix = '';

        if (type === 'error') {
            color = '#ff0000';
            prefix = '❌ ';
        } else if (type === 'warn') {
            color = '#ffaa00';
            prefix = '⚠️ ';
        } else if (type === 'info') {
            color = '#00aaff';
            prefix = 'ℹ️ ';
        }

        line.style.color = color;
        line.style.marginBottom = '2px';
        line.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        line.style.paddingBottom = '2px';

        const message = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');

        line.textContent = `[${timestamp}] ${prefix}${message}`;

        this.element.appendChild(line);

        // Keep only last N lines
        while (this.element.children.length > this.maxLines) {
            this.element.removeChild(this.element.firstChild);
        }

        // Auto-scroll to bottom
        this.element.scrollTop = this.element.scrollHeight;
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.addLine('log', ...args);
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.addLine('error', ...args);
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.addLine('warn', ...args);
        };

        console.info = (...args) => {
            originalInfo.apply(console, args);
            this.addLine('info', ...args);
        };
    }

    clear() {
        this.element.innerHTML = '';
    }
}
