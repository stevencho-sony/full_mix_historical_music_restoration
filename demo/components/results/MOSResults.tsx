import type { CSSProperties } from "react";
import type { MosResult } from "@/types/results";
import { mosPreservation, mosQuality } from "@/data/results";

const methodColors: Record<string, string> = {
  INPUT: "#2563eb",
  BABE2_PRETRAINED: "#dc2626",
  BABE2_FOS: "#d97706",
  CFM40_GRAMOPHONE_ONLY: "#16a34a",
  CFM40: "#7c3aed",
  GROUND_TRUTH: "#0891b2",
};

function MosChart({ data, label }: { data: MosResult[]; label: string }) {
  return (
    <div
      className="mos-chart"
      style={{ "--count": data.length } as CSSProperties}
      role="img"
      aria-label={`${label} means and 95 percent confidence intervals on a one-to-five scale`}
    >
      <div className="mos-axis" aria-hidden="true"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span></div>
      <div className="mos-columns">
        {data.map((item) => {
          const mean = ((item.mean - 1) / 4) * 100;
          const low = Math.max(0, ((item.ciLow - 1) / 4) * 100);
          const high = Math.min(100, ((item.ciHigh - 1) / 4) * 100);
          return (
            <div
              className="mos-column"
              key={item.method}
              title={`${item.mean.toFixed(2)} (95% CI ${item.ciLow.toFixed(2)}–${item.ciHigh.toFixed(2)})`}
              style={{ "--series-color": methodColors[item.method] } as CSSProperties}
            >
              <div className="ci-track" aria-hidden="true" style={{ bottom: `${low}%`, height: `${high - low}%` }}>
                <b style={{ bottom: `${((mean - low) / (high - low || 1)) * 100}%` }} />
              </div>
              <span className="mos-value" style={{ "--mean": `${mean}%` } as CSSProperties}>{item.mean.toFixed(2)}</span>
              <span className="mos-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MOSResults() {
  return (
    <figure className="mos-results">
      <div className="mos-grid">
        <article><h3>MOS-Quality</h3><MosChart data={mosQuality} label="MOS Quality" /></article>
        <article><h3>MOS-Preservation</h3><MosChart data={mosPreservation} label="MOS Preservation" /></article>
      </div>
      <figcaption className="method-note"><strong>Validated sensitivity analysis:</strong> 22 of 38 listeners were retained after requiring a mean ground-truth quality score of at least 4 and a mean historical-input quality score below 2. Points show means and vertical intervals show participant-level 95% confidence intervals.</figcaption>
    </figure>
  );
}
