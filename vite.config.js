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
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    outDir: "dist", // Output directory
    assetsInlineLimit: 4096, // This ensures SVGs are processed as assets
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React dependencies together
          'react-vendor': ['react', 'react-dom'],
          
          // Group Supabase dependencies
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Group all icons together
          'icons': [
            'react-icons/gr',
            'react-icons/bs',
            'react-icons/md',
            'react-icons/io5',
            'react-icons/bi'
          ],
          
          // Group utilities together
        }
      }
    },
    target: 'esnext'
  },
  base: process.env.NODE_ENV === "production" ? "/Contribution-Tracker/" : "/", // Use correct base for GitHub Pages
});
