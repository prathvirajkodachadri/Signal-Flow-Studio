import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react(), tailwindcss()];

  // The repo-root index.html doubles as a bootstrap page for GitHub Pages
  // ("Deploy from a branch" serves the raw repo root, where the Vite source
  // cannot run) — it redirects visitors to the prebuilt app in /docs/.
  // The built app inside /docs/ must NOT contain that redirect (the app runs
  // directly there), so strip the marked block from the production HTML.
  plugins.push({
    name: 'strip-pages-bootstrap',
    apply: 'build',
    transformIndexHtml(html: string) {
      const start = '<!-- @pages-bootstrap:strip';
      const end = '<!-- @pages-bootstrap:strip:end -->';
      const from = html.indexOf(start);
      const to = html.indexOf(end);
      if (from >= 0 && to > from) {
        return html.slice(0, from) + html.slice(to + end.length);
      }
      return html;
    },
  });
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    // Relative base so the built app works under any subpath,
    // including the GitHub Pages project URL (/Signal-Flow-Studio/)
    // and the local sandbox preview (served at /).
    base: './',
    // Publish a static build under /docs so GitHub Pages (branch + /docs)
    // can serve a real site without a Actions workflow.
    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
    plugins,
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      cors: true,
      headers: {
        'Content-Security-Policy': "frame-ancestors *",
      },
    } as any,
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: true,
      cors: true,
      headers: {
        'Content-Security-Policy': "frame-ancestors *",
      },
    } as any,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
