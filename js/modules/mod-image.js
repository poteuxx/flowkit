/**
 * Module: Image Studio (High-Performance Interaction Edition)
 * Powered by Fabric.js for professional object manipulation
 */

export default class ImageEditorModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.canvas = null;
        this.fabricUrl = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    }

    async render() {
        this.container.innerHTML = `
            <div class="editor-layout" style="display: grid; grid-template-columns: 80px 1fr 300px; gap: 1rem; height: calc(100vh - 120px);">
                <!-- Toolbar -->
                <div class="glass-card flex flex-col gap-4 items-center py-4" style="background: rgba(2,6,23,0.5);">
                    <button class="tool-icon active" id="tool-select" title="Sélectionner"><i class="fa-solid fa-arrow-pointer"></i></button>
                    <button class="tool-icon" id="tool-brush" title="Pinceau"><i class="fa-solid fa-paintbrush"></i></button>
                    <button class="tool-icon" id="tool-text" title="Texte"><i class="fa-solid fa-font"></i></button>
                    <button class="tool-icon" id="tool-rect" title="Rectangle"><i class="fa-regular fa-square"></i></button>
                    <div style="flex-grow: 1;"></div>
                    <button class="tool-icon" id="tool-add-img" title="Ajouter Image"><i class="fa-solid fa-plus"></i></button>
                </div>

                <!-- Canvas Workspace -->
                <div class="workspace glass-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; position: relative;">
                    <div class="top-bar-editor" style="padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-glass); display: flex; justify-content: space-between; background: rgba(0,0,0,0.2);">
                        <div style="display:flex; gap: 1rem;">
                            <button class="poteuxx-mini-btn" id="undo-btn"><i class="fa-solid fa-rotate-left"></i></button>
                            <button class="poteuxx-mini-btn" id="redo-btn"><i class="fa-solid fa-rotate-right"></i></button>
                        </div>
                        <button id="export-pro" class="poteuxx-mini-btn" style="background: var(--accent-primary);"><i class="fa-solid fa-download"></i> Exporter HD</button>
                    </div>
                    
                    <div id="fabric-wrapper" style="flex-grow: 1; display: flex; justify-content: center; align-items: center; overflow: auto; background: #0b1120;">
                        <canvas id="main-canvas"></canvas>
                    </div>

                    <input type="file" id="img-loader" style="display: none;" accept="image/*">
                </div>

                <!-- Layers & Properties -->
                <div class="flex flex-col gap-4">
                    <div class="glass-card" style="height: 50%;">
                        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 1rem;">Propriétés Objet</h4>
                        <div id="obj-props" style="display: flex; flex-direction: column; gap: 1rem;">
                            <p style="text-align:center; color: var(--text-secondary); padding-top: 2rem;">Sélectionnez un objet pour modifier sa couleur ou son opacité.</p>
                        </div>
                    </div>
                    <div class="glass-card" style="flex-grow: 1;">
                        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 1rem;">Historique Calques</h4>
                        <div id="layer-stack" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
                    </div>
                </div>
            </div>

            <style>
                .tool-icon { background: none; border: 1px solid transparent; color: var(--text-secondary); width: 45px; height: 45px; border-radius: 0.75rem; cursor: pointer; font-size: 1.2rem; transition: all 0.2s; }
                .tool-icon:hover { color: white; background: rgba(255,255,255,0.05); }
                .tool-icon.active { background: var(--accent-primary); color: white; box-shadow: 0 0 15px var(--accent-glow); }
                .poteuxx-mini-btn { background: var(--bg-secondary); border: 1px solid var(--border-glass); color: white; padding: 0.5rem 1rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.8rem; font-weight: 700; }
            </style>
        `;

        await this.loadFabric();
        this.initCanvas();
    }

    async loadFabric() {
        if (window.fabric) return;
        const script = document.createElement('script');
        script.src = this.fabricUrl;
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    initCanvas() {
        const wrapper = document.getElementById('fabric-wrapper');
        this.canvas = new fabric.Canvas('main-canvas', {
            width: 800,
            height: 600,
            backgroundColor: '#1e293b'
        });

        this.setupInteractions();
    }

    setupInteractions() {
        const tools = {
            select: document.getElementById('tool-select'),
            brush: document.getElementById('tool-brush'),
            text: document.getElementById('tool-text'),
            rect: document.getElementById('tool-rect'),
            addImg: document.getElementById('tool-add-img')
        };

        const setActive = (btn) => {
            Object.values(tools).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };

        tools.select.onclick = () => {
            this.canvas.isDrawingMode = false;
            setActive(tools.select);
        };

        tools.brush.onclick = () => {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.color = '#06b6d4';
            this.canvas.freeDrawingBrush.width = 5;
            setActive(tools.brush);
        };

        tools.text.onclick = () => {
            const text = new fabric.IText('Double clic pour éditer', {
                left: 100, top: 100, fill: '#fff', fontFamily: 'Inter'
            });
            this.canvas.add(text);
            setActive(tools.select);
            this.canvas.isDrawingMode = false;
        };

        tools.rect.onclick = () => {
            const rect = new fabric.Rect({
                left: 100, top: 100, fill: '#06b6d4', width: 100, height: 100, rx: 10, ry: 10
            });
            this.canvas.add(rect);
            setActive(tools.select);
        };

        tools.addImg.onclick = () => document.getElementById('img-loader').click();
        document.getElementById('img-loader').onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (f) => {
                fabric.Image.fromURL(f.target.result, (img) => {
                    img.scaleToWidth(400);
                    this.canvas.add(img);
                    this.canvas.centerObject(img);
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        };

        document.getElementById('export-pro').onclick = () => {
            const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1 });
            const link = document.createElement('a');
            link.download = 'flowkit_studio_export.png';
            link.href = dataURL;
            link.click();
        };

        // Unified Object Property Editor
        this.canvas.on('selection:created', (e) => this.updateProps(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.updateProps(e.selected[0]));
        this.canvas.on('selection:cleared', () => {
            document.getElementById('obj-props').innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding-top: 2rem;">Sélectionnez un objet.</p>';
        });
    }

    updateProps(obj) {
        const props = document.getElementById('obj-props');
        props.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="font-size: 0.7rem;">COULEUR</label>
                    <input type="color" id="obj-color-input" value="${obj.fill || '#ffffff'}" style="width: 100%; border: none; height: 30px; background: none;">
                </div>
                <div>
                    <label style="font-size: 0.7rem;">OPACITÉ (${Math.round(obj.opacity * 100)}%)</label>
                    <input type="range" id="obj-opacity-input" min="0" max="1" step="0.1" value="${obj.opacity}" style="width:100%;">
                </div>
                <button id="obj-delete" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; width: 100%; padding: 0.5rem; border-radius: 0.4rem; cursor: pointer; margin-top: 1rem;">Supprimer</button>
            </div>
        `;

        document.getElementById('obj-color-input').oninput = (e) => {
            obj.set('fill', e.target.value);
            this.canvas.renderAll();
        };
        document.getElementById('obj-opacity-input').oninput = (e) => {
            obj.set('opacity', parseFloat(e.target.value));
            this.canvas.renderAll();
        };
        document.getElementById('obj-delete').onclick = () => {
            this.canvas.remove(obj);
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        };
    }

    destroy() {
        this.canvas?.dispose();
    }
}
