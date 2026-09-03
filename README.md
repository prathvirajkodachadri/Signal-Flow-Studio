# Signal Flow Studio

An interactive audio signal flow visualization. Learn mixing, bus routing, gain staging, and mastering through animated visuals.

Live site: **https://prathvirajkodachadri.github.io/Signal-Flow-Studio/**

## Tech stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- lucide-react icons

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output (including a `404.html` SPA fallback) is written to
`docs/`. The build uses a relative base (`base: './'`), so it works under the
`/Signal-Flow-Studio/` project subpath.

## Deploying to GitHub Pages

The site can be deployed two ways.

### Option A — GitHub Actions (recommended for future deploys)

An example workflow is provided at `examples/github-pages-deploy.yml`:

1. Copy it into `.github/workflows/deploy.yml` in your own commit.
2. In **Settings → Pages → Build and deployment**, set **Source** to
   **GitHub Actions**.
3. Push changes to `main` (or run the workflow manually from the Actions tab).

The built app is then served directly from the site root, e.g.
`https://prathvirajkodachadri.github.io/Signal-Flow-Studio/`.

> Note: automated agents with limited GitHub permissions cannot create files
> under `.github/workflows/` — the copy needs to be committed by a repo owner
> or an agent with `workflows` permission.

### Option B — Deploy from a branch (current setting)

If Pages is set to **Deploy from a branch → main / (root)**, GitHub Pages
serves the raw repository root — where the Vite source can't run in a browser.
To keep the site working in that mode:

- The committed `docs/` folder contains the prebuilt app.
- The repo-root `index.html` (and `404.html`) detect GitHub Pages and
  redirect visitors to `/Signal-Flow-Studio/docs/`, where the built app runs.
  Local `npm run dev` is unaffected (different hostname, no redirect).

> Keep `docs/` up to date in this mode: after changing source, run
> `npm run build` and commit the regenerated `docs/` output along with your
> changes.
