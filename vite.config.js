import { defineConfig } from 'vite'

export default defineConfig({
    base: '/', // Will be served from pitch.chrischoy.org root
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild', // Use built-in esbuild instead of terser
    },
    server: {
        host: true, // Allow access from network
        port: 3000,
        allowedHosts: ['.trycloudflare.com'], // Allow Cloudflare tunnel hosts for debugging
    },
})
