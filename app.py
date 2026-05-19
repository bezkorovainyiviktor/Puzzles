"""
Puzzle Website — Multi-Puzzle Platform
Python 3.10 + Flask
"""

import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


# ── 15-Puzzle helpers ────────────────────────────


def is_solvable(tiles: list[int]) -> bool:
    """Check if a 15-puzzle configuration is solvable."""
    inversions = 0
    flat = [t for t in tiles if t != 0]
    for i in range(len(flat)):
        for j in range(i + 1, len(flat)):
            if flat[i] > flat[j]:
                inversions += 1
    blank_idx = tiles.index(0)
    blank_row_from_bottom = 4 - (blank_idx // 4)
    if blank_row_from_bottom % 2 == 0:
        return inversions % 2 == 1
    else:
        return inversions % 2 == 0


def generate_puzzle() -> list[int]:
    """Generate a valid shuffled 15-puzzle."""
    tiles = list(range(16))
    while True:
        random.shuffle(tiles)
        if is_solvable(tiles):
            return tiles


# ── Routes ───────────────────────────────────────


@app.route("/")
def index():
    return render_template("index.html")


# ── 15-Puzzle API ────────────────────────────────


@app.route("/api/new-game")
def new_game():
    puzzle = generate_puzzle()
    return jsonify({"tiles": puzzle})


@app.route("/api/check-win", methods=["POST"])
def check_win():
    data = request.get_json()
    tiles = data.get("tiles", [])
    solved = list(range(1, 16)) + [0]
    return jsonify({"won": tiles == solved})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
