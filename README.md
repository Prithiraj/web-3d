# web-3d

A frontend-only interactive 3D landing-page prototype inspired by sculptural editorial web design.

The first implementation deliberately uses procedural Three.js geometry instead of external 3D assets. This lets us tune composition, camera, lighting, responsiveness and interaction before spending time on Blender production.

## Stack

- React 19 + Vite
- Three.js through React Three Fiber
- Drei helpers
- GSAP for DOM entrance motion
- Static deployment; no backend required

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Current scene

The hero is assembled from reusable runtime geometry:

- low-poly mountain forms
- GPU-instanced pine forest
- domed and arched architectural forms
- curved tube structures
- floating stones
- real-time lighting, fog and contact shadows
- subtle pointer-driven camera parallax
- semantic HTML layered over the WebGL scene

The site respects `prefers-reduced-motion` and includes responsive layouts for tablet and mobile.

## Architecture direction

The current version is intentionally frontend-only:

```text
Browser
├── React / semantic HTML
├── GSAP UI motion
└── React Three Fiber
    ├── procedural geometry
    ├── lighting + fog
    ├── instanced vegetation
    └── camera interaction
```

A backend is only needed later if the project adds persistent accounts, saved scenes, CMS content, private APIs, ecommerce, or user-triggered AI/3D generation.

## Next fidelity pass

After the visual composition is approved, selected procedural objects can be replaced with optimized `.glb` models exported from Blender. The React scene structure can remain the same while assets become more detailed.
