import os
from PIL import Image

def optimize_images(directory):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            filepath = os.path.join(directory, filename)
            try:
                with Image.open(filepath) as img:
                    # Check if image is large
                    if os.path.getsize(filepath) > 500 * 1024: # > 500KB
                        print(f"Optimizing {filename}...")
                        
                        # Resize if dimensions are too large
                        max_size = (1920, 1920)
                        img.thumbnail(max_size, Image.Resampling.LANCZOS)
                        
                        # Save with optimization
                        img.save(filepath, quality=85, optimize=True)
                        print(f"Done: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    target_dir = os.path.join(os.getcwd(), "images", "portfolio")
    if os.path.exists(target_dir):
        optimize_images(target_dir)
    else:
        print(f"Directory not found: {target_dir}")
