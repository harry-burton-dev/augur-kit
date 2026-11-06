---
'@augur/app-kit': minor
'@augur/kit-common': minor
---

Consequence focus for the radial menu (V6). An action can name what it `touches` (`RingTouch`: id, label, effect). While it has focus, each thing on the page marked with `useRingTouch(id)` steps forward out of the rack. It is framed in ink (red for what danger breaks), with its effect and a lead from the subject. The readout lists every touch in words, so things scrolled off screen are still named. A held action that touches something is letterboxed until it is let go. The letterbox shows what it does, what it touches, how to cancel and, when the app gives `undo`, how to undo it. With reduced motion it is letterboxed between the two presses. `useRack` takes `holes` to keep more than one box sharp. Common's `Letterbox` gains `passive`, which draws the frame without a dialog while focus stays where the decision is being made.
