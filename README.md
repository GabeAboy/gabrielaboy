# gabrielaboy.com

Personal site. Static HTML/CSS — no build step.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

Custom domain is configured via the `CNAME` file. Point an `A`/`ALIAS` record for
`gabrielaboy.com` at GitHub Pages and enable Pages → "GitHub Actions" as the source.

## Layout

- `index.html` — landing page
- `assets/` — portrait, logos
- `githired/`, `mocks/bank_automation/`, `scriptstore/landing/`, `tandem/landing/` —
  iframe targets shown in the project carousels.
