# End-to-End Historical Music Restoration in Latent Space

Official implementation and evaluation resources for **End-to-End Historical Music Restoration in Latent Space**.

This repository studies historical music restoration as conditional flow matching in the continuous latent space of the frozen [SAME-L](https://huggingface.co/stabilityai/SAME-L) audio autoencoder. The proposed 40M-parameter model, **SAMECFM**, maps degraded historical-audio latents toward clean musical-audio latents and decodes the restored representation at 44.1 kHz.

> **Release status:** implementation, paper PDF, interactive demo, aggregate subjective results, and the published dataset are included. Model checkpoints and the arXiv identifier are forthcoming.

**[Interactive demo](https://full-mix-historical-music-restorati.vercel.app)** · **[Paper PDF](paper/full_mix_historical_music_restoration.pdf)** · **[Published dataset](https://doi.org/10.5281/zenodo.22737610)**

## Method

```text
historical audio -> frozen SAME-L encoder -> degraded latent
                                                |
                                      conditional flow matching
                                      1-D DiT velocity network
                                                |
clean estimate  <- frozen SAME-L decoder <- restored latent
```

The principal training configuration uses:

- full musical mixtures plus instrumental sections;
- a leak-free song-level train/validation split;
- five-second, 44.1-kHz training windows;
- whole-song loudness normalization before windowing;
- a five-stage historical-recording degradation model;
- a 40M-parameter conditional flow-matching DiT in SAME-L space.

### Synthetic historical degradation

Every clean training window passes through the same ordered five-stage chain;
there is no probability gating. Gaussian draws are clipped to the stated
ranges. The complete machine-readable configuration is
[`config/samecfm40_fms.yaml`](config/samecfm40_fms.yaml).

| Stage | Operation | Sampling parameters |
|---|---|---|
| 1 | Zero-phase EQ 1 | Nodes: 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 20480 Hz; mean gains: −9.0, −4.9, −4.9, 0.0, 0.0, −3.1, −1.1, −8.6, −2.1, 0.0 dB; independent standard deviation 14.7 dB; clipped to [−80, 0] dB |
| 2 | Scaled-tanh nonlinearity | Drive `a ~ N(2.2, 0.9)`, clipped to [0.75, 4.5]; wet mix `w ~ N(0.18, 0.09)`, clipped to [0.03, 0.40]; `y=(1−w)x+w tanh(ax)/a` |
| 3 | Zero-phase EQ 2 | Same nodes, standard deviation, and clipping as EQ 1; mean gains: −3.0, −4.9, −4.9, 0.0, 0.0, −3.1, −1.1, −8.6, −2.1, 0.0 dB |
| 4 | Smooth band-pass | Low cutoff `N(100,50)` Hz clipped to [40,250]; high cutoff `N(3200,850)` Hz clipped to [2000,5500]; low slope `N(18,8)` dB/oct clipped to [6,48]; high slope `N(30,10)` dB/oct clipped to [12,60] |
| 5 | Real gramophone surface noise | Random segment from the Gramophone Record Noise Dataset; SNR `N(11,4.5)` dB clipped to [2,20] dB |

The two EQ curves are independently sampled and use log-frequency
interpolation. They form a Wiener–Hammerstein sequence around the static
nonlinearity. Filtering is zero phase to retain temporal alignment between
each degraded input and its clean target. White-noise augmentation is not used.

## Repository layout

```text
.
├── assets/          # Paper-ready qualitative waveform/spectrogram examples
├── checkpoints/     # Checkpoint download instructions (forthcoming)
├── config/          # Public SAMECFM-40M configuration
├── demo/            # Static Next.js paper site and synchronized audio examples
├── examples/        # Command-line example instructions
├── paper/           # Paper PDF
├── restor/          # Model, corruption, training, and inference implementation
├── results/         # Aggregate, anonymous evaluation results
├── main.py          # Training and inference entry point
└── pyproject.toml
```

No private listening-test responses, credentials, training data, inference corpora, or model checkpoints are stored in this repository.

## Interactive demo

The static site under [`demo/`](demo/) contains six synchronized historical comparisons, the method diagram, and aggregate subjective results. Run it locally with Node.js 22:

```bash
cd demo
npm ci
npm run dev
```

For Vercel, import this repository and set the project **Root Directory** to `demo`. No server, environment variables, or runtime inference are required.

## Installation

Python 3.11 and a CUDA-capable PyTorch environment are recommended.

```bash
git clone https://github.com/stevencho-sony/full_mix_historical_music_restoration.git
cd full_mix_historical_music_restoration
pip install -e .
```

SAME-L is distributed under the Stability AI Community License. Review and accept its terms before use.

## Inference

After downloading a released checkpoint:

```bash
python main.py infer \
  --checkpoint checkpoints/samecfm_40m_fms.pt \
  --input examples/historical_input.wav \
  --output output/restored.wav \
  --device cuda
```

Arbitrary-length input is processed using overlap-add. Audio is converted to the model sample rate and mono before SAME-L encoding.

## Training

The paper configuration is provided in [`config/samecfm40_fms.yaml`](config/samecfm40_fms.yaml). Replace the documented dataset paths with local paths, then run:

```bash
torchrun --standalone --nproc_per_node=4 main.py train \
  --name samecfm40_fms \
  --config config/samecfm40_fms.yaml
```

## Evaluation

The paper evaluates restoration on:

- an unpaired historical Internet Archive test set split into Orchestra and Light Orchestra;
- a synthetic paired test set with aligned clean references;
- objective perceptual, spectral, embedding-distribution, embedding-similarity, and fidelity metrics;
- MOS-Quality and reference-based MOS-Preservation listening tests.

Aggregate subjective results are provided under [`results/`](results/). The sensitivity-analysis folder retains listeners whose mean score over four clean ground-truth quality items is at least 4. Individual listener data are intentionally excluded.

## Dataset

The published historical unpaired test set contains 149 full-length recordings: 70 Orchestra and 79 Light Orchestra items. It is available from Zenodo at DOI [`10.5281/zenodo.22737610`](https://doi.org/10.5281/zenodo.22737610).

## Checkpoints and examples

The small public listening examples are bundled in the demo. Model checkpoints will be hosted outside Git and added with SHA-256 checksums.

## Limitations

- The system is designed for instrumental historical classical recordings represented by the paper's training degradations.
- Restoration quality may decline for degradations or musical domains outside the training distribution.
- SAME-L licensing is separate from this repository's MIT-licensed code.
- Generative restoration can alter fine musical details; restored audio should not be treated as an archival ground-truth reconstruction.

## Citation

If you use this work, please cite the paper and the accompanying dataset. Final bibliographic metadata will replace the placeholder below when the arXiv record is available.

```bibtex
@article{cho2026endtoend,
  title   = {End-to-End Historical Music Restoration in Latent Space},
  author  = {Cho, Steven and Koo, Junghyun and Lafargue, Raphael and Dhyani, Tushar and Moliner, Eloi and Mitsufuji, Yuki},
  year    = {2026},
  note    = {arXiv preprint; identifier forthcoming}
}
```

## License

The original code in this repository is released under the [MIT License](LICENSE). Third-party models, datasets, and evaluation packages retain their own licenses.

## Contact

Steven Cho — [ORCID 0009-0008-0040-9312](https://orcid.org/0009-0008-0040-9312)
