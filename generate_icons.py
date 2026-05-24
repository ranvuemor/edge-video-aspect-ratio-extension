import math
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "icons"
SIZES = (16, 48, 128)
SS = 4


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def blend(dst, src, alpha):
    inv = 1.0 - alpha
    return (
        dst[0] * inv + src[0] * alpha,
        dst[1] * inv + src[1] * alpha,
        dst[2] * inv + src[2] * alpha,
        255,
    )


def in_round_rect(px, py, x, y, w, h, r):
    if px < x or px > x + w or py < y or py > y + h:
        return False
    cx = min(max(px, x + r), x + w - r)
    cy = min(max(py, y + r), y + h - r)
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


def rect_gradient(px, py, x, y, w, h, c1, c2):
    t = ((px - x) / w + (py - y) / h) / 2.0
    return mix(c1, c2, min(1.0, max(0.0, t)))


def dist_segment(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    length_sq = vx * vx + vy * vy
    if length_sq == 0:
        return math.hypot(px - ax, py - ay)
    t = min(1.0, max(0.0, (wx * vx + wy * vy) / length_sq))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def on_polyline(px, py, points, width):
    radius = width / 2.0
    return any(
        dist_segment(px, py, *points[i], *points[i + 1]) <= radius
        for i in range(len(points) - 1)
    )


def stroke_round_rect(px, py, x, y, w, h, r, width):
    d = width / 2.0
    outer = in_round_rect(px, py, x - d, y - d, w + width, h + width, r + d)
    inner = in_round_rect(px, py, x + d, y + d, w - width, h - width, max(0, r - d))
    return outer and not inner


def sample(px, py):
    color = (0.0, 0.0, 0.0, 0.0)

    if in_round_rect(px, py, 0, 0, 128, 128, 30):
        color = blend(color, rect_gradient(px, py, 0, 0, 128, 128, (19, 64, 96), (16, 92, 124)), 1)

    if in_round_rect(px, py, 16, 18, 96, 92, 24):
        color = blend(color, rect_gradient(px, py, 16, 18, 96, 92, (31, 78, 122), (62, 140, 175)), 1)
    if stroke_round_rect(px, py, 16, 18, 96, 92, 24, 4):
        color = blend(color, (255, 255, 255), 0.16)

    if stroke_round_rect(px, py, 32, 30, 64, 68, 16, 4):
        color = blend(color, (255, 255, 255), 0.22)

    if on_polyline(px, py, [(40, 48), (88, 48)], 4):
        color = blend(color, (247, 251, 255), 0.85)
    if on_polyline(px, py, [(40, 80), (88, 80)], 4):
        color = blend(color, (247, 251, 255), 0.85)
    if on_polyline(px, py, [(46, 64), (82, 64)], 6):
        color = blend(color, (247, 251, 255), 1)
    if on_polyline(px, py, [(50, 58), (44, 64), (50, 70)], 6):
        color = blend(color, (247, 251, 255), 1)
    if on_polyline(px, py, [(78, 58), (84, 64), (78, 70)], 6):
        color = blend(color, (247, 251, 255), 1)

    if 12 <= math.hypot(px - 64, py - 64) <= 16:
        color = blend(color, (247, 251, 255), 0.45)

    return color


def write_png(path, size, pixels):
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixels[y * size + x])

    def chunk(kind, data):
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)))
    png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
    png.extend(chunk(b"IEND", b""))
    path.write_bytes(png)


def render(size):
    pixels = []
    step = 128 / size
    for y in range(size):
        for x in range(size):
            r = g = b = a = 0.0
            for sy in range(SS):
                for sx in range(SS):
                    px = (x + (sx + 0.5) / SS) * step
                    py = (y + (sy + 0.5) / SS) * step
                    cr, cg, cb, ca = sample(px, py)
                    r += cr
                    g += cg
                    b += cb
                    a += ca
            samples = SS * SS
            pixels.append((round(r / samples), round(g / samples), round(b / samples), round(a / samples)))
    return pixels


def main():
    OUT_DIR.mkdir(exist_ok=True)
    for size in SIZES:
        write_png(OUT_DIR / f"{size}.png", size, render(size))


if __name__ == "__main__":
    main()
