/**
 * Flowkit Elite Shell Update
 * Futuristic Navigation, Command Palette, and Global File Buffer
 */

import { tools } from './core/registry.js';

class App {
    constructor() {
        this.currentModule = null;
        this.viewport = document.getElementById('tool-viewport');
        this.toolTitle = document.getElementById('current-tool-name');
        this.sidebarNav = document.getElementById('sidebar-nav');
        this.fileBuffer = []; // Global clipboard for files
        this.stats = { processed: 0, time: 0 };
        
        this.init();
    }

    init() {
        this.renderSidebar();
        this.handleRouting();
        this.setupEliteFeatures();
        this.setupShellInteractions();
        
        window.onpopstate = () => this.handleRouting();
    }

    setupShellInteractions() {
        // 1. Logo Navigation
        document.getElementById('main-logo').onclick = () => this.navigate('dashboard');

        // 2. Sidebar Search
        const searchInput = document.getElementById('tool-search');
        const searchIcon = document.getElementById('search-icon-btn');
        
        const performSearch = () => {
            const query = searchInput.value.toLowerCase();
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                const text = link.innerText.toLowerCase();
                link.style.display = text.includes(query) ? 'flex' : 'none';
            });
        };
        
        searchInput.oninput = performSearch;
        searchIcon.onclick = () => searchInput.focus();

        // 3. Theme Toggle
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.onclick = () => {
            const isLight = document.body.getAttribute('data-theme') === 'light';
            document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
            themeBtn.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        };

        // 4. User Profile & Memory
        const profileBtn = document.getElementById('user-profile-btn');
        const nameDisp = document.getElementById('user-display-name');
        const avatarDisp = document.getElementById('user-avatar');

        // Initial Load
        const savedName = localStorage.getItem('poteuxx_user_name') || 'Utilisateur';
        const savedAvatar = localStorage.getItem('poteuxx_user_avatar');
        nameDisp.innerText = savedName;
        if (savedAvatar) avatarDisp.style.backgroundImage = `url(${savedAvatar})`;

        profileBtn.onclick = () => {
            const newName = prompt('Votre nom :', nameDisp.innerText);
            if (newName) {
                localStorage.setItem('poteuxx_user_name', newName);
                nameDisp.innerText = newName;
            }
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => {
                const reader = new FileReader();
                reader.onload = (f) => {
                    localStorage.setItem('poteuxx_user_avatar', f.target.result);
                    avatarDisp.style.backgroundImage = `url(${f.target.result})`;
                };
                reader.readAsDataURL(e.target.files[0]);
            };
            if (confirm('Voulez-vous changer votre image de profil ?')) fileInput.click();
        };

        // 5. Notifications
        document.getElementById('notif-bell').onclick = () => {
            alert('Poteuxx System: Aucune nouvelle notification.');
            document.getElementById('notif-badge').style.display = 'none';
        };
    }

    setupEliteFeatures() {
        // 1. Command Palette (Ctrl + K)
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            }
        });

        // 2. Animated Background
        this.createInteractiveBackground();

        // 3. Status Tracker
        setInterval(() => this.stats.time++, 1000);
    }

    createInteractiveBackground() {
        const bg = document.createElement('div');
        bg.id = 'poteuxx-bg';
        bg.style = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: -2; background: #020617; overflow: hidden;
        `;
        
        for (let i = 0; i < 20; i++) {
            const circle = document.createElement('div');
            const size = Math.random() * 400 + 200;
            circle.style = `
                position: absolute; width: ${size}px; height: ${size}px;
                background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
                top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
                filter: blur(60px); opacity: 0.15; animation: float ${Math.random() * 10 + 10}s infinite alternate;
            `;
            bg.appendChild(circle);
        }

        if (!document.getElementById('float-anim')) {
            const style = document.createElement('style');
            style.id = 'float-anim';
            style.innerHTML = `
                @keyframes float { 
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .loader-overlay { position: fixed; inset: 0; background: var(--bg-primary); z-index: 1000; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s; }
            `;
            document.head.appendChild(style);
        }

        document.body.prepend(bg);
    }

    toggleCommandPalette() {
        let palette = document.getElementById('cmd-palette');
        if (palette) {
            palette.remove();
            return;
        }

        palette = document.createElement('div');
        palette.id = 'cmd-palette';
        palette.style = `
            position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
            width: 500px; background: var(--bg-secondary); border: 1px solid var(--accent-primary);
            border-radius: 1rem; box-shadow: 0 20px 40px rgba(0,0,0,0.8); z-index: 2000;
            padding: 1rem; animation: fadeIn 0.2s ease;
        `;
        palette.innerHTML = `
            <input type="text" id="cmd-input" placeholder="Chercher un outil ou une action..." style="width: 100%; background: none; border: none; color: white; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem; outline: none; font-size: 1.1rem;">
            <div id="cmd-results" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;"></div>
        `;
        document.body.appendChild(palette);
        
        const input = document.getElementById('cmd-input');
        input.focus();
        
        const search = () => {
            const q = input.value.toLowerCase();
            const results = document.getElementById('cmd-results');
            results.innerHTML = '';
            
            Object.entries(tools).filter(([id, t]) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).forEach(([id, t]) => {
                const item = document.createElement('div');
                item.style = 'padding: 0.75rem; cursor: pointer; border-radius: 0.5rem; display: flex; align-items: center; gap: 1rem; transition: background 0.2s;';
                item.innerHTML = `<i class="${t.icon}" style="color: var(--accent-primary)"></i> <span>${t.name}</span>`;
                item.onclick = () => { this.navigate(id); palette.remove(); };
                item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.05)';
                item.onmouseout = () => item.style.background = 'none';
                results.appendChild(item);
            });
        };

        input.oninput = search;
        search();

        palette.onclick = (e) => e.stopPropagation();
        window.onclick = () => palette.remove();
    }

    async navigate(toolId) {
        window.history.pushState({}, '', `?tool=${toolId}`);
        this.renderSidebar();
        await this.handleRouting();
    }

    async handleRouting() {
        const toolId = this.getCurrentToolId();
        
        // Branded Loader
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `<div style="text-align: center;"><h2 style="letter-spacing: 5px; color: var(--accent-primary); margin-bottom: 1rem;">POTEUXX</h2><div class="progress-bar" style="width: 200px; height: 2px; background: rgba(255,255,255,0.1);"><div style="height: 100%; background: var(--accent-primary); width: 0; animation: prog 0.5s forwards;"></div></div></div>`;
        document.body.appendChild(loader);

        if (this.currentModule && this.currentModule.destroy) this.currentModule.destroy();

        if (toolId === 'dashboard') {
            this.renderDashboard();
        } else {
            const toolConfig = tools[toolId];
            if (toolConfig) {
                this.toolTitle.innerText = toolConfig.name;
                try {
                    const module = await import(`./modules/${toolId}.js`);
                    this.viewport.innerHTML = '';
                    this.currentModule = new module.default(this.viewport, this); // Pass app context
                    await this.currentModule.render();
                } catch (err) {
                    this.viewport.innerHTML = `<div class="glass-card"><h2>Erreur</h2><p>${err.message}</p></div>`;
                }
            }
        }

        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }, 600);
    }

    renderDashboard() {
        this.toolTitle.innerText = 'System Dashboard';
        this.viewport.innerHTML = `
            <div class="dashboard-hero" style="margin-bottom: 3rem; animation: fadeIn 0.8s ease;">
                <h1 style="font-size: 3.5rem; margin-bottom: 0.5rem; letter-spacing: -3px;">POTEUXX <span style="color: var(--text-primary);">SYSTEM</span></h1>
                <p style="font-size: 1.1rem; max-width: 650px; color: var(--text-secondary);">Elite centralized ecosystem for professional web services. Optimized for performance and privacy.</p>
            </div>

            <div class="stats-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem;">
                <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--accent-primary);">
                    <p style="font-size: 0.7rem; text-transform: uppercase;">Temps Session</p>
                    <h2 id="stat-time">${Math.floor(this.stats.time / 60)}m ${this.stats.time % 60}s</h2>
                </div>
                <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--accent-secondary);">
                    <p style="font-size: 0.7rem; text-transform: uppercase;">Fichiers Buffer</p>
                    <h2>${this.fileBuffer.length}</h2>
                </div>
                <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid #10b981;">
                    <p style="font-size: 0.7rem; text-transform: uppercase;">Status Système</p>
                    <h2>ONLINE</h2>
                </div>
            </div>
            
            <div class="tool-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${Object.entries(tools).map(([id, tool]) => `
                    <div class="glass-card tool-card" onclick="window.app.navigate('${id}')" style="cursor: pointer; transition: all 0.3s;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <i class="${tool.icon}" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 1.5rem;"></i>
                            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem; color: var(--text-secondary);"></i>
                        </div>
                        <h3 style="margin-bottom: 0.5rem;">${tool.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">${tool.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCurrentToolId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('tool') || 'dashboard';
    }

    renderSidebar() {
        const currentToolId = this.getCurrentToolId();
        const nav = document.getElementById('sidebar-nav');
        nav.innerHTML = '';

        // Add System Home Link
        const homeLink = document.createElement('div');
        homeLink.className = `nav-link ${currentToolId === 'dashboard' ? 'active' : ''}`;
        homeLink.innerHTML = `<i class="fa-solid fa-house"></i> <span>Dashboard</span>`;
        homeLink.onclick = () => this.navigate('dashboard');
        nav.appendChild(homeLink);

        // Group by Category
        const cats = {};
        Object.entries(tools).forEach(([id, t]) => {
            if (!cats[t.category]) cats[t.category] = [];
            cats[t.category].push({ id, ...t });
        });

        Object.entries(cats).forEach(([cat, items]) => {
            const catHeader = document.createElement('div');
            catHeader.style = 'font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-secondary); padding: 1.5rem 1.5rem 0.5rem; font-weight: 800;';
            catHeader.innerText = cat;
            nav.appendChild(catHeader);

            items.forEach(item => {
                const link = document.createElement('div');
                link.className = `nav-link ${currentToolId === item.id ? 'active' : ''}`;
                link.innerHTML = `<i class="${item.icon}"></i> <span>${item.name}</span>`;
                link.onclick = () => this.navigate(item.id);
                nav.appendChild(link);
            });
        });
    }
}

window.app = new App();
