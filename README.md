# Product Copilot (Web Prototype)

Static single-page web prototype for the AI Product Copilot MVP.

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy to Vercel

### Option 1: Vercel Dashboard (no CLI)
1. Push this repository/branch to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **Add New... → Project**.
3. Import the repository.
4. Keep defaults (Framework Preset: **Other**).
5. Build settings for this static app:
   - **Build Command**: *(leave empty)*
   - **Output Directory**: `.`
6. Click **Deploy**.

### Option 2: Vercel CLI
1. Install CLI:
   ```bash
   npm i -g vercel
   ```
2. From this repo root, run:
   ```bash
   vercel
   ```
3. For production deploy:
   ```bash
   vercel --prod
   ```

## Why `vercel.json` is included

This app is a SPA with client-side view switching.

`vercel.json` rewrites all routes to `index.html`, so direct deep links (for example `/ask` or `/status`) still load the app correctly.
