import { ArrowDown, FileText, Github } from "lucide-react";
import { affiliations, authors, siteConfig } from "@/config/site";

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-orbit orbit-one" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="container hero-content">
        <p className="kicker">Research demo · 2026</p>
        <h1>{siteConfig.title}</h1>
        <p className="hero-subtitle">Restoring early-20th-century orchestral recordings with latent conditional flow matching.</p>
        <div className="authors" aria-label="Authors">
          {authors.map((author) => (
            <span key={author.name}>{author.name}<sup>{author.affiliations.join(",")}</sup></span>
          ))}
        </div>
        <ol className="affiliations" aria-label="Affiliations">
          {affiliations.map((affiliation, index) => <li key={affiliation}><sup>{index + 1}</sup>{affiliation}</li>)}
        </ol>
        <div className="hero-actions">
          <a className="button button-primary" href="#demo">Listen to results <ArrowDown size={16} aria-hidden="true" /></a>
          {siteConfig.paperUrl && <a className="button button-secondary" href={siteConfig.paperUrl}>Read paper <FileText size={16} aria-hidden="true" /></a>}
          {siteConfig.githubUrl && <a className="icon-link" href={siteConfig.githubUrl} aria-label="View source code"><Github aria-hidden="true" /></a>}
        </div>
        <p className="hero-explanation">
          Historical recordings contain much more than bandwidth loss: noise, nonlinear distortion, spectral coloration, and unknown degradations occur simultaneously. We train a latent-space restoration model using synthetically degraded high-fidelity classical music.
        </p>
        <div className="contribution-row" aria-label="Key contributions">
          <span>149-song historical test set</span><span>44.1 kHz restoration</span><span>Latent conditional flow matching</span>
        </div>
      </div>
    </header>
  );
}
