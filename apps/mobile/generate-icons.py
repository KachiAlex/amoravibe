#!/usr/bin/env python3
"""
Generate mobile app icons from source image using PIL/Pillow
Creates PNG icons in the required sizes for Android and favicon
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("❌ Pillow not installed. Installing...")
    os.system("pip install Pillow pillow-heif")
    from PIL import Image, ImageOps

# Paths
base_dir = Path(__file__).parent
source_image_path = base_dir.parent / "web" / "public" / "amoravibe.jpg"
assets_dir = base_dir / "assets"

# Ensure assets directory exists
assets_dir.mkdir(parents=True, exist_ok=True)

icons = [
    {
        "name": "icon.png",
        "size": (1024, 1024),
        "description": "Main app icon (1024x1024)"
    },
    {
        "name": "adaptive-icon.png",
        "size": (1080, 1080),
        "description": "Android adaptive icon foreground (1080x1080)"
    },
    {
        "name": "splash-icon.png",
        "size": (1024, 1024),
        "description": "Splash screen icon (1024x1024)"
    },
    {
        "name": "favicon.png",
        "size": (192, 192),
        "description": "Web favicon (192x192)"
    }
]

def generate_icons():
    """Generate all required icons from source image"""
    print(f"🎨 Generating mobile app icons from {source_image_path.name}...\n")
    
    if not source_image_path.exists():
        print(f"❌ Source image not found: {source_image_path}")
        sys.exit(1)
    
    try:
        # Open source image
        img = Image.open(source_image_path)
        print(f"📦 Source image loaded: {img.size}\n")
        
        for icon in icons:
            output_path = assets_dir / icon["name"]
            size = icon["size"]
            
            print(f"Generating {icon['description']}...")
            
            # Create new image with white background
            bg = Image.new('RGBA', size, (255, 255, 255, 255))
            
            # Copy and resize image
            img_copy = img.copy()
            img_copy.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Center the image on white background
            offset = (
                (size[0] - img_copy.width) // 2,
                (size[1] - img_copy.height) // 2
            )
            
            # Convert JPEG to RGBA if needed
            if img_copy.mode != 'RGBA':
                img_copy = img_copy.convert('RGBA')
            
            bg.paste(img_copy, offset, img_copy)
            
            # Convert to RGB for PNG (no alpha needed for icons)
            rgb_img = Image.new('RGB', size, (255, 255, 255))
            rgb_img.paste(bg, (0, 0), bg)
            
            # Save icon
            rgb_img.save(output_path, 'PNG', quality=95)
            print(f"✅ Created: {icon['name']}\n")
        
        print("🎉 All icons generated successfully!")
        print(f"\n📁 Icons created in: {assets_dir}")
        print("✨ Ready to build APK!")
        
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_icons()
