# StatusNeo Insights

A StatusNeo-branded build of this Redash codebase: black and signal-yellow theme, a public landing page,
and a one-command launcher.

## Run it

```bash
./run.sh            # builds the image (first time takes several minutes), starts everything
```

Then open http://localhost:5000. Signed-out visitors see the landing page; **Launch Insights** goes to sign-in
(first run walks you through creating the admin account). Requires Docker with Compose.

Other commands: `./run.sh stop | restart | logs | status | build | reset` (`reset` deletes all data).
Secrets are generated into `.env.statusneo` (git-ignored). Change the port with `STATUSNEO_PORT` there.

## Where things live

| What | Where |
| --- | --- |
| Landing page | `redash/templates/landing.html`, `client/app/landing/landing.css`, `landing.js` |
| Landing route (`/` signed-out, `/welcome` always) | `redash/handlers/static.py` |
| Global theme (all app + login pages) | `client/app/statusneo/theme.css` (colours/fonts are the `:root` tokens) |
| Ant Design / Bootstrap colour variables | `client/app/assets/less/inc/ant-variables.less`, `variables.less` |
| Logo (SVG, plus PNG favicons) | `client/app/assets/images/statusneo-mark.svg` |
| Fonts (OFL licensed) | `client/app/assets/fonts/statusneo/` |
| Launcher + production compose | `run.sh`, `compose.statusneo.yaml` |

After editing UI code run `./run.sh build && ./run.sh restart`.

## Notes

- The brand mark and fonts are placeholders chosen to fit the StatusNeo look; swap the SVG and the `:root` tokens
  for official assets.
- Redash's in-app "Help" links and email templates still point to Redash and are not re-themed.
- Built on open-source Redash (BSD-2-Clause); the original license files are kept.
