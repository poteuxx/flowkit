/**
 * Module: Cloud-style Video Editor
 * Functional recreation of Flixier concepts
 */

export default class VideoEditorModule {
    constructor(container) {
        this.container = container;
        this.video = null;
        this.recorder = null;
        this.chunks = [];
        this.overlayText = '';
    }

    async render() {
        this.container.innerHTML = `
            <div class="video-editor-layout" style="display: grid; grid-template-rows: 1fr 200px; gap: 1rem; height: calc(100vh - 120px);">
                <!-- Preview Area -->
                <div class="preview-workspace glass-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; position: relative;">
                    <video id="main-video" style="max-width: 100%; max-height: 80%; pointer-events: none;"></video>
                    <div id="text-overlay" style="position: absolute; top: 10%; left: 10%; color: white; font-size: 2rem; font-weight: 800; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); cursor: move;">
                        ${this.overlayText}
                    </div>
                    
                    <div class="preview-controls" style="margin-top: 1rem; display: flex; gap: 1rem;">
                        <button id="play-pause" style="background: var(--bg-secondary); border: 1px solid var(--border-glass); color: white; padding: 0.5rem 1rem; border-radius: 2rem;"><i class="fa-solid fa-play"></i></button>
                    </div>
                </div>

                <!-- Timeline / Timeline Area -->
                <div class="timeline-workspace glass-card" style="display: flex; gap: 1.5rem;">
                    <div class="assets-pane" style="width: 200px; border-right: 1px solid var(--border-glass); padding-right: 1.5rem;">
                        <button id="load-video" style="width: 100%; background: var(--accent-primary); border: none; color: white; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                            <i class="fa-solid fa-file-video"></i> Charger Vidéo
                        </button>
                        <input type="text" id="overlay-input" placeholder="Ajouter du texte..." style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); padding: 0.5rem; color: white; border-radius: 0.3rem;">
                    </div>

                    <div class="timeline-pane" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                        <div id="timeline-track" style="height: 60px; background: rgba(255,255,255,0.05); border-radius: 0.5rem; position: relative; border: 1px solid var(--border-glass); overflow: hidden;">
                            <div id="playhead" style="position: absolute; top:0; left:0; width: 2px; height: 100%; background: var(--accent-primary); z-index: 10;"></div>
                            <div id="video-strip" style="height: 100%; background: var(--accent-secondary); opacity: 0.3; width: 0;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                            <span id="current-time">0:00</span>
                            <button id="export-video" style="background: #10b981; border: none; color: white; padding: 0.4rem 1rem; border-radius: 0.3rem; cursor: pointer; font-weight: 600;">Exporter MP4</button>
                            <span id="total-time">0:00</span>
                        </div>
                    </div>
                </div>

                <input type="file" id="video-loader" style="display: none;" accept="video/*">
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const loader = document.getElementById('video-loader');
        const loadBtn = document.getElementById('load-video');
        const video = document.getElementById('main-video');
        const playBtn = document.getElementById('play-pause');
        const overlayInput = document.getElementById('overlay-input');
        const overlay = document.getElementById('text-overlay');

        loadBtn.onclick = () => loader.click();
        loader.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                video.src = URL.createObjectURL(file);
                video.load();
            }
        };

        video.onloadedmetadata = () => {
            document.getElementById('total-time').innerText = this.formatTime(video.duration);
            document.getElementById('video-strip').style.width = '100%';
        };

        video.ontimeupdate = () => {
            const percent = (video.currentTime / video.duration) * 100;
            document.getElementById('playhead').style.left = `${percent}%`;
            document.getElementById('current-time').innerText = this.formatTime(video.currentTime);
        };

        playBtn.onclick = () => {
            if (video.paused) {
                video.play();
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                video.pause();
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        };

        overlayInput.oninput = (e) => {
            overlay.innerText = e.target.value;
        };

        document.getElementById('export-video').onclick = () => this.exportVideo();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async exportVideo() {
        const video = document.getElementById('main-video');
        const overlay = document.getElementById('text-overlay');
        const exportBtn = document.getElementById('export-video');
        
        exportBtn.innerText = 'Exportation...';
        exportBtn.disabled = true;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30);
        this.recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        this.chunks = [];

        this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
        this.recorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flowkit_video.webm';
            a.click();
            exportBtn.innerText = 'Exporter MP4';
            exportBtn.disabled = false;
        };

        video.currentTime = 0;
        video.play();
        this.recorder.start();

        const drawFrame = () => {
            if (video.paused || video.ended) {
                this.recorder.stop();
                return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = `${canvas.height / 10}px Inter`;
            ctx.fillText(overlay.innerText, canvas.width * 0.1, canvas.height * 0.2);
            requestAnimationFrame(drawFrame);
        };

        drawFrame();
    }

    destroy() {}
}
