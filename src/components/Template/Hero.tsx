import Link from 'next/link';

import profile from '@/data/profile.json';
import { smartQuotes } from '@/lib/typography';

import Portrait from './Portrait';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-primary">
          <p className="hero-kicker">
            Artificial Intelligence &amp; Data Science
          </p>
          <h1 className="hero-title">
            <span className="hero-name">{smartQuotes(profile.name)}</span>
          </h1>
          <p className="hero-tagline">
            I’m an {profile.role} at{' '}
            <span className="hero-highlight">{profile.employer}</span>, working
            on {profile.focus}.
          </p>

          <p className="hero-summary">
            I build machine learning systems, explore agentic AI workflows, and
            investigate neural computation from scratch. B.Tech student in AI
            &amp; Data Science at Dr. D. Y. Patil Institute of Technology, Pune.
          </p>

          <div className="hero-cta">
            <Link href="/about" className="button">
              About me
            </Link>
            <Link href="/resume" className="hero-resume-link">
              View resume
            </Link>
          </div>
        </div>

        <figure className="hero-portrait">
          <Portrait width={320} height={320} priority />
          <figcaption>{profile.currentCity}</figcaption>
        </figure>
      </div>
    </section>
  );
}
