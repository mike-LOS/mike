import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "node:path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteCompression({
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 1024,
        }),
        nodePolyfills({
            include: ['buffer', 'process'],
            globals: {
                Buffer: true,
                process: true,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, './src'),
        },
    },
    // Let Vite handle env variables with VITE_ prefix automatically
});
