#!/usr/bin/env python3
"""Generate PNG icons from SVG for Bing Tools Chrome Extension"""

import os
import subprocess
import sys

def generate_icons():
    """Generate PNG icons from SVG using available tools"""
    
    # Try resvg first (best SVG rendering quality)
    try:
        import resvg_python
        print("Using resvg-python for SVG to PNG conversion")
        generate_with_resvg()
        return
    except ImportError:
        pass
    
    # Try skia (cross-platform support)
    try:
        import skia
        print("Using skia-python for SVG to PNG conversion")
        generate_with_skia()
        return
    except ImportError:
        pass
    
    # Try Inkscape (best SVG rendering quality)
    inkscape_path = find_inkscape()
    if inkscape_path:
        print(f"Using Inkscape: {inkscape_path}")
        generate_with_inkscape(inkscape_path)
        return
    
    # Try cairosvg as fallback
    try:
        import cairosvg
        print("Using cairosvg for SVG to PNG conversion")
        generate_with_cairosvg()
        return
    except ImportError:
        pass
    
    print("ERROR: No SVG conversion tool available!")
    print("Please install one of the following:")
    print("  - resvg-python (recommended): pip install resvg-python")
    print("  - skia-python: pip install skia-python")
    print("  - Inkscape: https://inkscape.org/release/")
    print("  - cairosvg: pip install cairosvg")
    sys.exit(1)


def generate_with_resvg():
    """Generate icons using resvg-python"""
    import resvg_python
    from PIL import Image
    import io
    
    sizes = [16, 32, 48, 128]
    
    # Read SVG file
    with open('icon.svg', 'r', encoding='utf-8') as f:
        svg_data = f.read()
    
    # Render SVG to PNG at high resolution first
    png_bytes = resvg_python.svg_to_png(svg_data)
    
    # Convert list to bytes if necessary
    if isinstance(png_bytes, list):
        png_bytes = bytes(png_bytes)
    
    # Open as PIL Image
    high_res_img = Image.open(io.BytesIO(png_bytes))
    
    for size in sizes:
        output_file = f'icon{size}.png'
        
        # Resize to target size using high-quality resampling
        resized_img = high_res_img.resize((size, size), Image.Resampling.LANCZOS)
        resized_img.save(output_file, 'PNG')
        
        file_size = os.path.getsize(output_file)
        print(f'Created {output_file} ({size}x{size}) - {file_size} bytes')


def generate_with_skia():
    """Generate icons using skia-python"""
    import skia
    
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        output_file = f'icon{size}.png'
        
        # Create SVG DOM from file
        with open('icon.svg', 'rb') as f:
            svg_data = f.read()
        stream = skia.MemoryStream(svg_data)
        svg_dom = skia.SVGDOM.MakeFromStream(stream)
        
        if not svg_dom:
            raise RuntimeError("Failed to parse SVG file")
        
        # Get SVG container size (fallback to viewBox if container size is 0)
        container_size = svg_dom.containerSize()
        svg_width = container_size.width() or 128
        svg_height = container_size.height() or 128
        
        # Create surface with target size
        surface = skia.Surface(size, size)
        canvas = surface.getCanvas()
        
        # Clear with transparent background
        canvas.clear(skia.ColorTRANSPARENT)
        
        # Calculate scale to fit
        scale = size / max(svg_width, svg_height)
        
        # Scale and center
        canvas.scale(scale, scale)
        
        # Render SVG
        svg_dom.render(canvas)
        
        # Save to PNG
        image = surface.makeImageSnapshot()
        png_data = image.encodeToData(skia.EncodedImageFormat.kPNG, 100)
        
        with open(output_file, 'wb') as f:
            f.write(png_data)
        
        file_size = os.path.getsize(output_file)
        print(f'Created {output_file} ({size}x{size}) - {file_size} bytes')


def find_inkscape():
    """Find Inkscape executable"""
    possible_paths = [
        r"C:\Program Files\Inkscape\bin\inkscape.exe",
        r"C:\Program Files (x86)\Inkscape\bin\inkscape.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    try:
        result = subprocess.run(['where', 'inkscape'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip().split('\n')[0]
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    return None


def generate_with_inkscape(inkscape_path):
    """Generate icons using Inkscape"""
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        output_file = f'icon{size}.png'
        cmd = [
            inkscape_path,
            'icon.svg',
            '--export-filename=' + output_file,
            f'--export-width={size}',
            f'--export-height={size}',
            '--export-type=png'
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            file_size = os.path.getsize(output_file)
            print(f'Created {output_file} ({size}x{size}) - {file_size} bytes')
        except subprocess.CalledProcessError as e:
            print(f'Error creating {output_file}: {e}')
            raise


def generate_with_cairosvg():
    """Generate icons using cairosvg"""
    import cairosvg
    
    sizes = [16, 32, 48, 128]
    for size in sizes:
        output_file = f'icon{size}.png'
        cairosvg.svg2png(
            url='icon.svg',
            write_to=output_file,
            output_width=size,
            output_height=size
        )
        file_size = os.path.getsize(output_file)
        print(f'Created {output_file} ({size}x{size}) - {file_size} bytes')


if __name__ == '__main__':
    generate_icons()
    print('All icons generated successfully!')
