#!/usr/bin/env python3
# generate_icons.py — creates Plantify app icons without any dependencies beyond stdlib
import struct, zlib, math

def make_png(width, height, pixels):
    """pixels: list of (r,g,b,a) tuples, row by row"""
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            r,g,b,a = pixels[y*width+x]
            raw += bytes([r,g,b,a])

    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # RGB (not RGBA) - let's do RGBA
    ihdr = struct.pack('>II', width, height) + bytes([8, 6, 0, 0, 0])  # RGBA

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

def draw_icon(size):
    pixels = []
    cx, cy = size / 2, size / 2
    r = size / 2

    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)

            # Background circle
            if dist > r:
                pixels.append((0,0,0,0))
                continue

            # Dark green background gradient
            t = dist / r
            bg_r = int(10 + t * 15)
            bg_g = int(26 + t * 10)
            bg_b = int(11 + t * 8)

            # Draw a simple leaf/plant shape
            # Stem: vertical line in center-bottom
            stem_x = cx
            stem_width = size * 0.04
            stem_top = cy + size * 0.05
            stem_bottom = cy + size * 0.32

            in_stem = (abs(x - stem_x) < stem_width and stem_top < y < stem_bottom)

            # Left leaf
            leaf_cx1, leaf_cy1 = cx - size * 0.13, cy - size * 0.05
            leaf_rx1, leaf_ry1 = size * 0.22, size * 0.14
            in_leaf1 = ((x - leaf_cx1)**2 / leaf_rx1**2 + (y - leaf_cy1)**2 / leaf_ry1**2) < 1

            # Right leaf
            leaf_cx2, leaf_cy2 = cx + size * 0.13, cy - size * 0.18
            leaf_rx2, leaf_ry2 = size * 0.22, size * 0.14
            in_leaf2 = ((x - leaf_cx2)**2 / leaf_rx2**2 + (y - leaf_cy2)**2 / leaf_ry2**2) < 1

            # Top small leaf
            leaf_cx3, leaf_cy3 = cx, cy - size * 0.28
            leaf_rx3, leaf_ry3 = size * 0.13, size * 0.1
            in_leaf3 = ((x - leaf_cx3)**2 / leaf_rx3**2 + (y - leaf_cy3)**2 / leaf_ry3**2) < 1

            if in_stem or in_leaf1 or in_leaf2 or in_leaf3:
                # Green plant
                intensity = 0.7 + 0.3 * (1 - dist/r)
                pr = int(76 * intensity)
                pg = int(175 * intensity)
                pb = int(80 * intensity)
                pixels.append((pr, pg, pb, 255))
            else:
                pixels.append((bg_r, bg_g, bg_b, 255))

    return pixels

import os
os.makedirs('icons', exist_ok=True)

for size in [192, 512]:
    pixels = draw_icon(size)
    png_data = make_png(size, size, pixels)
    with open(f'icons/icon-{size}.png', 'wb') as f:
        f.write(png_data)
    print(f'Generated icon-{size}.png')

print('Icons generated successfully!')
