import Image from "next/image";

export function PipelineDiagram() {
  return (
    <figure className="method-figure">
      <Image
        src="/figures/finalICASSPgood_qual.png"
        width={3000}
        height={1153}
        sizes="(max-width: 1160px) calc(100vw - 2.5rem), 1160px"
        alt="SAMECFM training and inference pipeline: synthetic degradation, frozen SAME encoder and decoder, and latent conditional flow-matching model"
      />
      <figcaption>SAMECFM restoration pipeline. Blue dashed paths are used only during training; black paths are used during training and inference.</figcaption>
    </figure>
  );
}
