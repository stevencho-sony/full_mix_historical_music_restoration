export type AudioCategory = "Orchestra" | "Light Orchestra";

export interface AudioCondition {
  id: string;
  label: string;
  shortLabel: string;
  src: string;
  isOurs?: boolean;
}

export interface AudioExample {
  id: string;
  title: string;
  year?: number;
  category: AudioCategory;
  detail: string;
  artist: string;
  artistYears: string;
  recordLabel: string;
  sourceUrl?: string;
  conditions: AudioCondition[];
}
