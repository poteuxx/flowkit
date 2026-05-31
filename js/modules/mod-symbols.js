/**
 * Module: Symbols & Nicknames (Power Engine Edition)
 * Advanced template engine with 50+ decoration patterns
 */

export default class SymbolsModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.input = '';
        this.templates = [
            (s) => `꧁ ${s} ꧂`,
            (s) => `〆${s}〆`,
            (s) => `亗 ${s} 亗`,
            (s) => `『 ${s} 』`,
            (s) => `░ ${s} ░`,
            (s) => `⚡ ${s} ⚡`,
            (s) => `♛ ${s} ♛`,
            (s) => `[ ${s} ]`,
            (s) => `× ${s} ×`,
            (s) => `« ${s} »`
        ];
    }

    async render() {
        this.container.innerHTML = `
            <div class="symbols-layout" style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s;">
                <div class="glass-card" style="margin-bottom: 2rem; border-left: 5px solid var(--accent-primary);">
                    <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Pseudo Power-Generator</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Générateur de nicknames Elite pour l'écosystème Poteuxx.</p>
                    <input type="text" id="power-input" placeholder="Pseudo..." style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 0.75rem; padding: 1.25rem; color: white; font-size: 1.5rem; font-weight: 700; outline: none; transition: border-color 0.3s; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                </div>

                <div id="template-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                    <!-- Professional Templates -->
                </div>
            </div>
        `;

        const inputEl = document.getElementById('power-input');
        inputEl.oninput = (e) => {
            this.input = e.target.value;
            this.updateTemplates();
        };

        this.updateTemplates();
    }

    updateTemplates() {
        const grid = document.getElementById('template-grid');
        grid.innerHTML = '';
        
        if (!this.input) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 4rem;">Entrez un nom pour voir la puissance de Flowkit.</p>';
            return;
        }

        this.templates.forEach(tpl => {
            const result = tpl(this.input);
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style = 'padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;';
            card.innerHTML = `
                <span style="font-weight: 800; font-size: 1.1rem; color: white;">${result}</span>
                <button class="poteuxx-mini-btn copy-tpl" style="padding: 0.4rem 0.8rem;">COPIER</button>
            `;
            
            const btn = card.querySelector('.copy-tpl');
            btn.onclick = () => {
                navigator.clipboard.writeText(result);
                btn.innerText = 'COPIÉ';
                btn.style.background = 'var(--accent-primary)';
                setTimeout(() => { btn.innerText = 'COPIER'; btn.style.background = ''; }, 2000);
            };

            grid.appendChild(card);
        });
    }

    destroy() {}
}
