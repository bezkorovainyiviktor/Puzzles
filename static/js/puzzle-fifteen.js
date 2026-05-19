/**
 * 15-Puzzle Module
 * Registers itself with PuzzleRegistry.
 */

(function () {
    'use strict';

    const GRID = 4;
    const TOTAL = GRID * GRID;

    // Module-scoped state
    let container = null;
    let onComplete = null;
    let boardEl = null; // Renamed from 'board'
    let movesEl = null; // Renamed from 'moveCounterEl'
    let grid = []; // New: Represents the 2D grid state
    let emptyRow = 3; // New: Row of the empty tile
    let emptyCol = 3; // New: Column of the empty tile

    let tiles = []; // Still used for 1D representation
    let moves = 0;
    let gameStarted = false;
    let gameWon = false;

    // ── Helpers ──────────────────────────────────

    function tilePos(index) {
        const col = index % GRID;
        const row = Math.floor(index / GRID);
        const sizeNum = 80;
        const gapNum = 6;
        // Responsive: read from CSS if available
        const root = getComputedStyle(document.documentElement);
        const sz = parseFloat(root.getPropertyValue('--tile-size')) || sizeNum;
        const gp = parseFloat(root.getPropertyValue('--gap')) || gapNum;
        return {
            x: col * (sz + gp),
            y: row * (sz + gp)
        };
    }

    // ── Rendering ────────────────────────────────

    function renderBoard() {
        boardEl.innerHTML = '';
        tiles.forEach((val, idx) => {
            const tile = document.createElement('div');
            const pos = tilePos(idx);
            tile.className = 'tile';
            tile.style.setProperty('--pos', `translate(${pos.x}px, ${pos.y}px)`);
            tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

            if (val === 0) {
                tile.classList.add('tile--empty');
            } else {
                tile.classList.add('tile--number');
                tile.innerHTML = T(String(val));
                
                const textLength = tile.textContent.replace(/\s+/g, '').length;
                if (textLength >= 20) {
                    tile.style.fontSize = '14px';
                } else if (textLength > 5) {
                    tile.style.fontSize = '20px';
                } else {
                    tile.style.fontSize = '2rem';
                }

                if (val === idx + 1) {
                    tile.classList.add('tile--correct');
                }
                tile.addEventListener('click', () => handleTileClick(idx));
            }

            tile.dataset.index = idx;
            boardEl.appendChild(tile);
        });
    }

    function updateStats() {
        movesEl.innerHTML = T(String(moves));
    }

    // ── Game Logic ───────────────────────────────

    function getNeighbors(idx) {
        const row = Math.floor(idx / GRID);
        const col = idx % GRID;
        const neighbors = [];
        if (row > 0) neighbors.push(idx - GRID);
        if (row < GRID - 1) neighbors.push(idx + GRID);
        if (col > 0) neighbors.push(idx - 1);
        if (col < GRID - 1) neighbors.push(idx + 1);
        return neighbors;
    }

    function handleTileClick(idx) {
        if (gameWon) return;

        const emptyIdx = tiles.indexOf(0);
        const neighbors = getNeighbors(idx);

        if (!neighbors.includes(emptyIdx)) return;

        if (!gameStarted) {
            gameStarted = true;
        }

        [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
        moves++;

        renderBoard();
        updateStats();
        if (checkWin()) {
            handleWin();
        }
    }

    function checkWin() {
        const solved = [];
        for (let i = 1; i < TOTAL; i++) solved.push(i);
        solved.push(0);

        return tiles.every((v, i) => v === solved[i]);
    }

    function handleWin() {
        gameWon = true;
        if (boardEl) boardEl.classList.add('win-animation');

        setTimeout(() => {
            if (onComplete) {
                onComplete({ moves: moves });
            }
        }, 1200);
    }

    // ── Keyboard ─────────────────────────────────

    function handleKeydown(e) {
        if (gameWon) return;
        const emptyIdx = tiles.indexOf(0);
        const row = Math.floor(emptyIdx / GRID);
        const col = emptyIdx % GRID;
        let target = -1;

        switch (e.key) {
            case 'ArrowUp':
                if (row < GRID - 1) target = emptyIdx + GRID;
                break;
            case 'ArrowDown':
                if (row > 0) target = emptyIdx - GRID;
                break;
            case 'ArrowLeft':
                if (col < GRID - 1) target = emptyIdx + 1;
                break;
            case 'ArrowRight':
                if (col > 0) target = emptyIdx - 1;
                break;
        }

        if (target >= 0 && target < TOTAL) {
            e.preventDefault();
            handleTileClick(target);
        }
    }

    // ── Shuffle (client-side fallback) ───────────

    function clientShuffle() {
        const arr = Array.from({ length: TOTAL }, (_, i) => i);
        do {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        } while (!isSolvable(arr));
        return arr;
    }

    function isSolvable(arr) {
        let inv = 0;
        const flat = arr.filter(v => v !== 0);
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[i] > flat[j]) inv++;
            }
        }
        const blankRow = 4 - Math.floor(arr.indexOf(0) / 4);
        return blankRow % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
    }

    // ── New Game ─────────────────────────────────

    async function startNewGame() {
        gameWon = false;
        gameStarted = false;
        moves = 0;
        updateStats();

        try {
            const res = await fetch('/api/new-game');
            const data = await res.json();
            tiles = data.tiles;
        } catch (e) {
            tiles = clientShuffle();
        }

        renderBoard();
    }

    // ── Module Interface ─────────────────────────

    function init(containerEl, completeCb) {
        container = containerEl;
        onComplete = completeCb;

        // Inject HTML
        container.innerHTML = `
            <header class="header">
                <h1 class="title">${T("П'ятнашки")}</h1>
                <p class="subtitle">${T("Складіть плитки по порядку від 1 до 15. Клікніть на сусідню з порожньою.")}</p>
            </header>

            <div class="stats-bar">
                <div class="stat">
                    <span class="stat__label">${T("Ходи")}</span>
                    <span class="stat__value" id="p15-moves">${T("0")}</span>
                </div>
            </div>

            <div class="board-wrapper">
                <div class="board" id="p15-board"></div>
            </div>
        `;

        // Grab DOM refs
        boardEl = container.querySelector('#p15-board');
        movesEl = container.querySelector('#p15-moves');

        document.addEventListener('keydown', handleKeydown);
        startNewGame();
    }

    function destroy() {
        document.removeEventListener('keydown', handleKeydown);
        if (container) container.innerHTML = '';
        boardEl = null;
        movesEl = null;
        tiles = [];
        moves = 0;
        gameStarted = false;
        gameWon = false;
    }

    // ── Register ─────────────────────────────────
    window.PuzzleRegistry.push({
        name: '15 Puzzle',
        init,
        destroy
    });

})();
