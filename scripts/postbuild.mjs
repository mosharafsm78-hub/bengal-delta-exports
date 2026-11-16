// After the static build: remove query-string URLs from the sitemap, add a 404 page and the robots sitemap line.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'

const dir = 'dist/client'
const sm = `${dir}/sitemap.xml`
if (existsSync(sm)) {
  const xml = readFileSync(sm, 'utf8')
  const base = (process.env.BASE_PATH || '/').replace(/\/$/, '')
  const seen = new Set()
  // Crawled pages carry the base path twice; collapse it, use the trailing-slash URL GitHub Pages serves, and drop duplicates.
  const cleaned = xml
    .replace(/\s*<url>\s*<loc>[^<]*(\?|\/not-found|\/admin)[^<]*<\/loc>[\s\S]*?<\/url>/g, '')
    .replace(/<loc>([^<]*)<\/loc>/g, (_, u) => {
      let v = base ? u.split(base + base + '/').join(base + '/').replace(new RegExp(base + base + '$'), base) : u
      if (!v.endsWith('/')) v += '/'
      return `<loc>${v}</loc>`
    })
    .replace(/\s*<url>\s*<loc>([^<]*)<\/loc>[\s\S]*?<\/url>/g, (block, u) => (seen.has(u) ? '' : (seen.add(u), block)))
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
