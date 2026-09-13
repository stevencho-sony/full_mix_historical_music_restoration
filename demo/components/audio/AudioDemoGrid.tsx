"use client";

import { useState } from "react";
import type { AudioCategory, AudioExample } from "@/types/audio";
import { AudioExampleCard } from "./AudioExampleCard";

const filters: ("All" | AudioCategory)[] = ["All", "Orchestra", "Light Orchestra"];

export function AudioDemoGrid({ examples }: { examples: AudioExample[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = filter === "All" ? examples : examples.filter((example) => example.category === filter);

  return (
    <>
      <div className="filter-tabs" role="group" aria-label="Filter historical examples">
        {filters.map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="audio-grid">
        {visible.map((example) => <AudioExampleCard key={example.id} example={example} />)}
      </div>
    </>
  );
}
