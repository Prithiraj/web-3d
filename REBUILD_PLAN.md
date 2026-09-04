# Visual Fidelity Rebuild Plan

The first implementation proved the rendering stack, but it did not meet the art-direction target. This rebuild treats the reference as a miniature sculptural diorama first and a technical Three.js demo second.

## Phase 1 — Composition lock

- Keep the scene inside a centered stage rather than filling the whole viewport with geometry.
- Match the reference balance: rocky mass on the left, small forest across the lower third, white architectural forms on the right, restrained floating stones above.
- Reduce object scale and tree density so the scene reads as a miniature model.
- Keep the main editorial panel centered above the landscape and preserve visible negative space around it.

**Acceptance gate:** the page should read correctly in grayscale before material polish.

## Phase 2 — Sculptural geometry

- Replace low-poly mountain blobs with grouped smooth rock spires built from displaced geometry.
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

## Phase 5 — Perspective and shadow lock

Perspective and shadows are treated as the final static-image gate before motion is allowed to add anything.

- Use a long-lens perspective camera rather than a wide-angle camera. Target roughly 25–27° field of view so the scene reads almost orthographic while still preserving near/far scale differences.
- Pitch the camera gently downward so the tops of the plinth, architecture and vegetation are visible. This is what makes the diorama read as an object rather than a flat elevation.
- Do not rotate the whole world from pointer input. The static composition must remain locked.
- Place the key light above/front-left so trees, rocks and architectural pieces cast readable shadows diagonally across the plinth.
- Reduce ambient/fill light enough that those shadows remain visible, while using a cool weak fill to keep the dark side from crushing.
- Use a soft shadow kernel plus tuned bias/normal-bias to avoid detached shadows and acne.
- Layer tight contact shadows under feet/trunks/buildings with a broader low-opacity ambient shadow for grounding.

**Acceptance gate:** with all animation disabled, foreground/midground/background must be immediately readable from perspective, overlap and cast shadows alone.

## Phase 6 — Motion polish

Motion is additive only; it must never repair a weak static composition.

- Use subtle camera translation instead of world rotation: less than ~0.2 world units from pointer input.
- Add a very small scroll dolly/pitch change so the scene feels spatial without visibly changing the composition.
- Float only selected stones and rotate one or two small architectural details very slowly.
- Keep vegetation and mountains static so their shadows stay visually trustworthy.
- Respect `prefers-reduced-motion` and keep the reduced-motion frame fully composed.

**Acceptance gate:** motion should be noticed after a moment, not immediately.

## Phase 7 — Responsive and performance

- Maintain the desktop composition down to tablet widths.
- On mobile, hide secondary architecture and reduce tree/stone counts rather than shrinking everything uniformly.
- Use instancing for repeated vegetation and cap device pixel ratio.
- Keep shadow-map resolution and soft-shadow sample count inside a mobile-safe budget.

## Release gate

Do not merge or publish this rebuild merely because it compiles. Before release:

1. production build must pass;
2. first-fold composition must be rendered and visually reviewed against the supplied reference;
3. perspective must show a readable miniature stage without wide-angle distortion;
4. shadows must visibly ground the mountains, forest and architecture;
5. motion must remain subtle and the reduced-motion frame must still work;
6. mobile must be checked separately;
7. only then merge to `main` and publish.
