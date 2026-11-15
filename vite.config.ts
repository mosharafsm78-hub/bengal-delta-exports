import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH: '/' on a custom domain, '/bengal-delta-exports/' on github.io.
const base = process.env.BASE_PATH || '/'
const host = process.env.SITE_ORIGIN || 'https://mosharafsm78-hub.github.io'

export default defineConfig({
  base,
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: true, failOnError: true, concurrency: 8 },
      sitemap: { enabled: true, host: host + base.replace(/\/$/, '') },
      pages: [{ path: '/' }, { path: '/not-found', sitemap: { exclude: true } }],
    }),
    viteReact(),
  ],
})
