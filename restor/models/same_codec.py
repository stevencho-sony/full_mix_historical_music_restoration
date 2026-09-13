import torch
import torch.nn as nn


class SAMECodec(nn.Module):
    """Frozen Stability AI SAME-L (Semantically-Aligned Music Encoder) autoencoder.

    SAME-L is a transformer-based continuous audio autoencoder introduced in:
      "SAME: A Semantically-Aligned Music Autoencoder" (Parker et al., 2026)
      https://arxiv.org/abs/2605.18613

    Architecture
    ------------
    Unlike the Oobleck-based codecs, SAME uses a transformer encoder/decoder
    with 4096x temporal compression:
      - ``latent_dim``  : 256
      - ``hop_length``  : 4096 samples
      - ``latent_rate`` : 44100 / 4096 ≈ 10.8 Hz  (~93 ms per latent frame)
      - Stereo native (2 channels), 44.1 kHz
      - Continuous latent space — no VQ / quantization at inference
      - 0.9 B parameters, 3.4 GB safetensors checkpoint

    Implementation note
    -------------------
    ``stable-audio-3``'s ``AutoencoderModel`` is a plain Python wrapper class,
    NOT an ``nn.Module``.  This class registers the inner ``AudioAutoencoder``
    (which IS an ``nn.Module``) as ``self._autoencoder`` so that
    ``SAMECodec.to(device)`` propagates correctly.

    Stereo → mono wrapper
    ---------------------
    SAME is stereo-native.  This wrapper accepts and returns **mono** ``(B, 1, T)``
    tensors: mono input is duplicated to stereo before encoding, and the two
    decoded channels are averaged back to mono after decoding.

    License
    -------
    SAME-L is released under the Stability AI Community License.
    No HuggingFace token is required — just accept the licence at
    https://huggingface.co/stabilityai/SAME-L before first use.

    Requires::

        pip install "stable-audio-3 @ git+https://github.com/Stability-AI/stable-audio-3"
    """

    _SAMPLE_RATE: int = 44_100
    _SA3_MODEL_ID: str = "same-l"  # stable-audio-3 shorthand for stabilityai/SAME-L

    def __init__(self):
        super().__init__()

        try:
            from stable_audio_3 import AutoencoderModel
        except ImportError:
            raise ImportError(
                "The 'stable-audio-3' package is required for SAMECodec.\n"
                "  pip install "
                "'stable-audio-3 @ git+https://github.com/Stability-AI/stable-audio-3'"
            )

        print(f"[SAMECodec] Loading {self._SA3_MODEL_ID} from stabilityai/SAME-L ...")
        # from_pretrained already calls .eval().requires_grad_(False) on the
        # inner AudioAutoencoder.  It also auto-detects CUDA if available.
        ae_wrapper = AutoencoderModel.from_pretrained(self._SA3_MODEL_ID)
        self._ae = ae_wrapper

        # ae_wrapper is NOT an nn.Module — it is a plain Python wrapper.
        # Register the inner AudioAutoencoder as a proper submodule so that
        # SAMECodec.to(device) / .half() propagate through it correctly.
        self._autoencoder = self._ae.autoencoder  # AudioAutoencoder(nn.Module)

        with torch.no_grad():
            probe = torch.zeros(2, self._SAMPLE_RATE)  # (C=2, T) stereo, 1 s
            z = self._ae.encode(probe, sr=self.sample_rate)

        self._latent_dim: int = z.shape[1]
        self._hop_length: int = getattr(
            self._autoencoder,
            "downsampling_ratio",
            self._SAMPLE_RATE // z.shape[2],
        )

        print(
            f"[SAMECodec] Ready.  "
            f"latent_dim={self._latent_dim}, "
            f"hop_length={self._hop_length}, "
            f"latent_rate={self._SAMPLE_RATE / self._hop_length:.1f} Hz"
        )

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def sample_rate(self) -> int:
        return self._SAMPLE_RATE

    @property
    def latent_dim(self) -> int:
        return self._latent_dim

    @property
    def hop_length(self) -> int:
        return self._hop_length

    # ── Codec interface ───────────────────────────────────────────────────────

    def preprocess(self, audio: torch.Tensor) -> torch.Tensor:
        """Return audio unchanged; SA3 encode handles padding/channel conversion."""
        return audio

    def encode(self, audio: torch.Tensor) -> torch.Tensor:
        """``(B, 1, T)`` → ``(B, latent_dim, T_lat)`` via SA3 preprocessing."""
        device = next(self._autoencoder.parameters()).device
        dtype = next(self._autoencoder.parameters()).dtype
        self._ae.device = device
        audio = audio.to(device=device, dtype=dtype, non_blocking=True)

        with torch.no_grad():
            z = self._ae.encode(audio, sr=self.sample_rate)

        return z

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        """``(B, latent_dim, T_lat)`` → ``(B, 1, T)``"""
        device = next(self._autoencoder.parameters()).device
        dtype = next(self._autoencoder.parameters()).dtype
        self._ae.device = device
        z = z.to(device=device, dtype=dtype)

        with torch.no_grad():
            stereo = self._ae.decode(z)  # (B, 2, T)

        # Average stereo → mono.
        return stereo.mean(dim=1, keepdim=True)

    def decode_for_loss(self, z: torch.Tensor) -> torch.Tensor:
        """Decode while preserving gradients with respect to input latents.

        SAME's public wrapper uses ``torch.inference_mode`` and its patched
        waveform pretransform is normally marked non-differentiable. Spectral
        DiT objectives need gradients through the frozen decoder, so this path
        calls the registered autoencoder directly and temporarily enables the
        differentiable patch-unfold operation.

        Decoder/bottleneck noise is disabled here so the spectral target is not
        perturbed by fresh random noise on every optimizer step. All codec
        parameters remain frozen; autograd stores only what is needed to
        compute gradients with respect to ``z``.
        """
        device = next(self._autoencoder.parameters()).device
        dtype = next(self._autoencoder.parameters()).dtype
        self._ae.device = device
        z = z.to(device=device, dtype=dtype, non_blocking=True)

        pretransform = getattr(self._autoencoder, "pretransform", None)
        old_pretransform_grad = (
            getattr(pretransform, "enable_grad", None)
            if pretransform is not None
            else None
        )
        bottleneck = getattr(self._autoencoder, "bottleneck", None)
        old_noise_regularize = (
            getattr(bottleneck, "noise_regularize", None)
            if bottleneck is not None
            else None
        )
        noise_modules = [
            module
            for module in self._autoencoder.decoder.modules()
            if hasattr(module, "mask_noise")
        ]
        old_mask_noise = [module.mask_noise for module in noise_modules]

        try:
            if old_pretransform_grad is not None:
                pretransform.enable_grad = True
            if old_noise_regularize is not None:
                bottleneck.noise_regularize = False
            for module in noise_modules:
                module.mask_noise = 0.0
            stereo = self._autoencoder.decode_audio(z, chunked=False)
        finally:
            if old_pretransform_grad is not None:
                pretransform.enable_grad = old_pretransform_grad
            if old_noise_regularize is not None:
                bottleneck.noise_regularize = old_noise_regularize
            for module, mask_noise in zip(noise_modules, old_mask_noise):
                module.mask_noise = mask_noise

        return stereo.mean(dim=1, keepdim=True)
