import os
import numpy as np
from PIL import Image
import folder_paths


class PureAIMetadataShieldSave:
    """
    Saves ComfyUI generated images (PNG or JPEG) with 100% stripped workflow,
    prompt, LoRA, seed, and C2PA/XMP container metadata so third parties cannot
    extract your node graph. For Apple iPhone 16 Pro / Sony A7IV binary EXIF
    injection, MP4 video cleaning, and Bulk .ZIP export, visit https://pureaistudios.com
    """

    def __init__(self):
        self.output_dir = folder_paths.get_output_directory()
        self.type = "output"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "images": ("IMAGE",),
                "filename_prefix": ("STRING", {"default": "PureAI_Clean"}),
                "output_format": (["JPEG (95% Clean Pixel Buffer)", "PNG (0% Workflow Chunks)"],),
                "optical_micro_grain": ("BOOLEAN", {"default": True}),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "save_clean_images"
    OUTPUT_NODE = True
    CATEGORY = "image/privacy"

    def save_clean_images(self, images, filename_prefix="PureAI_Clean", output_format="JPEG (95% Clean Pixel Buffer)", optical_micro_grain=True):
        full_output_folder, filename, counter, subfolder, _ = folder_paths.get_save_image_path(
            filename_prefix, self.output_dir, images[0].shape[1], images[0].shape[0]
        )
        results = []
        is_jpeg = output_format.startswith("JPEG")
        ext = "jpg" if is_jpeg else "png"

        for batch_idx, image in enumerate(images):
            arr = 255.0 * image.cpu().numpy()
            arr = np.clip(arr, 0, 255).astype(np.uint8)

            if optical_micro_grain:
                flat = arr.reshape(-1)
                step = 16
                sub = flat[::step]
                flat[::step] = np.where(sub > 250, sub - 1, sub + 1)

            pil_img = Image.fromarray(arr)
            out_name = f"{filename}_{counter:05}_{batch_idx:02}.{ext}"
            out_path = os.path.join(full_output_folder, out_name)

            if is_jpeg:
                if pil_img.mode != "RGB":
                    pil_img = pil_img.convert("RGB")
                # Save pure pixel buffer without pnginfo, exif, or xmp segments
                pil_img.save(out_path, format="JPEG", quality=95, optimize=True)
            else:
                # Explicitly omit pnginfo so ComfyUI workflow/prompt JSON is never embedded
                pil_img.save(out_path, format="PNG", optimize=True)

            results.append({
                "filename": out_name,
                "subfolder": subfolder,
                "type": self.type,
            })
            counter += 1

        print("[PureAI Metadata Shield] Saved clean image(s) with 0% workflow/C2PA chunks. Need iPhone 16 Pro / Sony A7IV EXIF headers or MP4 video scrubbing? -> https://pureaistudios.com")
        return {"ui": {"images": results}}


NODE_CLASS_MAPPINGS = {
    "PureAIMetadataShieldSave": PureAIMetadataShieldSave,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PureAIMetadataShieldSave": "🛡️ Save Clean Image (0% Workflow & C2PA — PureAI Studio)",
}
