import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class HomeController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderLandingPage(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AmoraVibe — Authentic Connections</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Playfair+Display:wght@600&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg: #06040d;
        --card: rgba(15, 11, 26, 0.78);
        --accent: #ff4da4;
        --accent-light: #ff8ec7;
        --text: #f8f0ff;
        --muted: #bcb0d6;
        --stroke: rgba(255, 255, 255, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Space Grotesk', 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at top, rgba(255, 77, 164, 0.25), transparent 45%),
          radial-gradient(circle at 15% 20%, rgba(79, 101, 255, 0.25), transparent 40%),
          radial-gradient(circle at 70% 10%, rgba(255, 187, 92, 0.2), transparent 35%),
          var(--bg);
        color: var(--text);
        overflow-x: hidden;
      }

      .glow {
        position: fixed;
        inset: 0;
        pointer-events: none;
        mix-blend-mode: screen;
        filter: blur(120px);
        opacity: 0.6;
        background: radial-gradient(circle at 20% 20%, rgba(255, 77, 164, 0.35), transparent 55%),
          radial-gradient(circle at 80% 0%, rgba(92, 125, 255, 0.25), transparent 50%);
      }

      header {
        padding: 2.5rem clamp(1.25rem, 4vw, 3.75rem) 1.5rem;
        position: relative;
        z-index: 1;
      }

      nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        font-size: 1.2rem;
      }

      .logo svg {
        width: 44px;
        height: 44px;
        filter: drop-shadow(0 12px 20px rgba(255, 77, 164, 0.45));
      }

      .pill {
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.85rem 1.6rem;
        border-radius: 999px;
        text-transform: uppercase;
        font-size: 0.78rem;
        letter-spacing: 0.2em;
        color: var(--muted);
      }

      main {
        position: relative;
        z-index: 1;
        padding: 0 clamp(1.25rem, 4vw, 3.75rem) 3.5rem;
      }

      .hero {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 3rem;
        align-items: center;
        margin-bottom: 4rem;
      }

      .badge {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--muted);
        margin-bottom: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .badge::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
      }

      .headline {
        font-size: clamp(2.6rem, 5vw, 4.75rem);
        line-height: 1.05;
        font-family: 'Playfair Display', serif;
        margin: 0 0 1.5rem;
      }

      .headline span {
        color: var(--accent-light);
      }

      .lede {
        font-size: 1.15rem;
        color: var(--muted);
        max-width: 38ch;
        margin-bottom: 2.2rem;
      }

      .cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
      }

      .cta {
        border: none;
        padding: 0.95rem 2.4rem;
        border-radius: 999px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: transform 220ms ease, box-shadow 220ms ease;
        background: linear-gradient(120deg, #ff4da4, #ff8ec7);
        color: #160814;
        box-shadow: 0 20px 45px rgba(255, 77, 164, 0.35);
      }

      .cta.secondary {
        background: transparent;
        color: var(--accent-light);
        border: 1px solid rgba(255, 142, 199, 0.5);
        box-shadow: none;
      }

      .cta:hover {
        transform: translateY(-4px);
      }

      .card-stack {
        background: var(--card);
        border: 1px solid var(--stroke);
        padding: 2.5rem;
        border-radius: 32px;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 25px 55px rgba(5, 0, 15, 0.65);
      }

      .card-stack::before {
        content: '';
        position: absolute;
        inset: 14px;
        border: 1px dashed rgba(255, 255, 255, 0.08);
        border-radius: 26px;
        pointer-events: none;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(110px, 1fr));
        gap: 1.35rem;
        margin-bottom: 2.4rem;
      }

      .stat h3 {
        margin: 0;
        font-size: 2rem;
        color: var(--accent-light);
      }

      .stat p {
        margin: 0.3rem 0 0;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
      }

      .feature-card {
        padding: 1.5rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.07);
        backdrop-filter: blur(8px);
        min-height: 170px;
      }

      footer {
        padding: 3rem clamp(1.25rem, 4vw, 3.75rem);
        color: var(--muted);
        text-align: center;
      }

      @media (max-width: 640px) {
        nav {
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }

        .card-stack {
          padding: 1.8rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="glow" aria-hidden="true"></div>
    <header>
      <nav>
        <div class="logo">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AmoraVibe logo">
            <path
              d="M32 56s-18.5-12.6-25-23.2C5 28 4 24.6 4 21c0-7.4 5.6-13 13-13 6.6 0 11.7 4.3 15 9.8C35.3 12.3 40.4 8 47 8c7.4 0 13 5.6 13 13 0 3.6-1 7-3 11.8C50.5 43.4 32 56 32 56z"
              fill="none"
              stroke="#ff4da4"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M46 13c6 0 11 5 11 11" stroke="#ff4da4" stroke-width="4" stroke-linecap="round" fill="none" />
            <path d="M48 20l-9.5 9.5L32 23" stroke="#ff4da4" stroke-width="4" stroke-linecap="round" fill="none" />
          </svg>
          <span>AmoraVibe</span>
        </div>
        <div class="pill">Authenticity-first dating</div>
      </nav>
    </header>
    <main>
      <section class="hero">
        <div>
          <p class="badge">Risk-aware connections</p>
          <h1 class="headline">
            Feel <span>seen</span>, safe, and celebrated—
            <br />find your frequency.
          </h1>
          <p class="lede">
            AmoraVibe pairs intentional identity verification with nuanced orientation pools so every hello carries trust,
            consent, and chemistry.
          </p>
          <div class="cta-row">
            <button class="cta">Join the private beta</button>
            <button class="cta secondary">Explore safety brief</button>
          </div>
        </div>
        <div class="card-stack">
          <div class="stats">
            <article class="stat">
              <h3>62k</h3>
              <p>verified sparks ignited</p>
            </article>
            <article class="stat">
              <h3>92%</h3>
              <p>members feel fully represented</p>
            </article>
            <article class="stat">
              <h3>4.9★</h3>
              <p>trust & safety sentiment</p>
            </article>
          </div>
          <div class="features">
            <article class="feature-card">
              <p class="badge">Layered KYC</p>
              <p>Seamless selfie, document, and social proofing keeps catfishing out of your orbit.</p>
            </article>
            <article class="feature-card">
              <p class="badge">Orientation pools</p>
              <p>Match in curated spectrums—hetero, queer, fluid, or bespoke cohorts.</p>
            </article>
            <article class="feature-card">
              <p class="badge">Device telemetries</p>
              <p>We quietly score device trust so you focus on the chemistry, not the risk.</p>
            </article>
          </div>
        </div>
      </section>
      <section class="pill" style="margin: 0 auto; text-align: center; max-width: 520px;">
        Launching soon in Lagos, London, and New York.
      </section>
    </main>
    <footer>Built with care · hello@amoravibe.app</footer>
  </body>
</html>`;
  }
}
