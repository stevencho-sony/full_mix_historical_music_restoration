"use client";

import { Check, Copy, Database, FileText, Github } from "lucide-react";
import { useState } from "react";
import { preliminaryBibtex, siteConfig } from "@/config/site";

export function PaperSection() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preliminaryBibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section paper-section" id="paper" aria-labelledby="paper-title">
      <div className="container paper-grid">
        <div className="paper-card">
          <p className="eyebrow">Paper</p>
          <h2 id="paper-title">{siteConfig.title}</h2>
          <p>Steven Cho, Junghyun Koo, Raphael Lafargue, Tushar Dhyani, Eloi Moliner, and Yuki Mitsufuji</p>
          <div className="paper-actions">
            {siteConfig.paperUrl && <a className="button button-primary" href={siteConfig.paperUrl}><FileText size={16} aria-hidden="true" /> PDF</a>}
            {siteConfig.githubUrl && <a className="button button-secondary" href={siteConfig.githubUrl}><Github size={16} aria-hidden="true" /> Code</a>}
            {siteConfig.datasetUrl && <a className="button button-secondary" href={siteConfig.datasetUrl}><Database size={16} aria-hidden="true" /> Dataset</a>}
          </div>
        </div>
        <div className="citation-card">
          <div><p className="eyebrow">Preliminary citation</p><button type="button" onClick={() => void copy()}>{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></div>
          <pre><code>{preliminaryBibtex}</code></pre>
        </div>
      </div>
    </section>
  );
}
