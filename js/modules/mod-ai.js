/**
 * Module: AI Assistant Console
 * Elite UI for AI interaction
 */

export default class AIModule {
    constructor(container) {
        this.container = container;
    }

    async render() {
        this.container.innerHTML = `
            <div class="ai-console glass-card" style="max-width: 900px; margin: 0 auto; height: 100%; display: flex; flex-direction: column; background: rgba(2,6,23,0.8);">
                <div class="console-header" style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 800; color: var(--accent-primary); letter-spacing: 2px;">POTEUXX AI CORE</span>
                    <span class="status-badge" style="background: rgba(34, 211, 238, 0.1); color: var(--accent-primary); padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem;">LISTENING</span>
                </div>
                
                <div id="ai-chat" style="flex-grow: 1; overflow-y: auto; padding-right: 1rem; display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="ai-msg" style="border-left: 2px solid var(--accent-primary); padding-left: 1rem;">
                        <p style="font-size: 0.8rem; color: var(--accent-primary); font-weight: 800; margin-bottom: 0.25rem;">SYSTEM</p>
                        <p>Assistant Poteux initialisé. Comment puis-je vous aider aujourd'hui ?</p>
                    </div>
                </div>

                <div class="ai-input-area" style="margin-top: 2rem; position: relative;">
                    <input type="text" id="ai-prompt" placeholder="Saisissez une commande..." style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 0.5rem; padding: 1.25rem 3rem 1.25rem 1.5rem; color: white; outline: none; transition: border-color 0.3s;">
                    <i class="fa-solid fa-paper-plane" id="send-ai" style="position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%); color: var(--accent-primary); cursor: pointer;"></i>
                </div>
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const input = document.getElementById('ai-prompt');
        const send = document.getElementById('send-ai');
        const chat = document.getElementById('ai-chat');

        const pushMsg = (role, text) => {
            const msg = document.createElement('div');
            msg.style = `border-left: 2px solid ${role === 'USER' ? 'var(--text-secondary)' : 'var(--accent-primary)'}; padding-left: 1rem;`;
            msg.innerHTML = `<p style="font-size: 0.8rem; color: ${role === 'USER' ? 'var(--text-secondary)' : 'var(--accent-primary)'}; font-weight: 800; margin-bottom: 0.25rem;">${role}</p><p>${text}</p>`;
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
        };

        send.onclick = () => {
            if (!input.value) return;
            pushMsg('USER', input.value);
            const q = input.value;
            input.value = '';
            
            // Simulated Intelligent Response
            setTimeout(() => {
                pushMsg('POTEUXX', `Traitement de la requête: "${q}". Je suis un assistant statique pour cette version de démonstration, mais je serai bientot connecté à mon noyau neuronal.`);
            }, 800);
        };

        input.onkeydown = (e) => { if (e.key === 'Enter') send.onclick(); };
    }

    destroy() {}
}
