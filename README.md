# Sairam Gajabinkar — Portfolio

A personal portfolio website for **Sairam Gajabinkar**, iOS & macOS Developer / Project Lead.

Built with plain **HTML, CSS, and JavaScript** — a visionOS-style **spatial hub**: floating
glass "option tiles" replace the nav bar, and each section flies in as a 3D panel. Background is
an animated **matrix code-rain** with ambient glow. No frameworks, no build step, no CDN.

## Live site
Hosted free on **GitHub Pages**: https://sairam-work001.github.io/

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page content and structure |
| `style.css`  | Spatial-glass design system, layout, 3D transitions, animations |
| `script.js`  | Spatial navigation, matrix rain, edit mode, card tilt, count-up |

## Run locally
```bash
python3 -m http.server 8000
# then visit http://127.0.0.1:8000/
```

## Notes
- Add a photo at `assets/profile.png`; until then an "SG" monogram shows automatically.
- Fully self-contained — works offline and on any network (no external dependencies).
