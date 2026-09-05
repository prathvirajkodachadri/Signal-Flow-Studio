# Signal Flow Studio

An interactive audio signal flow visualization. Learn mixing, bus routing, gain staging, and mastering through animated visuals — then check the result against the platform you are going to upload to.

Live site: **https://prathvirajkodachadri.github.io/Signal-Flow-Studio/**

## Built around one question: where are you uploading?

Everything in a session is derived from the **delivery target**. The default is
**YouTube + Spotify** — one master that has to survive both pipelines:

| Destination | Integrated | True peak | Mix-bus peak | Normalization |
|---|---|---|---|---|
| **YouTube + Spotify** (default) | -14 LUFS | -1.0 dBTP | -6 to -3 dBFS | Spotify up/down, YouTube down-only |
| YouTube | -14 LUFS | -1.0 dBTP | -6 to -3.5 dBFS | Down-only (quiet uploads stay quiet) |
| Spotify | -14 LUFS | -1.0 dBTP (-2.0 if louder than -14) | -6 to -3 dBFS | Up and down |
| Apple Music | -16 LUFS | -1.0 dBTP | -8 to -4 dBFS | Sound Check |
| SoundCloud / Bandcamp | -14 LUFS | -1.0 dBTP | -6 to -3 dBFS | ~ -14 LUFS |
| Reels / Shorts / TikTok | -14 LUFS | -1.5 dBTP | -6 to -3.5 dBFS | Down-only, heavy encode |
| Broadcast (EBU R128) | -23 LUFS | -1.0 dBTP | -12 to -8 dBFS | Fixed delivery spec |

Changing the destination changes the session:

- **Signal flow** grows a stage 8 — *Delivery* — after the pre-master, so the
  chain now reads Source → Inserts → Fader/Pan → Sends → Subgroups → Mix Bus →
  Pre-Master → Platform encode.
- Stations 1-4 (gain staging, inserts, faders, sends) are **universal** and stay
  at -18/-16/-14/-18 dBFS. Stages 5-8 are **platform-set**: subgroup bus
  windows, mix-bus headroom, limiter ceiling and LUFS target all move.
- Every channel and subgroup window shifts by the platform's trim, and the
  upload check re-runs (LUFS, true peak, PLR, limiter budget and the exact dB
  each platform will turn the master up or down by).

### The delivery model

`src/data/platforms.ts` models the mastering chain that reaches the platform:

- makeup gain needed to hit the true-peak ceiling (6 dB is the transparent
  budget — that is why the mix-bus window is -6 to -3 dBFS),
- crest-factor loss when a mix arrives too hot and peaks get shaved,
- integrated loudness = true peak − effective crest,
- what each platform's normalizer then does to that master.

## Visual Guides

The **Visual Guides** tab opens on **Full Signal Path** — the whole chain on one
page, from 🎙️ raw recording to 🎵 professional output. Each of the ten stations
carries its target level (drawn as a window on a −30 … 0 dBFS scale), its
processing order and the one rule it exists to enforce:

| Station | Target |
|---|---|
| Raw recording | ≈ −18 dBFS average, ≈ −12 to −10 dBFS typical peak |
| Input gain / pre-gain | ≈ −18 dBFS average |
| Insert processing (EQ → comp → saturation → FX) | in ≈ −18 dBFS, out level-matched for A/B |
| Channel / track | ≈ −12 to −6 dBFS peak * |
| Group / instrument bus | ≈ −12 to −6 dBFS peak * |
| Mix bus | ≈ −6 to −3 dBFS typical working peak * |
| Premaster | no clipping, dynamics preserved, mastering headroom kept |
| Mastering | EQ → dynamic EQ/comp → saturation/clipping → limiting (as required) |
| Final master | ≈ −1.0 dBTP ceiling, LUFS chosen from the genre and arrangement |

\* Working references, not numbers to meter to the decimal — the sidebar
footnote says so, and the same sidebar reduces the whole path to six moves:
healthy level → process → level-match → balance → headroom → master.

The remaining pages go deeper on each stage: Recording, Mixing, Mastering,
YouTube + Spotify Delivery, Indian Songs & Styles, Gain Staging Rules and Bus
Routing Logic.

## Indian songs & styles

The style picker has an **Indian Songs & Styles** group with eight presets, each
shipped with reference songs to A/B against:

- **Bollywood / Filmi Pop** — strings, dholak, tabla, harmonium, bansuri, playback vocal
- **Punjabi / Bhangra** — dhol, tumbi, 808, chant-along choruses
- **Hindustani Classical** — khayal vocal, tabla, tanpura, sarangi (wide dynamics, -16 to -18 LUFS)
- **Carnatic Classical** — kriti vocal, mridangam, ghatam/kanjeera, veena, sruti
- **Sufi / Ghazal / Qawwali** — harmonium-led party vocals, hand percussion, long halls
- **Bhajan / Devotional** — call-and-response, bells, temple ambience
- **Indian Indie / Indie-Pop** — live kit, warm bass, guitars, Hindi/English vocals
- **South Indian Film** — layered folk percussion, brass stabs, mass vocals

The instrument library includes **tabla, dholak, dhol, mridangam, ghatam,
kanjeera, sitar, sarod, sarangi, veena, santoor, bansuri, shehnai, harmonium,
tanpura, tumbi** plus playback, Hindustani and Carnatic voices — each with its
own dB window, pan position, frequency range and suggested processing. The
Visual Guides tab has a dedicated **Indian Songs & Styles** page with the full
instrument level table, mixing notes and release checklist.

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
