/**
 * Module: Ultra-Converter V4 — Robust Edition
 * ✅ Images: Canvas API (always works, no COI needed)
 * ✅ Video/Audio: FFmpeg.wasm (works after COI service worker reload)
 * ✅ Graceful fallback + clear status messages
 */

export default class ConvertModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.files = [];
        this.ffmpeg = null;

        // All logical format mappings by detected type
        this.formatMap = {
            'image': ['PNG', 'JPG', 'WEBP', 'BMP', 'GIF', 'ICO'],
            'video': ['MP4', 'WEBM', 'GIF', 'AVI', 'MOV'],
            'audio': ['MP3', 'WAV', 'OGG', 'FLAC', 'M4A'],
            'application/pdf': ['PNG', 'JPG'],
            'text': ['HTML', 'TXT'],
        };
    }

    async render() {
        this.container.innerHTML = `
            <div style="max-width: 960px; margin: 0 auto; animation: fadeIn 0.5s ease;">

                <!-- Drop Zone -->
                <div id="drop-zone" class="glass-card" style="
                    border: 2px dashed var(--accent-primary);
                    padding: 5rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    background: rgba(34,211,238,0.03);
                    transition: background 0.3s, border-color 0.3s;
                ">
                    <div style="
                        width: 80px; height: 80px; border-radius: 50%;
                        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                        display: flex; align-items: center; justify-content: center;
                        margin: 0 auto 2rem; box-shadow: 0 0 40px var(--accent-glow);
                    ">
                        <i class="fa-solid fa-bolt-lightning" style="font-size: 2rem; color: white;"></i>
                    </div>
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Convertisseur Automatique</h2>
                    <p style="color: var(--text-secondary);">
                        Glissez n'importe quel fichier ici. Le type sera détecté automatiquement.
                    </p>
                    <p id="coi-status" style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);"></p>
                    <input type="file" id="file-input" multiple style="display:none;">
                </div>

                <!-- File Queue -->
                <div id="file-queue" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;"></div>

                <!-- Action -->
                <div id="convert-actions" style="margin-top: 2rem; display: none; justify-content: flex-end;">
                    <button id="start-btn" style="
                        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                        color: white; border: none; padding: 1rem 2.5rem; border-radius: 2rem;
                        font-weight: 800; letter-spacing: 2px; font-size: 0.9rem; cursor: pointer;
                        box-shadow: 0 0 20px var(--accent-glow); transition: all 0.3s;
                    ">⚡ LANCER LA CONVERSION</button>
                </div>
            </div>

            <style>
                #drop-zone:hover { background: rgba(34,211,238,0.07); border-color: var(--accent-secondary); }
                .file-row { display: flex; align-items: center; gap: 1.25rem; padding: 1.1rem 1.5rem; }
                .fmt-select { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-glass); border-radius: 0.4rem; padding: 0.4rem 0.8rem; font-weight: 700; outline: none; }
                .status-pill { font-size: 0.72rem; font-weight: 900; padding: 0.3rem 0.75rem; border-radius: 2rem; letter-spacing: 1px; }
            </style>
        `;

        this.setupDrop();
        this.detectCOI();
        this.tryLoadFFmpeg();
    }

    detectCOI() {
        const el = document.getElementById('coi-status');
        if (typeof SharedArrayBuffer !== 'undefined') {
            el.innerHTML = '✅ Mode haute performance actif (vidéo & audio disponibles)';
            el.style.color = '#22d3ee';
        } else {
            el.innerHTML = '⚡ Mode image actif. Pour vidéo/audio, rechargez la page une fois après la première installation du Service Worker.';
            el.style.color = '#f59e0b';
        }
    }

    async tryLoadFFmpeg() {
        if (typeof SharedArrayBuffer === 'undefined') return; // COI not ready yet

        try {
            if (!window.FFmpeg) {
                const s = document.createElement('script');
                s.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
                document.head.appendChild(s);
                await new Promise((res, rej) => { s.onload = res; s.onerror = rej; });
            }
            const { createFFmpeg } = window.FFmpeg;
            this.ffmpeg = createFFmpeg({ log: false });
            await this.ffmpeg.load();
            console.log('[Flowkit] FFmpeg Engine ONLINE');
        } catch (e) {
            console.warn('[Flowkit] FFmpeg failed to load:', e.message);
            this.ffmpeg = null;
        }
    }

    setupDrop() {
        const zone = document.getElementById('drop-zone');
        const input = document.getElementById('file-input');

        zone.onclick = () => input.click();
        input.onchange = (e) => this.addFiles(Array.from(e.target.files));

        zone.ondragover = (e) => { e.preventDefault(); zone.style.background = 'rgba(34,211,238,0.07)'; };
        zone.ondragleave = () => { zone.style.background = 'rgba(34,211,238,0.03)'; };
        zone.ondrop = (e) => {
            e.preventDefault();
            zone.style.background = 'rgba(34,211,238,0.03)';
            this.addFiles(Array.from(e.dataTransfer.files));
        };

        document.getElementById('start-btn').onclick = () => this.runAll();
    }

    addFiles(newFiles) {
        newFiles.forEach(file => {
            const typeKey = this.detectType(file);
            const targets = this.formatMap[typeKey] || ['TXT'];
            this.files.push({
                file,
                id: Math.random().toString(36).slice(2),
                typeKey,
                target: targets[0],
                targets,
                status: 'ready'
            });
        });
        this.renderQueue();
        document.getElementById('convert-actions').style.display = this.files.length ? 'flex' : 'none';
    }

    detectType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type === 'application/pdf') return 'application/pdf';
        if (file.type.startsWith('text/')) return 'text';
        return 'other';
    }

    renderQueue() {
        const queue = document.getElementById('file-queue');
        queue.innerHTML = '';

        this.files.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.padding = '0';

            card.innerHTML = `
                <div class="file-row">
                    <i class="${this.getIcon(item.typeKey)}" style="font-size: 1.5rem; color: var(--accent-primary); width: 24px; text-align: center;"></i>
                    <div style="flex-grow: 1; overflow: hidden;">
                        <p style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.file.name}</p>
                        <p style="font-size: 0.72rem; color: var(--text-secondary);">${item.file.type || '?'} · ${(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary);">VERS</span>
                    <select class="fmt-select" data-id="${item.id}">
                        ${item.targets.map(t => `<option value="${t}" ${item.target === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                    <span id="badge-${item.id}" class="status-pill" style="background: rgba(34,211,238,0.1); color: var(--accent-primary);">PRÊT</span>
                    <button data-remove="${item.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;

            card.querySelector(`.fmt-select`).onchange = (e) => { item.target = e.target.value; };
            card.querySelector(`[data-remove="${item.id}"]`).onclick = () => {
                this.files = this.files.filter(f => f.id !== item.id);
                this.renderQueue();
            };

            queue.appendChild(card);
        });
    }

    getIcon(type) {
        const map = { image: 'fa-solid fa-image', video: 'fa-solid fa-film', audio: 'fa-solid fa-music', 'application/pdf': 'fa-solid fa-file-pdf' };
        return map[type] || 'fa-solid fa-file';
    }

    setBadge(id, text, color) {
        const el = document.getElementById(`badge-${id}`);
        if (!el) return;
        el.innerText = text;
        el.style.color = color;
        el.style.background = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
    }

    async runAll() {
        for (const item of this.files) {
            if (item.status === 'done') continue;
            this.setBadge(item.id, 'EN COURS...', '#f59e0b');

            try {
                let blob;
                if (item.typeKey === 'image') {
                    blob = await this.convertImage(item.file, item.target);
                } else if ((item.typeKey === 'video' || item.typeKey === 'audio') && this.ffmpeg) {
                    blob = await this.convertMedia(item.file, item.target);
                } else if (item.typeKey === 'video' || item.typeKey === 'audio') {
                    this.setBadge(item.id, 'RELOAD REQ.', '#f59e0b');
                    alert(`Pour convertir des fichiers vidéo/audio, rechargez la page une fois pour activer le moteur haute performance.`);
                    continue;
                } else {
                    blob = item.file;
                }

                this.downloadBlob(blob, `poteuxx_convert.${item.target.toLowerCase()}`);
                item.status = 'done';
                this.setBadge(item.id, 'TERMINÉ ✓', '#22d3ee');
            } catch (err) {
                console.error(err);
                this.setBadge(item.id, 'ERREUR', '#ef4444');
            }
        }
    }

    async convertImage(file, targetFmt) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = reject;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    // White background for formats that don't support transparency
                    if (['JPG', 'BMP', 'ICO'].includes(targetFmt)) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.drawImage(img, 0, 0);
                    const mimeMap = { PNG: 'image/png', JPG: 'image/jpeg', WEBP: 'image/webp', BMP: 'image/bmp', GIF: 'image/gif', ICO: 'image/x-icon' };
                    canvas.toBlob(resolve, mimeMap[targetFmt] || 'image/png', 0.92);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async convertMedia(file, targetFmt) {
        const { fetchFile } = window.FFmpeg;
        const inName = file.name;
        const outName = `output.${targetFmt.toLowerCase()}`;
        this.ffmpeg.FS('writeFile', inName, await fetchFile(file));
        await this.ffmpeg.run('-i', inName, outName);
        const data = this.ffmpeg.FS('readFile', outName);
        return new Blob([data.buffer]);
    }

    downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    destroy() {}
}
