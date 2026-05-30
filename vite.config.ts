import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// PWA: installable, offline-capable shell. The categorizer + IndexedDB mean the
// app is fully functional with no network. Web Share Target is intentionally
// NOT configured here yet — see the marker in the manifest below for where it
// will plug in (v2).
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'LinkHive',
        short_name: 'LinkHive',
        description: 'Save, auto-categorize, and quickly retrieve links — offline.',
        theme_color: '#0d0d0d',
        background_color: '#f9f9f9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/pwa-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // ─────────────────────────────────────────────────────────────────────
        // FUTURE (v2): Web Share Target plugs in HERE. Add a `share_target`
        // block so the OS share sheet can hand URLs straight to LinkHive:
        //
        //   share_target: {
        //     action: '/share',
        //     method: 'GET',
        //     params: { title: 'title', text: 'text', url: 'url' },
        //   }
        //
        // A /share route would then call the same saveRaw(url) → enrich(record)
        // path the Add-link sheet uses. Not implemented in v1.
        // ─────────────────────────────────────────────────────────────────────
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
