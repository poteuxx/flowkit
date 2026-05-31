/**
 * Module: Symboles & Nicknames — Complete Edition
 * ✅ Font style picker (Fancy, Gothic, Bubble, Futuriste, Mirroir, Glitch)
 * ✅ Clickable symbol library (Gaming, Aesthetic, Arrows, Populaire)
 * ✅ Decoration templates (꧁ ꧂, 亗, 『 』, etc.)
 * ✅ One-click copy per result
 */

export default class SymbolsModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.inputText = '';
        this.activeStyle = 'Fancy';

        // ── Font Maps ────────────────────────────────────────────────
        this.fontMaps = {
            Fancy: {
                a:'𝓪',b:'𝓫',c:'𝓬',d:'𝓭',e:'𝓮',f:'𝓯',g:'𝓰',h:'𝓱',i:'𝓲',j:'𝓳',k:'𝓴',l:'𝓵',
                m:'𝓶',n:'𝓷',o:'𝓸',p:'𝓹',q:'𝓺',r:'𝓻',s:'𝓼',t:'𝓽',u:'𝓾',v:'𝓿',w:'𝔀',x:'𝔁',y:'𝔂',z:'𝔃',
                A:'𝓐',B:'𝓑',C:'𝓒',D:'𝓓',E:'𝓔',F:'𝓕',G:'𝓖',H:'𝓗',I:'𝓘',J:'𝓙',K:'𝓚',L:'𝓛',
                M:'𝓜',N:'𝓝',O:'𝓞',P:'𝓟',Q:'𝓠',R:'𝓡',S:'𝓢',T:'𝓣',U:'𝓤',V:'𝓥',W:'𝓦',X:'𝓧',Y:'𝓨',Z:'𝓩'
            },
            Gothique: {
                a:'𝔞',b:'𝔟',c:'𝔠',d:'𝔡',e:'𝔢',f:'𝔣',g:'𝔤',h:'𝔥',i:'𝔦',j:'𝔧',k:'𝔨',l:'𝔩',
                m:'𝔪',n:'𝔫',o:'𝔬',p:'𝔭',q:'𝔮',r:'𝔯',s:'𝔰',t:'𝔱',u:'𝔲',v:'𝔳',w:'𝔴',x:'𝔵',y:'𝔶',z:'𝔷',
                A:'𝔄',B:'𝔅',C:'ℭ',D:'𝔇',E:'𝔈',F:'𝔉',G:'𝔊',H:'ℌ',I:'ℑ',J:'𝔍',K:'𝔎',L:'𝔏',
                M:'𝔐',N:'𝔑',O:'𝔒',P:'𝔓',Q:'𝔔',R:'ℜ',S:'𝔖',T:'𝔗',U:'𝔘',V:'𝔙',W:'𝔚',X:'𝔛',Y:'𝔜',Z:'ℨ'
            },
            Bulles: {
                a:'ⓐ',b:'ⓑ',c:'ⓒ',d:'ⓓ',e:'ⓔ',f:'ⓕ',g:'ⓖ',h:'ⓗ',i:'ⓘ',j:'ⓙ',k:'ⓚ',l:'ⓛ',
                m:'ⓜ',n:'ⓝ',o:'ⓞ',p:'ⓟ',q:'ⓠ',r:'ⓡ',s:'ⓢ',t:'ⓣ',u:'ⓤ',v:'ⓥ',w:'ⓦ',x:'ⓧ',y:'ⓨ',z:'ⓩ',
                A:'Ⓐ',B:'Ⓑ',C:'Ⓒ',D:'Ⓓ',E:'Ⓔ',F:'Ⓕ',G:'Ⓖ',H:'Ⓗ',I:'Ⓘ',J:'Ⓙ',K:'Ⓚ',L:'Ⓛ',
                M:'Ⓜ',N:'Ⓝ',O:'Ⓞ',P:'Ⓟ',Q:'Ⓠ',R:'Ⓡ',S:'Ⓢ',T:'Ⓣ',U:'Ⓤ',V:'Ⓥ',W:'Ⓦ',X:'Ⓧ',Y:'Ⓨ',Z:'Ⓩ'
            },
            Futuriste: {
                a:'Λ',b:'ß',c:'Ç',d:'Đ',e:'Ξ',f:'ƒ',g:'Ĝ',h:'Ħ',i:'Î',j:'Ĵ',k:'Ҝ',l:'Ł',
                m:'M',n:'И',o:'Ø',p:'Ρ',q:'Ω',r:'Я',s:'Ş',t:'Ţ',u:'Ц',v:'V',w:'Ш',x:'Χ',y:'Ÿ',z:'Ż',
                A:'Λ',B:'β',C:'Ç',D:'Đ',E:'Ξ',F:'ƒ',G:'Ĝ',H:'Ħ',I:'Î',J:'Ĵ',K:'Ҝ',L:'Ł',
                M:'M',N:'И',O:'Ø',P:'Ρ',Q:'Ω',R:'Я',S:'Ş',T:'Ţ',U:'Ц',V:'V',W:'Ш',X:'Χ',Y:'Ÿ',Z:'Ż'
            },
            Mirroir: {
                a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ɓ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',
                m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
                A:'∀',B:'q',C:'Ɔ',D:'p',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ɾ',K:'ʞ',L:'˥',
                M:'W',N:'N',O:'O',P:'Ԁ',Q:'Q',R:'ɹ',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z'
            },
            Glitch: (s) => s.split('').map(c => {
                const marks = ['\u0300','\u0301','\u0302','\u0308','\u0307','\u030A','\u030B','\u033F','\u0350','\u0351'];
                const count = Math.floor(Math.random() * 3) + 1;
                let r = c;
                for (let i = 0; i < count; i++) r += marks[Math.floor(Math.random() * marks.length)];
                return r;
            }).join('')
        };

        // ── Symbol Library ───────────────────────────────────────────
        this.symbolLib = {
            'Gaming':    ['亗','〆','卍','ꔪ','웃','유','⚡','☠','♛','♚','⚔','🎮'],
            'Populaire': ['★','☆','♥','♡','✔','✘','✉','☀','☁','⌛','☎','✿'],
            'Aesthetic': ['꧁','꧂','『','』','「」','【','】','〔','〕','░','▒','▓'],
            'Flèches':   ['↑','↓','←','→','↔','↕','➤','➜','➝','⇒','⇐','⇔'],
            'Mathéma':   ['∞','≈','≠','≤','≥','±','÷','×','∑','√','π','Ω']
        };

        // ── Decoration Templates ─────────────────────────────────────
        this.decorations = [
            (s) => `꧁ ${s} ꧂`,
            (s) => `〆 ${s} 〆`,
            (s) => `亗 ${s} 亗`,
            (s) => `『 ${s} 』`,
            (s) => `░ ${s} ░`,
            (s) => `⚡ ${s} ⚡`,
            (s) => `♛ ${s} ♛`,
            (s) => `« ${s} »`,
            (s) => `【 ${s} 】`,
            (s) => `× ${s} ×`,
        ];
    }

    applyFont(text, style) {
        if (style === 'Glitch') return this.fontMaps.Glitch(text);
        const map = this.fontMaps[style] || {};
        return text.split('').map(c => map[c] || c).join('');
    }

    async render() {
        this.container.innerHTML = `
            <div style="max-width: 860px; margin: 0 auto; animation: fadeIn 0.5s ease; display: flex; flex-direction: column; gap: 1.5rem;">

                <!-- Input Card -->
                <div class="glass-card">
                    <h2 style="font-size: 1.6rem; margin-bottom: 0.4rem;">Générateur de Nickname</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">Choisissez un style, cliquez des symboles, copiez votre résultat.</p>
                    <input id="nick-input" type="text" placeholder="Entrez votre pseudo..."
                        style="width:100%; background: rgba(0,0,0,0.25); border: 1.5px solid var(--border-glass);
                               border-radius: 0.75rem; padding: 1rem 1.25rem; color: white; font-size: 1.4rem;
                               font-weight: 700; outline: none; transition: border-color 0.3s;">
                </div>

                <!-- Style Picker -->
                <div class="glass-card">
                    <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-secondary); margin-bottom: 1rem;">Police & Style</p>
                    <div id="style-picker" style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                        ${Object.keys(this.fontMaps).map(s => `
                            <button class="style-btn ${s === this.activeStyle ? 'active' : ''}" data-style="${s}"
                                style="background: ${s === this.activeStyle ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'};
                                       color: ${s === this.activeStyle ? 'white' : 'var(--text-secondary)'};
                                       border: 1px solid ${s === this.activeStyle ? 'var(--accent-primary)' : 'var(--border-glass)'};
                                       padding: 0.5rem 1.2rem; border-radius: 2rem; cursor: pointer;
                                       font-weight: 700; font-size: 0.85rem; transition: all 0.2s;">
                                ${s}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Symbol Library -->
                <div class="glass-card">
                    <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-secondary); margin-bottom: 1rem;">Bibliothèque de Symboles</p>
                    ${Object.entries(this.symbolLib).map(([cat, syms]) => `
                        <div style="margin-bottom: 1rem;">
                            <p style="font-size: 0.65rem; color: var(--accent-primary); margin-bottom: 0.5rem; font-weight: 800;">${cat}</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${syms.map(sym => `
                                    <button class="sym-key" data-sym="${sym}"
                                        style="width: 42px; height: 42px; background: rgba(255,255,255,0.04);
                                               border: 1px solid var(--border-glass); border-radius: 0.5rem;
                                               color: white; font-size: 1.1rem; cursor: pointer; transition: all 0.2s;">
                                        ${sym}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Results -->
                <div id="results-grid" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <p style="text-align:center; color: var(--text-secondary); padding: 2rem;">Tapez un pseudo pour voir les résultats.</p>
                </div>
            </div>

            <style>
                #nick-input:focus { border-color: var(--accent-primary); }
                .sym-key:hover { background: rgba(34,211,238,0.12) !important; border-color: var(--accent-primary) !important; transform: scale(1.1); }
                .style-btn:hover { color: white !important; border-color: var(--text-secondary) !important; }
                .copy-result-btn { background: var(--bg-secondary); border: 1px solid var(--border-glass); color: var(--text-secondary); padding: 0.4rem 1rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.75rem; font-weight: 800; transition: all 0.2s; }
                .copy-result-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
            </style>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const input = document.getElementById('nick-input');
        const picker = document.getElementById('style-picker');

        // Live update on input
        input.oninput = () => { this.inputText = input.value; this.updateResults(); };

        // Style picker buttons
        picker.addEventListener('click', (e) => {
            const btn = e.target.closest('.style-btn');
            if (!btn) return;
            this.activeStyle = btn.dataset.style;
            picker.querySelectorAll('.style-btn').forEach(b => {
                const active = b.dataset.style === this.activeStyle;
                b.style.background = active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)';
                b.style.color = active ? 'white' : 'var(--text-secondary)';
                b.style.borderColor = active ? 'var(--accent-primary)' : 'var(--border-glass)';
            });
            this.updateResults();
        });

        // Symbol library — insert into input at cursor
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sym-key');
            if (!btn) return;
            const sym = btn.dataset.sym;
            const el = document.getElementById('nick-input');
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.value = el.value.slice(0, start) + sym + el.value.slice(end);
            el.selectionStart = el.selectionEnd = start + sym.length;
            el.focus();
            this.inputText = el.value;
            this.updateResults();
        });
    }

    updateResults() {
        const grid = document.getElementById('results-grid');
        if (!this.inputText.trim()) {
            grid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">Tapez un pseudo pour voir les résultats.</p>';
            return;
        }

        const styled = this.applyFont(this.inputText, this.activeStyle);

        const rows = this.decorations.map(tpl => {
            const result = tpl(styled);
            return `
                <div class="glass-card" style="padding: 1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; gap: 1rem;">
                    <span style="font-size: 1.1rem; font-weight: 800; word-break: break-all;">${result}</span>
                    <button class="copy-result-btn" data-copy="${encodeURIComponent(result)}">COPIER</button>
                </div>
            `;
        });

        // Also show raw styled version (no decoration)
        const rawRow = `
            <div class="glass-card" style="padding: 1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; gap: 1rem; border-color: rgba(34,211,238,0.3);">
                <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-primary);">${styled}</span>
                <button class="copy-result-btn" data-copy="${encodeURIComponent(styled)}" style="border-color: var(--accent-primary); color: var(--accent-primary);">COPIER</button>
            </div>
        `;

        grid.innerHTML = rawRow + rows.join('');

        grid.querySelectorAll('.copy-result-btn').forEach(btn => {
            btn.onclick = () => {
                navigator.clipboard.writeText(decodeURIComponent(btn.dataset.copy));
                const orig = btn.innerText;
                btn.innerText = 'COPIÉ ✓';
                btn.style.color = 'var(--accent-primary)';
                setTimeout(() => { btn.innerText = orig; btn.style.color = ''; }, 2000);
            };
        });
    }

    destroy() {}
}
