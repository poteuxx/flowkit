/**
 * Module: Video Lab (Elite Pro Edition)
 * Timeline scrubbing and multi-clip asset management
 */

export default class VideoEditorModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.assets = [];
        this.currentVideo = null;
    }

    async render() {
        this.container.innerHTML = `
            <div class="video-layout" style="display: grid; grid-template-rows: 1fr 220px; gap: 1rem; height: calc(100vh - 120px);">
                <!-- Preview & Assets -->
                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem;">
                    <div class="glass-card flex flex-col">
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; margin-bottom: 1.5rem;">Bibliothèque</h4>
                        <button id="add-video-asset" class="poteuxx-mini-btn" style="margin-bottom: 1rem; width: 100%;">+ IMPORTER CLIP</button>
                        <div id="asset-list" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;"></div>
                    </div>
                    
                    <div class="glass-card" style="background: #000; position: relative; display: flex; items-center; justify-center;">
                        <video id="vid-preview" style="max-width: 100%; max-height: 100%;"></video>
                        <div id="video-overlay-txt" style="position: absolute; bottom: 20%; left: 0; width: 100%; text-align: center; color: white; font-size: 2rem; font-weight: 900; text-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="glass-card flex flex-col" style="padding: 1.5rem;">
                    <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div style="display:flex; gap: 1rem; align-items: center;">
                            <button class="poteuxx-mini-btn" id="vid-play"><i class="fa-solid fa-play"></i></button>
                            <span id="vid-timer" style="font-family: monospace; font-size: 0.9rem; color: var(--accent-primary);">00:00.00</span>
                        </div>
                        <button id="vid-export" class="poteuxx-mega-btn" style="padding: 0.5rem 1.5rem;">EXPORTER MP4 (CAPTURE)</button>
                    </div>

                    <div id="timeline-scroll" style="flex-grow: 1; background: rgba(0,0,0,0.3); border-radius: 0.5rem; position: relative; overflow: hidden; cursor: crosshair;">
                        <div id="scrubber" style="position: absolute; top:0; left:0; width: 3px; height: 100%; background: var(--accent-primary); z-index: 10; box-shadow: 0 0 10px var(--accent-glow);"></div>
                        <div id="tracks" style="height: 100%; display: flex; align-items: center; padding: 0 1rem;">
                            <!-- Clips appear here -->
                        </div>
                    </div>
                </div>

                <input type="file" id="vid-loader" style="display:none;" accept="video/*" multiple>
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const loader = document.getElementById('vid-loader');
        const upload = document.getElementById('add-video-asset');
        const video = document.getElementById('vid-preview');
        const playBtn = document.getElementById('vid-play');
        const scroll = document.getElementById('timeline-scroll');

        upload.onclick = () => loader.click();
        loader.onchange = (e) => this.handleUpload(Array.from(e.target.files));

        playBtn.onclick = () => {
            if (video.paused) { video.play(); playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
            else { video.pause(); playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
        };

        video.ontimeupdate = () => {
            const pct = (video.currentTime / video.duration) * 100;
            document.getElementById('scrubber').style.left = `${pct}%`;
            document.getElementById('vid-timer').innerText = this.formatTime(video.currentTime);
        };

        scroll.onclick = (e) => {
            const rect = scroll.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            video.currentTime = pct * video.duration;
        };
    }

    handleUpload(files) {
        const list = document.getElementById('asset-list');
        files.forEach(file => {
            const url = URL.createObjectURL(file);
            const item = document.createElement('div');
            item.className = 'glass-card';
            item.style = 'padding: 0.75rem; cursor: pointer; transition: all 0.2s;';
            item.innerHTML = `<span style="font-size: 0.75rem; font-weight: 700;">${file.name}</span>`;
            item.onclick = () => {
                const vid = document.getElementById('vid-preview');
                vid.src = url;
                vid.load();
                this.updateTimeline(file);
            };
            list.appendChild(item);
        });
    }

    updateTimeline(file) {
        const tracks = document.getElementById('tracks');
        tracks.innerHTML = `
            <div style="height: 60px; background: var(--accent-secondary); opacity: 0.4; width: 100%; border-radius: 0.25rem; border: 1px solid var(--accent-primary); position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 0.7rem; font-weight: 800;">CLIP: ${file.name}</span>
            </div>
        `;
    }

    formatTime(t) {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 100);
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(2,'0')}`;
    }

    destroy() {}
}
