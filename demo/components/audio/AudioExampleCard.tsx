import { ExternalLink } from "lucide-react";
import type { AudioExample } from "@/types/audio";
import { ComparisonPlayer } from "./ComparisonPlayer";

export function AudioExampleCard({ example }: { example: AudioExample }) {
  return (
    <article className="audio-card">
      <header className="audio-card-header">
        <div>
          <p className="eyebrow">{example.category}</p>
          <h3>{example.title}</h3>
          <p className="recording-credit">{example.artist} · {example.artistYears} · {example.recordLabel}</p>
        </div>
        <div className="audio-meta">
          {example.year && <span>{example.year}</span>}
          <span>{example.detail}</span>
          {example.sourceUrl && (
            <a href={example.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Source record for ${example.title}`}>
              Source <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </header>
      <ComparisonPlayer playerId={example.id} conditions={example.conditions} />
    </article>
  );
}
