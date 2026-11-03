---
'@augur/kit-common': minor
---

Letterbox: urgent is never dismissed (PDR-009). This changes its API: `onClose` is now `onStepBack`. Esc, and a new Step back control, put the item back on the edge; without `onStepBack`, Esc does nothing and the item must be answered first. Rename `onClose` to `onStepBack` where you use it.

Letterbox also gains `acknowledged` and `onAcknowledge` (an acknowledgement chip in the bottom bar, and the key A; acknowledging is not resolving), `bars` (what the bars above and below the frame say) and `queue` ("1 of 2 · next: …" in the top bar). Two new parts: `Explain`, the four-part explanation (what happened, why it matters, what you can do, who else can act), and `UrgentEdge`, the stepped-back urgent item on the edge rule, a button that reopens it. New tokens `letterbox-min-frame` (the frame never gets shorter than this) and `edge-rule`. `Heading` takes an optional `summaryId`.
