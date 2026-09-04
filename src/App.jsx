import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import LandscapeScene from './LandscapeScene.jsx'

const features = [
  {
    number: '01',
    title: 'Procedural terrain',
    body: 'Mountains, trees, stones and architectural forms are generated from reusable Three.js geometry.',
  },
  {
    number: '02',
    title: 'Real-time depth',
    body: 'Lighting, fog, shadows and camera parallax give the scene true spatial depth instead of a flat image stack.',
  },
  {
    number: '03',
    title: 'HTML-first content',
    body: 'Navigation, copy and calls to action remain semantic HTML for accessibility, responsiveness and SEO.',
  },
  {
    number: '04',
    title: 'No backend required',
    body: 'The first version is a static frontend. A backend can be added later only for accounts, content or generation workflows.',
  },
]

function App() {
  const root = useRef(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const ctx = gsap.context(() => {
      gsap.from('.site-nav', {
        opacity: 0,
        y: -16,
        duration: 0.8,
        ease: 'power3.out',
      })

      gsap.from('.hero-card > *', {
        opacity: 0,
        y: 20,
        duration: 0.9,
        stagger: 0.08,
        delay: 0.2,
        ease: 'power3.out',
      })

      gsap.from('.hero-meta', {
        opacity: 0,
        y: 12,
        duration: 0.8,
        delay: 0.65,
        ease: 'power3.out',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="app-shell">
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Stillspace home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>Stillspace</span>
        </a>

        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#process">Process</a>
          <a href="#about">About</a>
        </div>

        <a className="nav-cta" href="#process">
          View system
        </a>
      </nav>

      <main id="top">
        <section className="hero" id="experience" aria-labelledby="hero-title">
          <div className="scene-layer" aria-hidden="true">
            <LandscapeScene />
          </div>

          <article className="hero-card">
            <div className="hero-kicker">
              <span>Digital habitat</span>
              <span>WebGL / 01</span>
            </div>

            <h1 id="hero-title">A quieter kind of digital world.</h1>
            <p>
              An editorial 3D landscape built in the browser with procedural geometry,
              soft materials and restrained motion.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#process">
                Explore the build
              </a>
              <a className="text-link" href="#about">
                Why this approach <span aria-hidden="true">↘</span>
              </a>
            </div>
          </article>

          <div className="hero-meta" aria-label="Technology summary">
            <span>React</span>
            <span>Three.js</span>
            <span>React Three Fiber</span>
            <span>GSAP</span>
          </div>

          <div className="hero-index" aria-hidden="true">
            <span>01</span>
            <span>Realtime landscape study</span>
          </div>
        </section>

        <section className="feature-section" id="process" aria-labelledby="process-title">
          <header className="section-heading">
            <p className="section-kicker">System / 2026</p>
            <h2 id="process-title">Built as a scene, not a screenshot.</h2>
            <p>
              The visual language is inspired by sculptural editorial websites, while the
              implementation remains modular, responsive and ready for production assets.
            </p>
          </header>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-icon" aria-hidden="true">
                  <span>{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div>
            <p className="section-kicker">Direction / next</p>
            <h2 id="about-title">Prototype first. Replace only what earns more fidelity.</h2>
          </div>
          <p>
            The current scene intentionally uses geometry created in code. Once the camera,
            composition and interaction feel right, selected objects can be swapped for
            optimized Blender models without changing the surrounding application.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <span>Stillspace / interactive study</span>
        <span>Static frontend · no backend</span>
      </footer>
    </div>
  )
}

export default App
