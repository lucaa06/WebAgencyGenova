import os
import math
from PIL import Image, ImageDraw, ImageFilter

out_dir = './public/video-frames'
os.makedirs(out_dir, exist_ok=True)

width, height = 1920, 1080 # High res 16:9
total_frames = 120

for i in range(total_frames):
    progress = i / float(total_frames)
    
    # Off-white background
    img = Image.new('RGB', (width, height), (244, 244, 245))
    draw = ImageDraw.Draw(img)
    
    # Floating gradient orbs
    # Orb 1: Cobalt
    x1 = width * 0.5 + math.sin(progress * math.pi * 2) * 500
    y1 = height * 0.5 + math.cos(progress * math.pi * 2) * 200
    r1 = 600
    draw.ellipse([(x1-r1, y1-r1), (x1+r1, y1+r1)], fill=(0, 71, 255))
    
    # Orb 2: Coral
    x2 = width * 0.5 + math.cos(progress * math.pi * 2) * 400
    y2 = height * 0.5 + math.sin(progress * math.pi * 2) * 300
    r2 = 500
    draw.ellipse([(x2-r2, y2-r2), (x2+r2, y2+r2)], fill=(255, 107, 107))
    
    # Orb 3: Light Blue overlay
    x3 = width * 0.5 + math.sin(progress * math.pi * 4) * 300
    y3 = height * 0.5 + math.cos(progress * math.pi * 2) * 150
    r3 = 400
    draw.ellipse([(x3-r3, y3-r3), (x3+r3, y3+r3)], fill=(150, 200, 255))
    
    # Fast heavy blur
    img = img.resize((480, 270), Image.Resampling.BILINEAR)
    img = img.filter(ImageFilter.GaussianBlur(30))
    img = img.resize((width, height), Image.Resampling.BICUBIC)
    
    img.save(os.path.join(out_dir, f'frame_{i:04d}.webp'), 'WEBP', quality=85)

print(f"Generated {total_frames} frames successfully.")
