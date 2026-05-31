/**
 * Flowkit Core Engine
 * Hand-crafted Vanilla SPA Architecture
 */

import { tools } from './core/registry.js';

class App {
    constructor() {
        this.currentModule = null;
        this.viewport = document.getElementById('tool-viewport');
        this.toolTitle = document.getElementById('current-tool-name');
        this.sidebarNav = document.getElementById('sidebar-nav');
        
        this.init();
    }

    init() {
        this.renderSidebar();
        this.handleRouting();
        
        // Listen for back/forward browser navigation
        window.onpopstate = () => this.handleRouting();
        
        console.log('Flowkit Initialized');
    }

    renderSidebar() {
        this.sidebarNav.innerHTML = '';
        
        // Group tools by category (placeholder groups for now)
        const categories = {
            'Texte': ['mod-symbols'],
            'Médias': ['mod-convert', 'mod-image', 'mod-video', 'mod-3d'],
            'Documents': ['mod-pdf']
        };

        Object.entries(categories).forEach(([category, toolIds]) => {
            const group = document.createElement('div');
            group.className = 'nav-group';
            group.innerHTML = `<p style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 1.5rem 0.75rem 0.5rem; letter-spacing: 0.05em;">${category}</p>`;
            
            toolIds.forEach(id => {
                const tool = tools[id];
                if (!tool) return;

                const item = document.createElement('div');
                item.className = `nav-item ${this.getCurrentToolId() === id ? 'active' : ''}`;
                item.style = `
                    display: flex; align-items: center; gap: 0.75rem; 
                    padding: 0.75rem 1rem; border-radius: 0.5rem; 
                    cursor: pointer; transition: all 0.2s ease;
                    margin-bottom: 0.25rem;
                `;
                
                item.innerHTML = `
                    <i class="${tool.icon}" style="width: 20px; text-align: center; color: ${item.className.includes('active') ? 'var(--accent-primary)' : 'var(--text-secondary)'}"></i>
                    <span style="font-size: 0.9rem; font-weight: 500; color: ${item.className.includes('active') ? 'white' : 'var(--text-secondary)'}">${tool.name}</span>
                `;

                item.onclick = () => this.navigate(id);
                group.appendChild(item);
            });

            this.sidebarNav.appendChild(group);
        });

        // Add CSS for active items dynamically
        if (!document.getElementById('nav-styles')) {
            const style = document.createElement('style');
            style.id = 'nav-styles';
            style.innerHTML = `
                .nav-item:hover { background: rgba(255,255,255,0.05); }
                .nav-item.active { background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
                .nav-item.active i { color: var(--accent-primary) !important; }
                .nav-item.active span { color: white !important; }
            `;
            document.head.appendChild(style);
        }
    }

    getCurrentToolId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('tool') || 'dashboard';
    }

    async navigate(toolId) {
        window.history.pushState({}, '', `?tool=${toolId}`);
        this.renderSidebar();
        await this.handleRouting();
    }

    async handleRouting() {
        const toolId = this.getCurrentToolId();
        
        // Clean up previous module
        if (this.currentModule && this.currentModule.destroy) {
            this.currentModule.destroy();
        }

        this.viewport.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%;"><div class="loader"></div></div>';

        if (toolId === 'dashboard') {
            this.renderDashboard();
            return;
        }

        const toolConfig = tools[toolId];
        if (toolConfig) {
            this.toolTitle.innerText = toolConfig.name;
            try {
                // Dynamically import the module
                const module = await import(`./modules/${toolId}.js`);
                this.viewport.innerHTML = '';
                this.currentModule = new module.default(this.viewport);
                await this.currentModule.render();
            } catch (err) {
                console.error('Module load failed:', err);
                this.viewport.innerHTML = `<div class="glass-card"><h2>Erreur</h2><p>Impossible de charger l'outil : ${err.message}</p></div>`;
            }
        } else {
            this.renderDashboard();
        }
    }

    renderDashboard() {
        this.toolTitle.innerText = 'System Dashboard';
        this.viewport.innerHTML = `
            <div class="dashboard-hero" style="margin-bottom: 3rem; animation: fadeIn 0.8s ease;">
                <h1 style="font-size: 3rem; margin-bottom: 0.5rem; letter-spacing: -2px;">POTEUXX <span style="color: var(--text-primary);">SYSTEM</span></h1>
                <p style="font-size: 1.1rem; max-width: 650px; color: var(--text-secondary);">Propulsez votre productivité avec Flowkit. Un écosystème centralisé de micro-apps professionnelles, optimisé par le Hub Poteuxx.</p>
            </div>
            
            <div class="tool-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${Object.entries(tools).map(([id, tool]) => `
                    <div class="glass-card tool-card" onclick="window.app.navigate('${id}')" style="cursor: pointer; transition: transform 0.2s;">
                        <i class="${tool.icon}" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 1.5rem; display: block;"></i>
                        <h3 style="margin-bottom: 0.5rem;">${tool.name}</h3>
                        <p style="font-size: 0.9rem;">${tool.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize App
window.app = new App();
