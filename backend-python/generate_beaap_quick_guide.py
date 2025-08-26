#!/usr/bin/env python3
"""
Generate a 1-page BEAAP (Canine Behavioral Pain Assessment) quick guide PNG.
Includes categories, scoring ranges, total score mapping, and recommendations.
"""

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from pathlib import Path
import textwrap

# Data definitions
CATEGORIES = [
    ("Breathing", "0–4"),
    ("Eyes", "0–4"),
    ("Ambulation", "0–5"),
    ("Activity", "0–5"),
    ("Appetite", "0–4"),
    ("Attitude", "0–5"),
    ("Posture", "0–5"),
    ("Palpation", "0–4"),
]

PAIN_LEVELS = [
    ("No Pain", "0–8", "Monitor routinely; no immediate intervention."),
    ("Mild Pain", "9–16", "Provide rest and observe behavior. Consider mild analgesics only if advised by a veterinarian."),
    ("Moderate Pain", "17–24", "Limit activity and consult a veterinarian for pain management and further evaluation."),
    ("Moderate to Severe", "25–32", "Seek veterinary evaluation promptly; medical pain control is likely required."),
    ("Severe Pain", "33–40", "Urgent veterinary attention recommended."),
]

FOOTNOTES = [
    "Pick one option per category; sum all scores (0–40).",
    "Use consistent context (resting vs post-activity) when comparing assessments.",
    "When unsure, choose the more conservative (higher pain) option and reassess.",
]


def draw_box(ax, x, y, w, h, text, facecolor="#F7F9FC", edgecolor="#2E86AB", fontsize=11, bold=False, ha_center=True):
    box = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.02",
        linewidth=1.2, edgecolor=edgecolor, facecolor=facecolor
    )
    ax.add_patch(box)
    ha = "center" if ha_center else "left"
    x_text = x + (w/2 if ha_center else 0.02)
    ax.text(
        x_text, y + h/2, text,
        ha=ha, va="center", fontsize=fontsize,
        fontweight="bold" if bold else "normal", color="#1B1F23"
    )


def wrap_text(text: str, width: int) -> str:
    return "\n".join(textwrap.wrap(text, width=width))


def main():
    # Larger canvas to reduce crowding
    fig = plt.figure(figsize=(13.5, 10.0), dpi=220)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # Title
    ax.text(0.5, 0.965, "Canine Pain Assessment (BEAAP) - Quick Guide", ha="center", va="top",
            fontsize=22, fontweight="bold", color="#0B3D91")
    ax.text(0.5, 0.935, "Behavioral Evaluation and Aggregated Assessment Protocol", ha="center", va="top",
            fontsize=12.5, color="#334155")

    # Left column: Categories grid
    ax.text(0.07, 0.89, "Categories (select one per category)", ha="left", va="top",
            fontsize=15, fontweight="bold", color="#1F2937")

    # Grid layout 4x2
    grid_x0, grid_y0 = 0.05, 0.855
    cell_w, cell_h = 0.44, 0.1
    x_gap, y_gap = 0.02, 0.02

    for idx, (name, rng) in enumerate(CATEGORIES):
        row = idx // 2
        col = idx % 2
        x = grid_x0 + col * (cell_w + x_gap)
        y_top = grid_y0 - row * (cell_h + y_gap)
        text = f"{name}\nScore range: {rng}"
        draw_box(ax, x, y_top - cell_h, cell_w, cell_h, text, bold=True, fontsize=12.5)

    # Right column: Score mapping table
    ax.text(0.60, 0.89, "Total Score → Pain Level", ha="left", va="top",
            fontsize=15, fontweight="bold", color="#1F2937")

    table_x, table_y = 0.56, 0.845
    row_h = 0.09
    # Wider recommendation column to avoid wraps/overlap
    col_w = [0.18, 0.12, 0.40]

    # Header
    draw_box(ax, table_x, table_y - row_h, sum(col_w), row_h,
             "Pain Level     |   Score Range   |   Recommendation", facecolor="#E8F1FB", bold=True, fontsize=12.5)

    # Rows
    y_cursor = table_y - row_h
    colors = ["#F7F9FC", "#FFFFFF"]
    for i, (level, rng, rec) in enumerate(PAIN_LEVELS):
        y_cursor -= row_h
        # Level
        draw_box(ax, table_x, y_cursor, col_w[0], row_h, level, facecolor=colors[i % 2], fontsize=11.5)
        # Range
        draw_box(ax, table_x + col_w[0], y_cursor, col_w[1], row_h, rng, facecolor=colors[i % 2], fontsize=11.5)
        # Recommendation (left aligned with manual wrapping)
        wrapped = wrap_text(rec, width=48)
        draw_box(ax, table_x + col_w[0] + col_w[1], y_cursor, col_w[2], row_h, wrapped,
                 facecolor=colors[i % 2], fontsize=9.5, ha_center=False)

    # Footer notes
    ax.text(0.5, 0.14, "Assessment Notes", ha="center", va="center",
            fontsize=13.5, fontweight="bold", color="#1F2937")

    notes_text = "\n".join([f"• {t}" for t in FOOTNOTES])
    wrapped_notes = wrap_text(notes_text, width=120)
    draw_box(ax, 0.08, 0.035, 0.84, 0.18, wrapped_notes, facecolor="#FFF8E1", edgecolor="#F59E0B", fontsize=10.5, ha_center=False)

    # Save
    out_path = Path(__file__).parent / "beaap_quick_guide.png"
    fig.savefig(out_path, dpi=300, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"BEAAP quick guide saved to: {out_path}")


if __name__ == "__main__":
    main()
