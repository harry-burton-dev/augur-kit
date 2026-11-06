---
'@augur/kit-common': minor
'@augur/shell-kit': patch
---

The water's colours come from the tokens. Its five other presets (Deep Ocean, Aurora, Sonar Line, Minimal and Split Field) had their colours typed into the code. Their colours are now shell tokens (`water-*`), or Common's `navy`, `green`, `slate` and `slate-deep` where they already matched. Nothing looks different. The tokens-only test now reads the kits' plain TypeScript files too, and it reports raw distances in the kits' CSS and stops their count growing. A new Storybook test checks that every part the kits export has a story. Parts still waiting for one are listed, and they get their stories as they are restyled.
