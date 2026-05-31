/**
 * Module: Professional Image Editor
 * Functional recreation of Photopea concepts
 */

export default class ImageEditorModule {
    constructor(container) {
        this.container = container;
        this.layers = [];
        this.activeLayerIndex = -1;
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            blur: 0,
            grayscale: 0
        };
    }

    async render() {
        this.container.innerHTML = `
            <div class="editor-layout" style="display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; height: calc(100vh - 120px);">
                <!-- Canvas Workspace -->
                <div class="workspace glass-card" style="display: flex; flex-direction: column; overflow: hidden; position: relative;">
                    <div class="toolbar" style="padding: 0.75rem; border-bottom: 1px solid var(--border-glass); display: flex; gap: 1rem;">
                        <button id="add-layer" title="Ajouter une image" style="background: var(--bg-secondary); border: 1px solid var(--border-glass); color: white; padding: 0.5rem 1rem; border-radius: 0.4rem; cursor: pointer;">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                        <button id="export-image" title="Exporter" style="background: var(--accent-primary); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.4rem; cursor: pointer;">
                            <i class="fa-solid fa-download"></i> Exporter
                        </button>
                    </div>
                    
                    <div id="canvas-container" style="flex-grow: 1; background: #000; position: relative; overflow: auto; display: flex; align-items: center; justify-content: center; background-image: conic-gradient(#1e293b 25%, #0f172a 0 50%, #1e293b 0 75%, #0f172a 0); background-size: 20px 20px;">
                        <!-- Canvas layers will be inserted here -->
                    </div>

                    <input type="file" id="image-loader" style="display: none;" accept="image/*">
                </div>

                <!-- Control Panel -->
                <div class="controls flex flex-col gap-4">
                    <div class="glass-card layers-panel" style="height: 40%;">
                        <h4 style="margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Calques</h4>
                        <div id="layer-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <!-- Layer items -->
                        </div>
                    </div>

                    <div class="glass-card filters-panel" style="flex-grow: 1;">
                        <h4 style="margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Ajustements</h4>
                        <div class="filter-controls" style="display: flex; flex-direction: column; gap: 1rem;">
                            ${Object.keys(this.filters).map(f => `
                                <div>
                                    <label style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                                        ${f.charAt(0).toUpperCase() + f.slice(1)}
                                        <span id="val-${f}">${this.filters[f]}</span>
                                    </label>
                                    <input type="range" class="filter-range" data-filter="${f}" min="${f === 'blur' ? 0 : 0}" max="${f === 'blur' ? 20 : 200}" value="${this.filters[f]}" style="width: 100%;">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupHandlers();
    }

    setupHandlers() {
        const loader = document.getElementById('image-loader');
        const addBtn = document.getElementById('add-layer');
        addBtn.onclick = () => loader.click();

        loader.onchange = (e) => {
            const file = e.target.files[0];
            if (file) this.addLayer(file);
        };

        const exportBtn = document.getElementById('export-image');
        exportBtn.onclick = () => this.export();

        const ranges = document.querySelectorAll('.filter-range');
        ranges.forEach(r => {
            r.oninput = (e) => {
                const filter = e.target.dataset.filter;
                this.filters[filter] = e.target.value;
                document.getElementById(`val-${filter}`).innerText = e.target.value;
                this.applyFilters();
            };
        });
    }

    async addLayer(file) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const layer = {
            id: Date.now(),
            name: file.name,
            canvas,
            img,
            visible: true
        };

        this.layers.push(layer);
        this.activeLayerIndex = this.layers.length - 1;
        this.updateLayerUI();
        this.refreshWorkspace();
    }

    updateLayerUI() {
        const list = document.getElementById('layer-list');
        list.innerHTML = '';
        
        [...this.layers].reverse().forEach((layer, idx) => {
            const actualIdx = this.layers.length - 1 - idx;
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.style = `
                display: flex; align-items: center; gap: 0.75rem; 
                padding: 0.5rem; border-radius: 0.4rem; background: ${actualIdx === this.activeLayerIndex ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)'};
                cursor: pointer; border: 1px solid ${actualIdx === this.activeLayerIndex ? 'var(--accent-primary)' : 'transparent'};
            `;

            item.innerHTML = `
                <i class="fa-solid ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}" style="color: var(--text-secondary);"></i>
                <span style="font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1;">${layer.name}</span>
            `;

            item.onclick = () => {
                this.activeLayerIndex = actualIdx;
                this.updateLayerUI();
            };

            const eye = item.querySelector('.fa-solid');
            eye.onclick = (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                this.updateLayerUI();
                this.refreshWorkspace();
            };

            list.appendChild(item);
        });
    }

    refreshWorkspace() {
        const container = document.getElementById('canvas-container');
        container.innerHTML = '';
        
        // Find max dimensions
        let maxWidth = 0, maxHeight = 0;
        this.layers.forEach(l => {
            if (l.canvas.width > maxWidth) maxWidth = l.canvas.width;
            if (l.canvas.height > maxHeight) maxHeight = l.canvas.height;
        });

        // Add a master display canvas
        const display = document.createElement('canvas');
        display.width = maxWidth;
        display.height = maxHeight;
        display.style = 'max-width: 100%; max-height: 100%; box-shadow: 0 0 40px rgba(0,0,0,0.5);';
        const ctx = display.getContext('2d');

        this.layers.forEach(l => {
            if (l.visible) {
                ctx.drawImage(l.canvas, 0, 0);
            }
        });

        container.appendChild(display);
        this.displayCanvas = display;
        this.applyFilters();
    }

    applyFilters() {
        if (!this.displayCanvas) return;
        const s = this.filters;
        this.displayCanvas.style.filter = `
            brightness(${s.brightness}%) 
            contrast(${s.contrast}%) 
            saturate(${s.saturate}%) 
            blur(${s.blur}px) 
            grayscale(${s.grayscale}%)
        `;
    }

    export() {
        if (!this.displayCanvas) return;
        const link = document.createElement('a');
        link.download = 'flowkit_export.png';
        
        // Create a temporary canvas to burn the filters in
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.displayCanvas.width;
        exportCanvas.height = this.displayCanvas.height;
        const ctx = exportCanvas.getContext('2d');
        ctx.filter = this.displayCanvas.style.filter;
        ctx.drawImage(this.displayCanvas, 0, 0);
        
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    }

    destroy() {}
}
