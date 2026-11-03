---
'@augur/kit-common': minor
'@augur/kit-bundle': minor
---

Common now carries reduced motion and its typefaces, which the Lit kit's `base.css` used to give the shell. Each movement token has its reduced value in the token files (`$extensions.augur.reduced`), and `tokens.css` sets those under `prefers-reduced-motion: reduce` and under `data-motion="reduce"` on `<html>`: moves become near-instant, loops stop and nothing travels. The new `@augur/kit-common/fonts.css` holds Jost and Nunito from Fontsource, with their files next to it. The kit bundle serves it as `fonts.css` with `fonts/`, and lists it in `kit.json`'s `styles` after `tokens.css`, so a shell that links the bundle's styles needs no Fontsource of its own.
