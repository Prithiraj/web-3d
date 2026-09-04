import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import LandscapeScene from './LandscapeScene.jsx'

const railItems = [
  ['01', 'Stone forms', 'Soft displaced geometry'],
  ['02', 'Forest', 'Instanced miniature pines'],
  ['03', 'Shelters', 'Domes + arch passages'],
  ['04', 'Objects', 'Curved sculptural tubes'],
  ['05', 'Light', 'Warm studio direction'],
  ['06', 'Motion', 'Subtle pointer drift'],
  ['07', 'Surface', 'Ivory + sage palette'],
  ['08', 'Render', 'Browser-side WebGL'],
]

function OrganicPanel() {
  return (
    <svg className="panel-shape" viewBox="0 0 760 370" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="panel-paper"
        d="M18 0H742Q760 0 760 18V247C724 244 703 258 680 283C651 315 622 321 586 302C540 278 504 262 467 282C427 304 405 348 360 348C317 348 298 309 266 290C232 270 201 282 173 305C142 331 101 330 72 308C45 288 31 262 0 260V18Q0 0 18 0Z"
      />
      <path
        className="panel-accent"
        d="M274 325C312 335 330 357 360 357C393 357 414 330 446 319C478 308 510 315 537 329C506 322 482 323 458 334C420 352 400 370 359 370C320 370 298 351 274 325Z"
      />
    </svg>
  )
}

function App() {
  const root = useRef(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .from('.site-nav', { opacity: 0, y: -10, duration: 0.7 })
        .from('.editorial-card', { opacity: 0, y: 16, duration: 0.9 }, '-=0.35')
        .from('.editorial-card .copy-reveal', {
          opacity: 0,
          y: 9,
          duration: 0.6,
          stagger: 0.065,
        }, '-=0.55')
        .from('.scene-note', { opacity: 0, y: 7, duration: 0.5 }, '-=0.25')
        .from('.detail-rail', { opacity: 0, y: 14, duration: 0.75 }, '-=0.3')
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="app-shell">
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Stillspace home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>Stillspace</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#world">World</a>
          <a href="#details">Details</a>
          <a href="#notes">Notes</a>
        </nav>

        <span className="nav-index">Study / 02</span>
      </header>

      <main id="top">
        <section className="hero-stage" id="world" aria-labelledby="hero-title">
          <svg className="orbit-lines" viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
            <path d="M108 226C120 104 254 44 404 78C514 103 543 178 621 200" />
            <path d="M112 245C133 136 240 87 349 100" />
            <path d="M1002 124C1151 72 1295 116 1361 228" />
            <path d="M1038 149C1158 111 1276 149 1328 232" />
          </svg>

          <div className="scene-layer" aria-hidden="true">
            <LandscapeScene />
          </div>

          <article className="editorial-card">
            <OrganicPanel />
            <div className="panel-content">
              <div className="panel-meta copy-reveal">
                <span>Spatial study</span>
                <span>WebGL / 02</span>
              </div>

              <div className="panel-grid">
                <div className="panel-copy">
                  <p className="eyebrow copy-reveal">Research case / landscape</p>
                  <h1 id="hero-title" className="copy-reveal">Sculpted terrain.</h1>
                  <p className="panel-description copy-reveal">
                    A quiet miniature habitat shaped from stone, shelter, forest and light.
                  </p>
                  <div className="panel-status copy-reveal">
                    <span aria-hidden="true" />
                    Realtime scene · browser rendered
                  </div>
                </div>

                <div className="panel-side copy-reveal">
                  <p className="side-kicker">Environment system</p>
                  <h2>Stillspace.</h2>
                  <p>Soft architecture inside a living landscape study.</p>
                  <div className="side-row">
                    <span className="side-number">01</span>
                    <a href="#details">View details <span aria-hidden="true">↘</span></a>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="scene-note">
            <span>01</span>
            <p>Realtime miniature landscape</p>
          </div>

          <section className="detail-rail" id="details" aria-label="Scene details">
            <div className="rail-heading">
              <p>Environment / system</p>
              <span>Eight scene studies</span>
            </div>

            <div className="rail-grid">
              {railItems.map(([number, title, body]) => (
                <article className="rail-item" key={number}>
                  <div className="rail-icon" aria-hidden="true"><span>{number}</span></div>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="notes-section" id="notes" aria-labelledby="notes-title">
          <p className="notes-kicker">Direction / next</p>
          <h2 id="notes-title">The scene is treated as an art-directed object, not a collection of primitives.</h2>
          <p>
            The composition prioritizes scale, silhouette, material softness and negative space.
            Individual procedural forms can still be replaced by Blender assets later without changing
            the surrounding interaction model.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
