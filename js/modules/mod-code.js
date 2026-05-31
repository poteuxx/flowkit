/**
 * Module: Code Vault
 * Developer Sandbox for snippet management
 */

export default class CodeModule {
    constructor(container) {
        this.container = container;
        this.snippets = [
            { id: 1, name: 'Glassmorphism CSS', code: '.card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.1); }' },
            { id: 2, name: 'Fetch API Helper', code: 'const getData = async (url) => (await fetch(url)).json();' }
        ];
    }

    async render() {
        this.container.innerHTML = `
            <div class="code-layout" style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; height: calc(100vh - 120px);">
                <!-- Snippet List -->
                <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h4 style="font-size: 0.8rem; text-transform: uppercase;">Snippets</h4>
                        <i class="fa-solid fa-plus-circle" id="new-snippet" style="color: var(--accent-primary); cursor: pointer;"></i>
                    </div>
                    <div id="snippet-list" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;"></div>
                </div>

                <!-- Editor Area -->
                <div class="editor-container glass-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                    <div class="editor-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-glass); background: rgba(0,0,0,0.2); display: flex; justify-content: space-between;">
                        <input type="text" id="snip-title" placeholder="Titre du snippet..." style="background: none; border: none; color: white; font-weight: 700; width: 60%; outline: none;">
                        <button id="copy-code" style="background: var(--accent-primary); border: none; color: white; padding: 0.4rem 1rem; border-radius: 0.3rem; font-size: 0.8rem; cursor: pointer;">Copier</button>
                    </div>
                    <textarea id="code-editor" spellcheck="false" style="flex-grow: 1; width: 100%; background: #020617; color: #94a3b8; border: none; padding: 1.5rem; font-family: 'Fira Code', 'Courier New', monospace; font-size: 1rem; outline: none; line-height: 1.6; resize: none;"></textarea>
                </div>
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const list = document.getElementById('snippet-list');
        const editor = document.getElementById('code-editor');
        const titleInput = document.getElementById('snip-title');
        const newBtn = document.getElementById('new-snippet');
        const copyBtn = document.getElementById('copy-code');

        const renderList = () => {
            list.innerHTML = '';
            this.snippets.forEach(s => {
                const item = document.createElement('div');
                item.style = 'padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.4rem; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;';
                item.innerHTML = `<p style="font-size: 0.85rem; font-weight: 600;">${s.name}</p>`;
                item.onclick = () => {
                    titleInput.value = s.name;
                    editor.value = s.code;
                    document.querySelectorAll('.snippet-active').forEach(e => e.classList.remove('snippet-active'));
                    item.classList.add('snippet-active');
                    item.style.borderColor = 'var(--accent-primary)';
                };
                list.appendChild(item);
            });
        };

        newBtn.onclick = () => {
            const name = prompt('Nom du snippet :', 'New Snippet');
            if (name) {
                this.snippets.push({ id: Date.now(), name, code: '// Écrivez votre code ici...' });
                renderList();
            }
        };

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(editor.value);
            copyBtn.innerText = 'Copié !';
            setTimeout(() => copyBtn.innerText = 'Copier', 2000);
        };

        renderList();
        if (this.snippets.length > 0) list.children[0].onclick();
    }

    destroy() {}
}
