# BengalExport — Bangladesh export hub

Static website (TanStack Start + React + Tailwind), prerendered to plain HTML and hosted free on GitHub Pages.

- Catalogue data: `src/data/catalog.ts` (families, products, prices) and `src/data/photos.ts` (Pexels photos)
- Contact details, duty table, shipping data: `src/data/site.ts`
- Every push to `main` rebuilds and redeploys the site (`.github/workflows/deploy.yml`).

## Custom domain
1. Point the domain's DNS to GitHub Pages and add it under Settings → Pages.
2. Set repository variables `BASE_PATH=/`, `SITE_ORIGIN=https://yourdomain.com`, `SITE_URL=https://yourdomain.com`, then re-run the workflow.

## Quote form
Without `SUPABASE_URL` / `SUPABASE_KEY` repository variables, the form opens the buyer's email app addressed to the sales email in `site.ts`.
