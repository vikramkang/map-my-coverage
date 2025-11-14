export default function HomePage() {
  return (
    <>
      <div className="hero-wrap">
        <section className="card hero-main">
          <div className="hero-pill">
            <span>For Canadians</span>
            <span>Neutral coverage checkup</span>
          </div>
          <h1 className="hero-title">
            Trusted insurance gap analysis, not a sales pitch.
          </h1>
          <p className="hero-subtitle">
            Map My Coverage acts like a quiet analyst beside your existing
            policies. In a few questions, it highlights where your life, home,
            auto, and travel coverage might be thin, missing, or more than you
            really need.
          </p>
          <div className="hero-actions">
            <a href="/login" className="btn btn-primary">
              Start coverage checkup
            </a>
            <a href="/register" className="btn btn-secondary">
              Create account
            </a>
          </div>
          <p className="hero-metadata">
            Built for Canadian residents · Great starting point for Ontario
            drivers and homeowners
          </p>
        </section>

        <aside className="card card--dark hero-side">
          <h2 className="hero-side__title">Why advisors embed this widget</h2>
          <p className="hero-side__text">
            Use Map My Coverage as a pre-meeting questionnaire on your site.
            Your visitors get clarity, you get structured signals about their
            protection gaps.
          </p>
          <ul className="hero-side__list">
            <li>Simple, client-facing intake you can embed via iframe</li>
            <li>Consistent risk scoring instead of scattered notes</li>
            <li>
              Conversation starter for life, home, auto, and travel needs
            </li>
          </ul>
        </aside>
      </div>

      <div className="home-sections">
        <section className="card home-section-card">
          <h2 className="home-section-title">About Map My Coverage</h2>
          <p className="home-section-text">
            This tool is designed for Canadian households and advisors who want
            a clear, structured view of insurance coverage—not product pushes.
            It aggregates a few key details about your life situation and
            returns a prioritized view of risks.
          </p>
        </section>

        <section className="card home-section-card">
          <h2 className="home-section-title">How the checkup works</h2>
          <ul className="home-section-list">
            <li>
              Answer a short set of questions about family, housing, vehicle,
              and travel.
            </li>
            <li>Our rule engine scores your exposure in each category.</li>
            <li>
              You see a simple summary you can review with an advisor you trust.
            </li>
          </ul>
        </section>

        <section className="card home-section-card">
          <h2 className="home-section-title">What we look at today</h2>
          <ul className="home-section-list">
            <li>
              Life insurance needs based on income, dependants, and mortgage.
            </li>
            <li>
              Auto liability levels against common Ontario benchmarks.
            </li>
            <li>
              Home vs. tenant coverage depending on whether you own or rent.
            </li>
            <li>Travel medical considerations when you leave Canada.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
