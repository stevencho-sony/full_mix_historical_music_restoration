export function DegradationDiagram() {
  const conventional = ["Denoising", "Bandwidth extension"];
  const historical = ["Bandwidth loss", "Spectral coloration", "Nonlinear distortion", "Noise", "Unknown recording chain"];
  return (
    <div className="positioning-grid">
      <article className="comparison-panel muted-panel">
        <p className="eyebrow">Typical existing approaches</p>
        <div className="degradation-list">{conventional.map((item) => <span key={item}>{item}</span>)}</div>
      </article>
      <article className="comparison-panel accent-panel">
        <p className="eyebrow">Our historical restoration setting</p>
        <div className="degradation-list">{historical.map((item) => <span key={item}>{item}</span>)}</div>
      </article>
    </div>
  );
}
