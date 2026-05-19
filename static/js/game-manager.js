/**
 * Game Manager — Puzzle Orchestrator
 * Manages the sequence of puzzles, skip logic, and progress tracking.
 */

(function () {
    'use strict';

    // ── Puzzle Registry ─────────────────────────
    window.PuzzleRegistry = [];

    // ── DOM ──────────────────────────────────────
    const puzzleContainer = document.getElementById('puzzle-container');
    const btnSkip = document.getElementById('btn-skip');
    const btnLang = document.getElementById('btn-lang');
    const progressText = document.getElementById('puzzle-progress-text');
    const progressFill = document.getElementById('puzzle-progress-fill');
    const winOverlay = document.getElementById('win-overlay');
    const winMoves = document.getElementById('win-moves');
    const winTime = document.getElementById('win-time');
    const winTitle = document.getElementById('win-title');
    const winText = document.getElementById('win-text');
    const btnPlayAgain = document.getElementById('btn-play-again');

    // ── State ────────────────────────────────────
    let currentIndex = 0;
    let activePuzzle = null;


    // ── Public API ───────────────────────────────
    window.GameManager = {
        /** Called by a puzzle module when the player wins */
        completePuzzle(stats) {
            if (activePuzzle && activePuzzle.destroy) {
                activePuzzle.destroy();
            }

            const hasNext = currentIndex + 1 < window.PuzzleRegistry.length;

            if (hasNext) {
                winTitle.innerHTML = T('Чудово!', false);
                winText.innerHTML = T(`Ви пройшли `, false) + `<strong>${T(getPuzzleName(), false)}</strong>` + T(`. Готові до наступного рівня?`, false);
                btnPlayAgain.innerHTML = T('Наступна головоломка', false);
                winOverlay.classList.add('active');
                spawnConfetti();
            } else {
                // If this is the last puzzle, show final complete via skip loop 
                // Wait to make sure game-manager intercepts the end properly
                showAllComplete();
            }
        },

        /** Get current puzzle index */
        getCurrentIndex() {
            return currentIndex;
        },

        /** Get total puzzle count */
        getTotalPuzzles() {
            return window.PuzzleRegistry.length;
        }
    };



    // ── Helpers ──────────────────────────────────

    function getPuzzleName() {
        if (currentIndex < window.PuzzleRegistry.length) {
            return window.PuzzleRegistry[currentIndex].name;
        }
        return 'Головоломка';
    }

    function updateProgress() {
        const total = window.PuzzleRegistry.length;
        progressText.innerHTML = T('Головоломка ') + T(String(currentIndex + 1)) + ' / ' + T(String(total));
        const pct = ((currentIndex + 1) / total) * 100;
        progressFill.style.width = pct + '%';
    }

    function loadPuzzle(index) {
        // Hide win overlay
        winOverlay.classList.remove('active');

        // Destroy previous
        if (activePuzzle && activePuzzle.destroy) {
            activePuzzle.destroy();
        }

        // Clear container
        puzzleContainer.innerHTML = '';

        if (index >= window.PuzzleRegistry.length) {
            // All puzzles completed → show final screen
            showAllComplete();
            return;
        }

        currentIndex = index;
        sessionStorage.setItem('puzzle_index', currentIndex);
        updateProgress();

        // Ensure controls are visible when a puzzle is loaded
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.style.display = 'flex';
        }

        activePuzzle = window.PuzzleRegistry[currentIndex];
        activePuzzle.init(puzzleContainer, window.GameManager.completePuzzle.bind(window.GameManager));
    }

    function showAllComplete() {
        puzzleContainer.innerHTML = `
            <div class="all-complete">
                <div class="all-complete__emoji">🏆</div>
                <h2 class="all-complete__title">${T('Всі головоломки пройдено!', false)}</h2>
                <p class="all-complete__text">
                    ${T('Ви — справжній майстер головоломок.', false)}
                </p>
                <div style="margin-top:2rem;">
                    <button class="btn btn--primary" id="btn-restart-all">🔄 ${T('Почати заново', false)}</button>
                </div>
            </div>
        `;
        progressText.innerHTML = T('Завершено!');
        progressFill.style.width = '100%';
        winOverlay.classList.remove('active');

        // Hide controls on the final success screen
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.style.display = 'none';
        }

        spawnConfetti();

        // Bind restart
        setTimeout(() => {
            const btn = document.getElementById('btn-restart-all');
            if (btn) btn.addEventListener('click', () => loadPuzzle(0));
        }, 100);
    }

    // ── Skip Logic ───────────────────────────────

    function skipPuzzle() {
        if (currentIndex === window.PuzzleRegistry.length - 1) {
            alert(T('Не можливо пропустити, так як це остання гра', false));
            return;
        }
        if (activePuzzle && activePuzzle.destroy) {
            activePuzzle.destroy();
        }
        loadPuzzle(currentIndex + 1);
    }

    // ── Restart ──────────────────────────────────

    function restartFromWin() {
        winOverlay.classList.remove('active');
        const hasNext = currentIndex + 1 < window.PuzzleRegistry.length;
        if (hasNext) {
            loadPuzzle(currentIndex + 1);
        } else {
            // Restart all puzzles
            loadPuzzle(0);
        }
    }

    function changeLanguage() {
        sessionStorage.removeItem('puzzle_language');
        sessionStorage.removeItem('puzzle_index');
        location.reload();
    }

    // ── Confetti ─────────────────────────────────

    function spawnConfetti() {
        const colors = ['#7c5cfc', '#38bdf8', '#f472b6', '#fbbf24', '#34d399', '#fb923c'];
        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            el.className = 'confetti';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-20px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.width = (6 + Math.random() * 8) + 'px';
            el.style.height = el.style.width;
            el.style.animationDelay = (Math.random() * 1.2) + 's';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4500);
        }
    }

    // ── Event Bindings ───────────────────────────

    btnSkip.addEventListener('click', skipPuzzle);
    btnLang.addEventListener('click', changeLanguage);
    btnPlayAgain.addEventListener('click', restartFromWin);

    function showLanguageSelection() {
        const titleText = 'Оберіть мову:';
        
        puzzleContainer.innerHTML = `
            <div class="lang-selection">
                <h2 class="title" style="margin-bottom: 2rem;">${titleText}</h2>
                <div class="lang-cards">
                    <div class="lang-card" data-lang="binary">
                        <div class="lang-preview">10000010010 10000111000 10000110001 10001000000 10000110000 10001000010 10000111000 00100000 10000111100 10000111110 10000110010 10001000011</div>
                        <div class="lang-name">Двійковий код</div>
                    </div>
                    <div class="lang-card" data-lang="braille">
                        <div class="lang-preview" style="font-size:2.5rem; letter-spacing: 5px;">⠺⠊⠃⠗⠁⠞⠊ ⠍⠕⠧⠥</div>
                        <div class="lang-name">Шрифт Брайля</div>
                    </div>
                    <div class="lang-card" data-lang="morse">
                        <div class="lang-preview">...- .. -... .-. .- - ..   -- --- ...- ..-</div>
                        <div class="lang-name">Азбука Морзе</div>
                    </div>
                </div>
                
                <div style="margin-top: 3rem; text-align: center;">
                    <input type="text" id="secret-lang-input" placeholder="Введіть код..." autocomplete="off" style="
                        background: rgba(0, 0, 0, 0.4);
                        border: 1px solid var(--glass-border);
                        border-radius: 50px;
                        padding: 0.8rem 1.5rem;
                        color: var(--text-primary);
                        font-size: 1rem;
                        text-align: center;
                        width: 250px;
                        outline: none;
                        transition: all 0.2s ease;
                    " onfocus="this.style.borderColor='var(--accent-light)'; this.style.boxShadow='0 0 15px rgba(124, 92, 252, 0.35)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.08)'; this.style.boxShadow='none';">
                </div>
            </div>
        `;

        document.querySelectorAll('.lang-card').forEach(card => {
            card.addEventListener('click', () => {
                const lang = card.getAttribute('data-lang');
                window.Translator.setLanguage(lang);
                // Translate the static HTML elements immediately
                window.Translator.translateElement(document.body);
                // Re-show controls and start game
                document.querySelector('.controls').style.display = 'flex';
                document.querySelector('.puzzle-progress').style.display = 'block';
                loadPuzzle(0);
            });
        });

        const secretInput = document.getElementById('secret-lang-input');
        if (secretInput) {
            secretInput.addEventListener('input', (e) => {
                if (e.target.value.trim().toLowerCase() === 'дефолт') {
                    window.Translator.setLanguage('default');
                    document.querySelector('.controls').style.display = 'flex';
                    document.querySelector('.puzzle-progress').style.display = 'block';
                    loadPuzzle(0);
                }
            });
        }
    }

    // ── Init (deferred until all puzzle scripts loaded) ──
    window.addEventListener('load', () => {
        // Always clear ALL progress on page load (Ctrl+R resets everything to language selection)
        sessionStorage.removeItem('puzzle_index');
        sessionStorage.removeItem('puzzle_language');
        window.Translator.currentLanguage = null;

        document.querySelector('.controls').style.display = 'none';
        document.querySelector('.puzzle-progress').style.display = 'none';
        showLanguageSelection();
    });

})();
