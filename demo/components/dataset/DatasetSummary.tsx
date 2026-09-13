import { Database, Disc3, History, Music2 } from "lucide-react";
import { siteConfig } from "@/config/site";

const stats = [
  { value: "149", label: "historical recordings", icon: Database },
  { value: "9.30 h", label: "digitized music", icon: Music2 },
  { value: "78 RPM", label: "source recordings", icon: Disc3 },
  { value: "< 1926", label: "publication date", icon: History },
];

export function DatasetSummary() {
  return (
    <section className="section dataset-section" id="dataset" aria-labelledby="dataset-title">
      <div className="container">
        <div className="section-heading"><p className="eyebrow">Evaluation data</p><h2 id="dataset-title">Real historical test set</h2><p>The unpaired test set contains digitized, instrumental 78-rpm orchestral recordings from the Internet Archive, with authentic and varied historical degradation.</p></div>
        <div className="stat-grid">
          {stats.map(({ value, label, icon: Icon }) => <article key={label}><Icon size={18} aria-hidden="true" /><strong>{value}</strong><span>{label}</span></article>)}
        </div>
        <div className="dataset-copy">
          <p><strong>Orchestra</strong> contains classical symphonic orchestras. <strong>Light Orchestra</strong> contains other instrumental classical ensembles, including chamber and wind ensembles.</p>
          <p>Recordings span 1911–1925 and differ naturally in bandwidth limitation, surface noise, clicks, crackle, distortion, and preservation condition. There is no corresponding clean recording of the same performance.</p>
        </div>
        <div className="dataset-action">
          {siteConfig.datasetUrl ? (
            <a className="button button-primary" href={siteConfig.datasetUrl}>View dataset on Zenodo</a>
          ) : (
            <span className="button dataset-placeholder" aria-disabled="true">{siteConfig.datasetStatus}</span>
          )}
        </div>
      </div>
    </section>
  );
}
