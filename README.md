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

The production output is written to `dist/`.

## Deploying to GitHub Pages

This project is configured to deploy automatically to GitHub Pages via a
GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Push your changes to the `main` branch.
2. The **Deploy to GitHub Pages** workflow builds the site and publishes the
   `dist/` artifact.

### Required GitHub Pages setting

For the workflow to actually deploy, the repository's Pages source must be
set to **GitHub Actions**:

> **Settings → Pages → Build and deployment → Source → GitHub Actions**

(If it is currently set to *Deploy from a branch*, the branch content — the
raw source — is served directly instead of the built app.)

The build uses a relative base (`base: './'`) so the site works under the
`/Signal-Flow-Studio/` project subpath.
