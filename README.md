# Full-Mix Historical Music Restoration in Latent Space

Official implementation and evaluation resources for **Full-Mix Historical Music Restoration in Latent Space**.

This repository studies historical music restoration as conditional flow matching in the continuous latent space of the frozen [SAME-L](https://huggingface.co/stabilityai/SAME-L) audio autoencoder. The proposed 40M-parameter model, **SAMECFM**, maps degraded historical-audio latents toward clean musical-audio latents and decodes the restored representation at 44.1 kHz.

> **Release status:** the lean code and results shell is ready. The paper PDF/source, checkpoints, dataset DOI, and arXiv identifier will be added before the public release.

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

## Repository layout

```text
.
├── assets/          # Paper-ready qualitative waveform/spectrogram examples
├── checkpoints/     # Checkpoint download instructions (forthcoming)
├── config/          # Public SAMECFM-40M configuration
├── examples/        # Example-audio instructions (forthcoming)
├── paper/           # Paper PDF and source (awaiting local files)
├── restor/          # Model, corruption, training, and inference implementation
├── results/         # Aggregate, anonymous evaluation results
├── main.py          # Training and inference entry point
└── pyproject.toml
```

No private listening-test responses, credentials, training data, inference corpora, or model checkpoints are stored in this repository.

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

The public release will include the preprocessing entry point and exact dataset manifests after the supplied paper-source archive is available in this workspace.

## Evaluation

The paper evaluates restoration on:

- an unpaired historical Internet Archive test set split into Orchestra and Light Orchestra;
- a synthetic paired test set with aligned clean references;
- objective perceptual, spectral, embedding-distribution, embedding-similarity, and fidelity metrics;
- MOS-Quality and reference-based MOS-Preservation listening tests.

Aggregate subjective results are provided under [`results/`](results/). The sensitivity-analysis folder retains listeners whose mean score over four clean ground-truth quality items is at least 4. Individual listener data are intentionally excluded.

## Dataset

The 149-recording historical unpaired test set—70 Orchestra and 79 Light Orchestra full-length recordings—is being prepared as a separate Zenodo artifact. Its DOI will be linked here when reserved.

## Checkpoints and examples

Checkpoint and public audio-example URLs are forthcoming. Large binary artifacts will be hosted outside Git rather than committed to repository history.

## Limitations

- The system is designed for instrumental historical classical recordings represented by the paper's training degradations.
- Restoration quality may decline for degradations or musical domains outside the training distribution.
- SAME-L licensing is separate from this repository's MIT-licensed code.
- Generative restoration can alter fine musical details; restored audio should not be treated as an archival ground-truth reconstruction.

## Citation

If you use this work, please cite the paper and the accompanying dataset. Final bibliographic metadata will replace the placeholder below when the arXiv record is available.

```bibtex
@article{cho2026fullmix,
  title   = {Full-Mix Historical Music Restoration in Latent Space},
  author  = {Cho, Steven},
  year    = {2026},
  note    = {arXiv preprint; identifier forthcoming}
}
```

## License

The original code in this repository is released under the [MIT License](LICENSE). Third-party models, datasets, and evaluation packages retain their own licenses.

## Contact

Steven Cho — [ORCID 0009-0008-0040-9312](https://orcid.org/0009-0008-0040-9312)
