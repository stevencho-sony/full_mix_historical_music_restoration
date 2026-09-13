from .denoiser import DIT_MSE_DENOISER_TYPES, build_denoiser


def build_codec(name: str, device):
    """Instantiate a codec by name and move it to *device*.

    Supported names:
        dac_44khz, dac_24khz, dac_16khz
        encodec_24khz, encodec_48khz
        ace_vae
        codicodec
        same_l
    """
    import torch
    _device = torch.device(device) if isinstance(device, str) else device

    if name.startswith("dac_"):
        from .codec import DACCodec
        return DACCodec(name[len("dac_"):]).to(_device)

    if name.startswith("encodec_"):
        from .encodec_codec import EnCodecCodec
        return EnCodecCodec(name[len("encodec_"):]).to(_device)

    if name == "ace_vae":
        from .ace_vae_codec import ACEVAECodec
        return ACEVAECodec().to(_device)

    if name == "codicodec":
        from .codicodec_wrapper import CoDiCodecWrapper
        return CoDiCodecWrapper().to(_device)

    if name == "same_l":
        from .same_codec import SAMECodec
        return SAMECodec().to(_device)

    raise ValueError(
        f"Unknown codec '{name}'. "
        "Available: dac_44khz dac_24khz dac_16khz encodec_24khz encodec_48khz "
        "ace_vae codicodec same_l"
    )
