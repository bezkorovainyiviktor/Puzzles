/**
 * Color Memory Puzzle Module
 * Player sees an 8-color sequence and must click them in order
 * on a grayscale 5x5 grid of randomly generated colors.
 */

(function () {
    'use strict';

    const GRID_SIZE = 5;      // 5x5 grid
    const SEQ_LENGTH = 8;     // 8-color target sequence

    let container = null;
    let onComplete = null;

    // Game state
    let allColors = [];       // 25 RGB colors for the grid
    let sequence = [];        // 8-color target sequence (indices into allColors)
    let currentStep = 0;      // How many sequence colors correctly clicked so far
    let gameWon = false;

    // ── Color Helpers ─────────────────────────────

    /** Generate a random RGB color object */
    function randomColor() {
        return {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256),
        };
    }

    /** Convert RGB to CSS string */
    function toCss({ r, g, b }) {
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Convert RGB to grayscale luminance and return CSS gray string.
     * Uses ITU-R BT.709 perceptual luminance formula.
     */
    function toGrayscaleCss({ r, g, b }) {
        const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        return `rgb(${lum}, ${lum}, ${lum})`;
    }

    /**
     * Generate 25 perceptually distinct colors by splitting the HSL colorspace
     * and adding random variation per color, ensuring enough visual contrast.
     */
    function generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i / count) * 360 + (Math.random() * 25 - 12);
            const sat = 55 + Math.random() * 40;  // 55-95% saturation
            const lit = 35 + Math.random() * 30;   // 35-65% lightness
            colors.push(hslToRgb(hue, sat, lit));
        }
        // Shuffle the array so colors aren't in rainbow order
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }
        return colors;
    }

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60)       { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else              { r = c; g = 0; b = x; }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
        };
    }

    // ── Rendering ─────────────────────────────────

    function renderSequence() {
        const seqEl = container.querySelector('#cm-sequence');
        seqEl.innerHTML = '';

        sequence.forEach((colorIdx, step) => {
            const color = allColors[colorIdx];

            // Square color block
            const swatch = document.createElement('div');
            swatch.className = 'cm-seq-swatch';
            swatch.style.background = toCss(color);
            swatch.setAttribute('data-step', step + 1);

            // Step number label above each swatch
            const label = document.createElement('span');
            label.className = 'cm-seq-label';
            label.textContent = step + 1;

            const wrapper = document.createElement('div');
            wrapper.className = 'cm-seq-item';
            wrapper.appendChild(label);
            wrapper.appendChild(swatch);

            // Arrow between swatches
            if (step < sequence.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'cm-seq-arrow';
                arrow.textContent = '→';
                seqEl.appendChild(wrapper);
                seqEl.appendChild(arrow);
            } else {
                seqEl.appendChild(wrapper);
            }
        });
    }

    function renderGrid() {
        const gridEl = container.querySelector('#cm-grid');
        gridEl.innerHTML = '';

        // Shuffle the positions so grid layout is random
        const positions = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Create a cell for each grid position mapped to a color index
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const colorIdx = positions[i];
            const color = allColors[colorIdx];

            const cell = document.createElement('div');
            cell.className = 'cm-cell';
            cell.style.background = toGrayscaleCss(color);
            cell.dataset.colorIdx = colorIdx;

            cell.addEventListener('click', () => handleCellClick(colorIdx, cell));
            gridEl.appendChild(cell);
        }
    }

    function updateHighlight() {
        // Mark completed steps in the sequence display
        container.querySelectorAll('.cm-seq-swatch').forEach((swatch) => {
            const step = parseInt(swatch.getAttribute('data-step'), 10);
            swatch.classList.toggle('cm-seq-swatch--done', step <= currentStep);
            swatch.classList.toggle('cm-seq-swatch--active', step === currentStep + 1);
        });
    }

    // ── Game Logic ───────────────────────────────

    function handleCellClick(colorIdx, cell) {
        if (gameWon) return;

        const expectedColorIdx = sequence[currentStep];

        if (colorIdx === expectedColorIdx) {
            // Correct!
            cell.classList.add('cm-cell--correct');
            currentStep++;
            updateHighlight();

            if (currentStep === SEQ_LENGTH) {
                handleWin();
            }
        } else {
            // Wrong! Reset sequence progress
            triggerResetAnimation();
        }
    }

    function triggerResetAnimation() {
        const gridEl = container.querySelector('#cm-grid');
        gridEl.classList.add('cm-grid--shake');

        // Remove correct state from all cells
        container.querySelectorAll('.cm-cell--correct').forEach(c => {
            c.classList.remove('cm-cell--correct');
        });

        currentStep = 0;
        updateHighlight();

        setTimeout(() => {
            gridEl.classList.remove('cm-grid--shake');
        }, 500);
    }

    function handleWin() {
        gameWon = true;

        // Reveal all grid cells in their real colors
        container.querySelectorAll('.cm-cell').forEach(cell => {
            const colorIdx = parseInt(cell.dataset.colorIdx, 10);
            cell.style.background = toCss(allColors[colorIdx]);
            cell.style.filter = 'none';
            cell.classList.add('cm-cell--reveal');
        });

        setTimeout(() => {
            if (onComplete) onComplete({});
        }, 1400);
    }

    // ── Module Interface ─────────────────────────

    function init(containerEl, completeCb) {
        container = containerEl;
        onComplete = completeCb;
        gameWon = false;
        currentStep = 0;

        // Generate colors and sequence
        allColors = generateColors(GRID_SIZE * GRID_SIZE);

        // Pick SEQ_LENGTH unique colors from the 25 for the sequence
        const indices = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        sequence = indices.slice(0, SEQ_LENGTH);

        // Build HTML
        container.innerHTML = `
            <header class="header">
                <h1 class="title">🎨 ${T("Пам'ять кольорів")}</h1>
                <p class="subtitle">${T("Натисніть кольори у правильному порядку на чорно-білій сітці.")}</p>
            </header>

            <div class="cm-section-label">${T("Послідовність кольорів:", false)}</div>
            <div class="cm-sequence-wrapper">
                <div class="cm-sequence" id="cm-sequence"></div>
            </div>

            <div class="cm-section-label" style="margin-top: 1.5rem;">${T("Оберіть кольори в порядку", false)} → (${T("чорно-біла сітка", false)}):</div>
            <div class="cm-grid-wrapper">
                <div class="cm-grid" id="cm-grid"></div>
            </div>


        `;

        renderSequence();
        renderGrid();
        updateHighlight();


    }

    function destroy() {
        if (container) container.innerHTML = '';
        container = null;
        onComplete = null;
        allColors = [];
        sequence = [];
        currentStep = 0;
        gameWon = false;
    }

    // ── Register ─────────────────────────────────
    window.PuzzleRegistry.push({
        name: 'Пам\'ять кольорів',
        init,
        destroy
    });

})();
