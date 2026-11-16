// After the static build: remove query-string URLs from the sitemap, add a 404 page and the robots sitemap line.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'

const dir = 'dist/client'
const sm = `${dir}/sitemap.xml`
if (existsSync(sm)) {
  const xml = readFileSync(sm, 'utf8')
  const cleaned = xml.replace(/\s*<url>\s*<loc>[^<]*(\?|\/not-found|\/admin)[^<]*<\/loc>[\s\S]*?<\/url>/g, '')
  writeFileSync(sm, cleaned)
  const count = (cleaned.match(/<loc>/g) || []).length
  console.log(`sitemap: ${count} URLs`)
  const loc = cleaned.match(/<loc>([^<]*)<\/loc>/)
  if (loc) {
    const origin = loc[1].replace(/\/$/, '')
    writeFileSync(`${dir}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${origin}/sitemap.xml\n`)
  }
}
if (existsSync(`${dir}/not-found/index.html`)) copyFileSync(`${dir}/not-found/index.html`, `${dir}/404.html`)
writeFileSync(`${dir}/.nojekyll`, '')
