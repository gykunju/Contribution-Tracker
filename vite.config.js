import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({ algorithm: "brotliCompress" }), // Enable Brotli compression
  ],
  build: {
    minify: "esbuild", // Ensure JavaScript is minified
    chunkSizeWarningLimit: 500, // Reduce chunk size warnings
    outDir: 'dist' // Output directory
  },
  base: process.env.NODE_ENV === "production" ? "/Contribution-Tracker/" : "/", // Use correct base for GitHub Pages
});
