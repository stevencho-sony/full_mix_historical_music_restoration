import type { MosResult } from "@/types/results";

export const mosQuality: MosResult[] = [
  { method: "INPUT", label: "Input", mean: 1.406, ciLow: 0.943, ciHigh: 1.870 },
  { method: "BABE2_PRETRAINED", label: "BABE2-P", mean: 3.609, ciLow: 3.233, ciHigh: 3.986 },
  { method: "BABE2_FMS", label: "BABE2-FMS", mean: 2.859, ciLow: 2.495, ciHigh: 3.223 },
  { method: "CFM40", label: "SAMECFM", mean: 3.969, ciLow: 3.712, ciHigh: 4.226 },
  { method: "CFM40_GRAMOPHONE_ONLY", label: "SAMECFM-G", mean: 3.406, ciLow: 3.107, ciHigh: 3.706 },
  { method: "GROUND_TRUTH", label: "Ground truth", mean: 4.406, ciLow: 4.206, ciHigh: 4.606 },
];

export const mosPreservation: MosResult[] = [
  { method: "BABE2_PRETRAINED", label: "BABE2-P", mean: 3.797, ciLow: 3.300, ciHigh: 4.293 },
  { method: "BABE2_FMS", label: "BABE2-FMS", mean: 3.938, ciLow: 3.652, ciHigh: 4.223 },
  { method: "CFM40", label: "SAMECFM", mean: 4.375, ciLow: 4.096, ciHigh: 4.654 },
  { method: "CFM40_GRAMOPHONE_ONLY", label: "SAMECFM-G", mean: 4.453, ciLow: 4.257, ciHigh: 4.649 },
];
