# Visual Fidelity Rebuild Plan

The first implementation proved the rendering stack, but it did not meet the art-direction target. This rebuild treats the reference as a miniature sculptural diorama first and a technical Three.js demo second.

## Phase 1 — Composition lock

- Keep the scene inside a centered stage rather than filling the whole viewport with geometry.
- Match the reference balance: rocky mass on the left, small forest across the lower third, white architectural forms on the right, restrained floating stones above.
- Reduce object scale and tree density so the scene reads as a miniature model.
- Keep the main editorial panel centered above the landscape and preserve visible negative space around it.

**Acceptance gate:** the page should read correctly in grayscale before material polish.

## Phase 2 — Sculptural geometry

- Replace low-poly mountain blobs with grouped smooth rock spires built from displaced cone geometry.
- Replace large repeated conifers with smaller multi-tier instanced trees using controlled clustering.
- Replace primitive placeholder buildings with domes, arch tunnels, monoliths, circular caps and curved tubes.
- Add shrubs, low terrain mounds and a thin presentation plinth for miniature scale cues.

**Acceptance gate:** no major element should look like default Three.js primitive geometry.

## Phase 3 — Editorial panel

- Replace the rounded rectangle with an SVG-backed organic panel with an irregular lower edge.
- Keep all copy and interactions as semantic HTML above the SVG.
- Reduce typography scale and use much more negative space, closer to the supplied reference.

**Acceptance gate:** panel and scene should feel like one composition rather than HTML pasted over WebGL.

## Phase 4 — Materials, lighting and atmosphere

- Use warm ivory/stone materials with high roughness and subtle tonal variation.
- Use soft studio-style key/fill lighting, ACES tone mapping, restrained fog and contact shadows.
- Remove harsh contrast and obvious faceting.
- Keep the sage background flatter and calmer than the previous radial-heavy treatment.

**Acceptance gate:** shadows should support depth without becoming the visual subject.

## Phase 5 — Motion

- Keep pointer parallax under a few pixels/degrees.
- Float only selected stones and architectural details.
- Respect `prefers-reduced-motion`.

**Acceptance gate:** the scene should still look composed when animation is disabled.

## Phase 6 — Responsive and performance

- Maintain the desktop composition down to tablet widths.
- On mobile, hide secondary architecture and reduce tree/stone counts rather than shrinking everything uniformly.
- Use instancing for repeated vegetation and cap device pixel ratio.

## Release gate

Do not merge or publish this rebuild merely because it compiles. Before release:

1. production build must pass;
2. first-fold composition must be visually reviewed against the supplied reference;
3. no default-looking placeholder geometry may remain;
4. mobile must be checked separately;
5. only then merge to `main` and publish.
