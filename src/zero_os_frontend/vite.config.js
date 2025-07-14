import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'dfinity': ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal'],
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      target: 'esnext',
    },
    exclude: [
      '@dfinity/agent',
      '@dfinity/auth-client', 
      '@dfinity/candid',
      '@dfinity/principal'
    ]
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  publicDir: "assets",
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
