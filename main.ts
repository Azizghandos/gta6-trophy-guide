// Leonida Trophy Guide: the hand-in program (Node 22, standard library only).
// The guide itself is app/ — plain static files a browser opens at
// app/index.html, offline, with its trophy data in app/data/trophies.json.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into /output and writes /output/dossier.json, the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source), using the vendored make.fun library. vendor/makefun-frontend.ts
// stays exactly as the kit shipped it: the scorer rebuilds the dossier with
// its own copy and the two must match byte for byte.
//
// Run it locally with `node serve.ts` to try the app at http://localhost:8080,
// then hand it in with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The gate's caps: at most 4 screenshots, each at most 256 KiB; app/ at most
// 993 files and directories and 48 MiB in all; the dossier text at most
// 160 KiB. The dossier is only built while app/ and screenshots/ fit them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
