/**
 * Minesweeper Puzzle Module
 * Classic 9×9 grid with 10 mines.
 * Registers itself with PuzzleRegistry.
 */

(function () {
    'use strict';

    const ROWS = 9;
    const COLS = 9;
    const MINE_COUNT = 10;

    // Module-scoped state
    let container = null;
    let onComplete = null;
    let boardEl = null;
    let mineCounterEl = null;
    let restartBtn = null;
    let grid = [];           // 2D: { mine, revealed, flagged, adjacentMines }
    let firstClick = true;
    let gameOver = false;
    let gameWon = false;
    let gameStarted = false;
    let flagCount = 0;
    let revealedCount = 0;
    let moves = 0;

    // ── Helpers ──────────────────────────────────

    function inBounds(r, c) {
        return r >= 0 && r < ROWS && c >= 0 && c < COLS;
    }

    function forEachNeighbor(r, c, cb) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (inBounds(nr, nc)) cb(nr, nc);
            }
        }
    }

    function updateMineCounter() {
        if (mineCounterEl) mineCounterEl.innerHTML = T(String(MINE_COUNT - flagCount).padStart(3, '0'));
    }

    // ── Grid Generation ──────────────────────────

    function createEmptyGrid() {
        grid = [];
        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            for (let c = 0; c < COLS; c++) {
                grid[r][c] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0
                };
            }
        }
    }

    function placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < MINE_COUNT) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            // Don't place on safe cell or its neighbors
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
            if (grid[r][c].mine) continue;
            grid[r][c].mine = true;
            placed++;
        }

        // Calculate adjacent mine counts
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].mine) continue;
                let count = 0;
                forEachNeighbor(r, c, (nr, nc) => {
                    if (grid[nr][nc].mine) count++;
                });
                grid[r][c].adjacentMines = count;
            }
        }
    }

    // ── Game Actions ─────────────────────────────

    function revealCell(r, c) {
        const cell = grid[r][c];
        if (cell.revealed || cell.flagged || gameOver || gameWon) return;

        cell.revealed = true;
        revealedCount++;
        moves++;

        if (cell.mine) {
            handleLoss();
            return;
        }

        // Flood fill for empty cells
        if (cell.adjacentMines === 0) {
            forEachNeighbor(r, c, (nr, nc) => {
                if (!grid[nr][nc].revealed && !grid[nr][nc].flagged) {
                    revealCell(nr, nc);
                }
            });
        }

        renderBoard();
        checkWin();
    }

    function toggleFlag(r, c) {
        const cell = grid[r][c];
        if (cell.revealed || gameOver || gameWon) return;

        if (!cell.flagged && flagCount >= MINE_COUNT) {
            if (mineCounterEl) {
                mineCounterEl.classList.remove('ms-shake');
                void mineCounterEl.offsetWidth;
                mineCounterEl.classList.add('ms-shake');
            }
            return;
        }

        cell.flagged = !cell.flagged;
        flagCount += cell.flagged ? 1 : -1;
        updateMineCounter();
        renderBoard();
    }

    function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].mine) {
                    grid[r][c].revealed = true;
                }
            }
        }
    }

    function checkWin() {
        const totalSafe = ROWS * COLS - MINE_COUNT;
        if (revealedCount >= totalSafe) {
            handleWin();
        }
    }

    function handleLoss() {
        gameOver = true;
        boardEl.classList.add('ms-game-over');
        revealAllMines();
        if (restartBtn) restartBtn.textContent = '😵';
        renderBoard();
    }

    function handleWin() {
        gameOver = true;
        gameWon = true;
        boardEl.classList.add('ms-win');
        if (restartBtn) restartBtn.textContent = '😎';

        // Flag remaining mines
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].mine && !grid[r][c].flagged) {
                    toggleFlag(r, c);
                }
            }
        }

        setTimeout(() => {
            if (onComplete) {
                // Return "mines" as moves equivalent for the global stats
                onComplete({ moves: MINE_COUNT });
            }
        }, 1500);
    }

    // ── Rendering ────────────────────────────────

    function renderBoard() {
        boardEl.innerHTML = '';

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = grid[r][c];
                const el = document.createElement('div');
                el.className = 'ms-cell';
                el.dataset.row = r;
                el.dataset.col = c;

                if (cell.revealed) {
                    el.classList.add('ms-cell--revealed');
                    if (cell.mine) {
                        el.classList.add('ms-cell--mine');
                        el.textContent = '💣';
                    } else if (cell.adjacentMines > 0) {
                        el.innerHTML = T(String(cell.adjacentMines));
                        
                        const textLength = el.textContent.replace(/\s+/g, '').length;
                        if (textLength >= 10) {
                            el.style.fontSize = '9px';
                        }
                        
                        el.dataset.count = cell.adjacentMines;
                    }
                } else if (cell.flagged) {
                    el.classList.add('ms-cell--flag');
                    el.textContent = '🚩';
                }

                // Click handlers
                el.addEventListener('click', () => handleCellClick(r, c));
                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                });

                boardEl.appendChild(el);
            }
        }
    }

    function handleCellClick(r, c) {
        if (gameOver) return;
        if (!gameStarted) {
            gameStarted = true;
            placeMines(r, c);
        }

        revealCell(r, c);
    }

    // ── New Game ─────────────────────────────────

    function startNewGame() {
        gameOver = false;
        gameWon = false;
        firstClick = true;
        gameStarted = false;
        flagCount = 0;
        revealedCount = 0;
        moves = 0;

        createEmptyGrid();
        updateMineCounter();
        if (restartBtn) restartBtn.textContent = '🙂';
        if (boardEl) {
            boardEl.classList.remove('ms-game-over', 'ms-win');
        }
        renderBoard();
    }

    // ── Module Interface ─────────────────────────

    function init(containerEl, completeCb) {
        container = containerEl;
        onComplete = completeCb;

        container.innerHTML = `
            <header class="header">
                <h1 class="title">${T("Сапер")}</h1>
                <p class="subtitle">${T("Знайдіть всі безпечні клітинки. ЛКМ — відкрити, ПКМ — прапорець")}</p>
            </header>
            <div class="ms-header">
                <div class="ms-counter" id="ms-mine-counter">${T("000")}</div>
                <button class="ms-restart-btn" id="ms-restart-btn" title="${T("Почати заново")}">🙂</button>
            </div>
            <div class="board-wrapper ms-board-wrapper">
                <div class="ms-board" id="ms-board"></div>
            </div>
        `;

        boardEl = container.querySelector('#ms-board');
        mineCounterEl = container.querySelector('#ms-mine-counter');
        restartBtn = container.querySelector('#ms-restart-btn');

        if (restartBtn) {
            restartBtn.addEventListener('click', startNewGame);
        }

        startNewGame();
    }

    function destroy() {
        if (container) container.innerHTML = '';
        grid = [];
        gameOver = false;
        gameWon = false;
        firstClick = true;
    }

    // ── Register ─────────────────────────────────
    window.PuzzleRegistry.push({
        name: 'Сапер',
        init,
        destroy
    });

})();
