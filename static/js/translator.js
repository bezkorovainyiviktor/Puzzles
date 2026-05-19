/**
 * Translator Module
 * Provides 'binary', 'braille', and 'morse' encoding for Ukrainian text and digits.
 */

window.Translator = {
    currentLanguage: null, // 'binary', 'braille', 'morse', or null (original)

    // Ukrainian to Braille mapping
    brailleMap: {
        'а': '⠁', 'б': '⠃', 'в': '⠺', 'г': '⠛', 'ґ': '⠻', 'д': '⠙',
        'е': '⠑', 'є': '⠣', 'ж': '⠚', 'з': '⠵', 'и': '⠊', 'і': '⠪',
        'ї': '⠹', 'й': '⠯', 'к': '⠅', 'л': '⠇', 'м': '⠍', 'н': '⠝',
        'о': '⠕', 'п': '⠏', 'р': '⠗', 'с': '⠎', 'т': '⠞', 'у': '⠥',
        'ф': '⠋', 'х': '⠓', 'ц': '⠉', 'ч': '⠟', 'ш': '⠱', 'щ': '⠭',
        'ь': '⠾', 'ю': '⠳', 'я': '⠫',
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
        'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
        'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
        '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑',
        '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚',
        ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', '-': '⠤',
        '/': '⠌', ':': '⠒'
    },

    // Ukrainian to Morse code mapping
    morseMap: {
        'а': '.-', 'б': '-...', 'в': '...-', 'г': '--.', 'ґ': '--.-', 'д': '-..',
        'е': '.', 'є': '..-..', 'ж': '...-', 'з': '--..', 'и': '..', 'і': '..',
        'ї': '.---', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.',
        'о': '---', 'п': '.--.', 'р': '.-.', 'с': '...', 'т': '-', 'у': '..-',
        'ф': '..-.', 'х': '....', 'ц': '-.-.', 'ч': '---.', 'ш': '----', 'щ': '--.-',
        'ь': '-..-', 'ю': '..--', 'я': '.-.-',
        'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---',
        'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-',
        'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..',
        '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
        '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
        ' ': ' ', '.': '.-.-.-', ',': '--..--', '!': '-.-.--', '?': '..--..', '-': '-....-'
    },

    init() {
        this.currentLanguage = sessionStorage.getItem('puzzle_language');
    },

    setLanguage(lang) {
        this.currentLanguage = lang;
        sessionStorage.setItem('puzzle_language', lang);
    },

    translate(text, allowHTML = true) {
        if (!this.currentLanguage || this.currentLanguage === 'default') return text;
        if (text === null || text === undefined) return '';

        const str = String(text);
        
        // Prevent translating already translated complex DOM elements like emojis or HTML
        if (str.includes('<') && str.includes('>')) return str; 

        let res = str;

        if (this.currentLanguage === 'binary') {
            res = Array.from(str).map(char => {
                if (char === ' ') return '00100000'; // special space for binary to separate slightly
                // Represent characters in 11 bits
                return char.charCodeAt(0).toString(2).padStart(11, '0');
            }).join(' ');
        } 
        
        else if (this.currentLanguage === 'braille') {
            res = Array.from(str.toLowerCase()).map(char => {
                return this.brailleMap[char] !== undefined ? this.brailleMap[char] : char;
            }).join('');
        } 
        
        else if (this.currentLanguage === 'morse') {
            res = Array.from(str.toLowerCase()).map(char => {
                if (char === ' ') return '  '; // Extra space between words in morse
                return this.morseMap[char] !== undefined ? this.morseMap[char] : char;
            }).join(' ').replace(/   /g, '   '); // Clean spacing
        }

        // Apply visual abbreviation if allowed
        const MAX_LEN = 40;
        if (allowHTML && res.length > MAX_LEN) {
            const short = res.substring(0, MAX_LEN);
            res = `<span class="tr-short">${short}</span><span class="tr-dots" style="cursor:pointer; color:var(--accent-light); font-weight:bold; font-size:1.1em; background: rgba(0,0,0,0.3); padding: 0 6px; border-radius: 4px; margin: 0 4px;" onclick="window.Translator.showOverlay(this.nextElementSibling.textContent)">...</span><span class="tr-rest" style="display:none;">${res}</span>`;
        }

        return res;
    },

    showOverlay(text) {
        let overlay = document.getElementById('translation-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'translation-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            overlay.style.backdropFilter = 'blur(10px)';
            overlay.style.webkitBackdropFilter = 'blur(10px)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.cursor = 'pointer';
            
            const box = document.createElement('div');
            box.id = 'translation-box';
            box.style.background = 'var(--bg-card)';
            box.style.border = '1px solid var(--glass-border)';
            box.style.padding = '2rem';
            box.style.borderRadius = 'var(--radius)';
            box.style.maxWidth = '90%';
            box.style.maxHeight = '90%';
            box.style.overflow = 'auto';
            box.style.color = 'var(--accent-light)';
            box.style.fontSize = '1.8rem';
            box.style.lineHeight = '1.4';
            box.style.wordBreak = 'break-all';
            box.style.boxShadow = '0 10px 50px rgba(0,0,0,0.6)';
            box.style.pointerEvents = 'none'; // Allow click to pass through to overlay
            
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            // Close on click anywhere
            overlay.addEventListener('click', () => {
                overlay.style.display = 'none';
            });
        }
        
        const box = document.getElementById('translation-box');
        box.textContent = text;
        overlay.style.display = 'flex';
    },

    // Recursively translates text nodes inside an element
    translateElement(el) {
        if (!this.currentLanguage || this.currentLanguage === 'default') return;
        
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        const nodesToReplace = [];
        let node;
        while ((node = walk.nextNode())) {
            const parent = node.parentElement;
            // Ignore script, style, and empty text nodes
            if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;
            // Ignore inner components of abbreviation
            if (parent.classList.contains('tr-short') || parent.classList.contains('tr-dots') || parent.classList.contains('tr-rest')) continue;
            // Ignore elements marked as notranslate
            if (parent.closest('.notranslate')) continue;

            const text = node.nodeValue;
            // Only translate if there are letters or numbers
            if (/[a-zA-Zа-яА-ЯіїєґІЇЄҐ0-9]/.test(text)) {
                nodesToReplace.push(node);
            }
        }

        nodesToReplace.forEach(node => {
            const text = node.nodeValue;
            const leading = text.match(/^\s*/)[0];
            const trailing = text.match(/\s*$/)[0];
            const core = text.trim();
            
            const el = node.parentElement;
            const preventAbbrev = el.closest('button') || el.closest('.btn') || el.closest('.gg-result-overlay') || el.closest('.win-card') || el.closest('.all-complete') || el.closest('.stat');
            
            const translatedHTML = window.Translator.translate(core, !preventAbbrev);
            
            const span = document.createElement('span');
            span.innerHTML = leading + translatedHTML + trailing;
            node.replaceWith(...span.childNodes);
        });
    }
};

window.T = function(text, allowHTML = true) {
    return window.Translator.translate(text, allowHTML);
};

// Initialize immediately so T() mapping is ready
window.Translator.init();
