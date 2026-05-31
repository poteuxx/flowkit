/**
 * Module: Ultra-Converter (FFmpeg Edition)
 * High-performance media transcoding directly in-browser
 */

export default class ConvertModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.files = [];
        this.ffmpeg = null;
        this.ffmpegUrl = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
        
        this.formatMap = {
            'image': ['PNG', 'JPG', 'WEBP', 'ICO', 'BMP', 'GIF', 'TIFF'],
            'video': ['MP4', 'WEBM', 'GIF', 'AVI', 'MOV'],
            'audio': ['MP3', 'WAV', 'OGG', 'M4A', 'FLAC']
        };
    }

    async render() {
        this.container.innerHTML = `
            <div class="convert-workspace" style="max-width: 1000px; margin: 0 auto; animation: fadeIn 0.5s;">
                <div class="glass-card" id="drop-zone" style="border: 2px dashed var(--accent-primary); padding: 4rem; text-align: center; cursor: pointer; background: rgba(6, 182, 212, 0.05); transition: all 0.3s;">
                    <i class="fa-solid fa-bolt-lightning" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 2rem; filter: drop-shadow(0 0 10px var(--accent-glow));"></i>
                    <h2>Convertisseur Ultra-Engine</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Prise en charge native de la vidéo, de l'audio et des images.</p>
                    <input type="file" id="file-input" multiple style="display: none;">
                </div>

                <div id="file-queue" style="margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem;"></div>

                <div id="actions" style="margin-top: 2rem; display: none; justify-content: flex-end;">
                    <button id="start-btn" class="poteuxx-mega-btn">DÉMARRER LA CONVERSION</button>
                </div>
            </div>

            <style>
                .poteuxx-mega-btn {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    color: white; border: none; padding: 1rem 3rem; border-radius: 2rem; 
                    font-weight: 800; letter-spacing: 2px; cursor: pointer; transition: all 0.3s;
                }
                .poteuxx-mega-btn:hover { box-shadow: 0 0 30px var(--accent-glow); transform: scale(1.05); }
            </style>
        `;

        this.setupHandlers();
        await this.initFFmpeg();
    }

    async initFFmpeg() {
        if (window.FFmpeg) return;
        const script = document.createElement('script');
        script.src = this.ffmpegUrl;
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
        
        const { createFFmpeg } = window.FFmpeg;
        this.ffmpeg = createFFmpeg({ log: true });
        await this.ffmpeg.load();
        console.log('FFmpeg Engine Online');
    }

    setupHandlers() {
        const zone = document.getElementById('drop-zone');
        const input = document.getElementById('file-input');
        
        zone.onclick = () => input.click();
        input.onchange = (e) => this.handleFiles(Array.from(e.target.files));

        document.getElementById('start-btn').onclick = () => this.runProcess();
    }

    handleFiles(files) {
        files.forEach(f => {
            const type = f.type.split('/')[0];
            const targets = this.formatMap[type] || ['PDF'];
            this.files.push({ file: f, id: Math.random(), target: targets[0], targets, status: 'ready' });
        });
        this.updateUI();
    }

    updateUI() {
        const queue = document.getElementById('file-queue');
        queue.innerHTML = '';
        this.files.forEach(item => {
            const row = document.createElement('div');
            row.className = 'glass-card';
            row.style = 'display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem;';
            row.innerHTML = `
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                    <i class="fa-solid fa-file" style="color: var(--accent-primary);"></i>
                    <div>
                        <p style="font-weight: 700; font-size: 0.9rem;">${item.file.name}</p>
                        <p style="font-size: 0.7rem; color: var(--text-secondary);">${(item.file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 0.7rem; opacity: 0.5;">VERS</span>
                    <select class="poteuxx-select" style="background: var(--bg-secondary); color: white; border: 1px solid var(--border-glass); padding: 0.3rem;">
                        ${item.targets.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                    <div id="badge-${item.id}" style="font-size: 0.7rem; font-weight: 900; color: var(--accent-primary); width: 80px; text-align: right;">${item.status.toUpperCase()}</div>
                </div>
            `;
            queue.appendChild(row);
        });
        document.getElementById('actions').style.display = this.files.length ? 'flex' : 'none';
    }

    async runProcess() {
        for (const item of this.files) {
            if (item.status === 'done') continue;
            const badge = document.getElementById(`badge-${item.id}`);
            badge.innerText = 'CONVERSION...';

            try {
                const result = await this.convert(item);
                this.download(result, `poteuxx_export.${item.target.toLowerCase()}`);
                item.status = 'done';
                badge.innerText = 'TERMINÉ';
            } catch (e) {
                console.error(e);
                badge.innerText = 'ERREUR';
                badge.style.color = '#ef4444';
            }
        }
    }

    async convert(item) {
        const { fetchFile } = window.FFmpeg;
        const name = item.file.name;
        const output = `output.${item.target.toLowerCase()}`;
        
        this.ffmpeg.FS('writeFile', name, await fetchFile(item.file));
        await this.ffmpeg.run('-i', name, output);
        const data = this.ffmpeg.FS('readFile', output);
        
        return new Blob([data.buffer], { type: `video/${item.target.toLowerCase()}` });
    }

    download(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
    }

    destroy() {}
}
