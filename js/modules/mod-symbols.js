/**
 * Module: Symbols & Nicknames
 * Functional recreation of Namefont concepts
 */

export default class SymbolsModule {
    constructor(container) {
        this.container = container;
        this.inputValue = '';
        this.maps = {
            'Fancy': (s) => s.split('').map(c => this.chars.fancy[c] || c).join(''),
            'Futuriste': (s) => s.split('').map(c => this.chars.futuristic[c] || c).join(''),
            'Gothique': (s) => s.split('').map(c => this.chars.gothic[c] || c).join(''),
            'Bulles': (s) => s.split('').map(c => this.chars.bubbles[c] || c).join(''),
            'Glitch': (s) => s.split('').map(c => c + (Math.random() > 0.5 ? this.chars.glitch[Math.floor(Math.random() * this.chars.glitch.length)] : '')).join('')
        };
        
        this.chars = {
            fancy: {'a':'𝓪','b':'𝓫','c':'𝓬','d':'𝓭','e':'𝓮','f':'𝓯','g':'𝓰','h':'𝓱','i':'𝓲','j':'𝓳','k':'𝓴','l':'𝓵','m':'𝓶','n':'𝓷','o':'𝓸','p':'𝓹','q':'𝓺','r':'𝓻','s':'𝓼','t':'𝓽','u':'𝓾','v':'𝓿','w':'𝔀','x':'𝔁','y':'𝔂','z':'𝔃','A':'𝓐','B':'𝓑','C':'𝓒','D':'𝓓','E':'𝓔','F':'𝓕','G':'𝓖','H':'𝓗','I':'𝓘','J':'𝓙','K':'𝓚','L':'𝓛','M':'𝓜','N':'𝓝','O':'𝓞','P':'𝓟','Q':'𝓠','R':'𝓡','S':'𝓢','T':'𝓣','U':'𝓤','V':'𝓥','W':'𝓦','X':'𝓧','Y':'𝓨','Z':'𝓩'},
            futuristic: {'a':'Λ','b':'ß','c':'Ȼ','d':'Đ','e':'Σ','f':'Ŧ','g':'Ǥ','h':'Ħ','i':'Ɨ','j':'Ɉ','k':'Ҝ','l':'Ł','m':'M','n':'N','o':'Ø','p':'P','q':'Ɋ','r':'Ɍ','s':'§','t':'Ŧ','u':'U','v':'V','w':'W','x':'X','y':'¥','z':'Z'},
            gothic: {'a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷','A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'','T':'𝔗','U':'𝔘','V':'𝔙','W':'','X':'𝔛','Y':'𝔜','Z':'ℨ'},
            bubbles: {'a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ','k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ','u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ'},
            glitch: ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030a', '\u030b', '\u030c', '\u030d', '\u030e', '\u030f']
        };

        this.decorations = ['★ ', ' ♔', '꧁ ', ' ꧂', '『 ', ' 』', '░ ', ' ░', '〆', '亗', '卍'];
        this.categories = {
            'Populaire': ['★', '☆', '♥', '♡', '✔', '✘', '✉', '⌛'],
            'Gaming': ['亗', '〆', '卍', '气', '☯', '♛', '♚', '⚡'],
            'Flèches': ['↑', '↓', '←', '→', '↔', '↕', '↖', '↗'],
            'Aesthetic': ['『', '』', '「', '」', '【', '】', '〔', '〕']
        };
    }

    async render() {
        this.container.innerHTML = `
            <div class="symbols-container" style="max-width: 900px; margin: 0 auto;">
                <div class="glass-card" style="margin-bottom: 2rem;">
                    <h2 style="margin-bottom: 1rem;">Générateur de Nickname Pro</h2>
                    <input type="text" id="symbol-input" placeholder="Pseudo Flowkit..." style="width: 100%; ...">
                </div>

                <div class="glass-card" style="margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem; font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary);">Bibliothèque de Symboles</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${Object.entries(this.categories).map(([cat, syms]) => `
                            <div style="margin-bottom: 1rem; width: 100%;">
                                <p style="font-size: 0.7rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${cat}</p>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                    ${syms.map(s => `<button class="sym-box" onclick="document.getElementById('symbol-input').value += '${s}'; document.getElementById('symbol-input').dispatchEvent(new Event('input'))">${s}</button>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="symbol-results" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>
            <style>
                .sym-box { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: white; width: 40px; height: 40px; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .sym-box:hover { border-color: var(--accent-primary); background: rgba(34, 211, 238, 0.1); }
            </style>
        `;

        const input = document.getElementById('symbol-input');
        input.oninput = (e) => {
            this.inputValue = e.target.value;
            this.updateResults();
        };

        this.updateResults();
    }

    updateResults() {
        const results = document.getElementById('symbol-results');
        if (!this.inputValue) {
            results.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Commencez à taper pour voir les résultats...</div>';
            return;
        }

        results.innerHTML = '';
        
        Object.entries(this.maps).forEach(([styleName, transformFn]) => {
            const transformed = transformFn(this.inputValue);
            this.renderResultItem(styleName, transformed, results);
        });

        // Add some decorated versions
        this.renderResultItem('Décoré', `★ ${this.inputValue} ★`, results);
        this.renderResultItem('Royal', `♔ ${this.inputValue} ♔`, results);
        this.renderResultItem('Japonais', `『 ${this.inputValue} 』`, results);
    }

    renderResultItem(label, text, container) {
        const item = document.createElement('div');
        item.className = 'glass-card';
        item.style = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; animation: slideIn 0.3s ease;';
        
        item.innerHTML = `
            <div>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${label}</p>
                <span style="font-size: 1.1rem; font-weight: 600;">${text}</span>
            </div>
            <button class="copy-btn" style="background: rgba(6, 182, 212, 0.1); border: 1px solid var(--accent-primary); color: var(--accent-primary); padding: 0.5rem 1rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s;">
                Copier
            </button>
        `;

        const btn = item.querySelector('.copy-btn');
        btn.onclick = () => {
            navigator.clipboard.writeText(text);
            btn.innerText = 'Copié !';
            btn.style.background = 'var(--accent-primary)';
            btn.style.color = 'white';
            setTimeout(() => {
                btn.innerText = 'Copier';
                btn.style.background = 'rgba(6, 182, 212, 0.1)';
                btn.style.color = 'var(--accent-primary)';
            }, 2000);
        };

        container.appendChild(item);
    }

    destroy() {
        // Cleanup if needed
    }
}
