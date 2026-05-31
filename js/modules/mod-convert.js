/**
 * Module: Universal File Converter
 * Functional recreation of Convertio concepts
 */

export default class ConvertModule {
    constructor(container) {
        this.container = container;
        this.files = [];
        this.supportedTargets = ['PNG', 'JPG', 'WEBP', 'PDF'];
    }

    async render() {
        this.container.innerHTML = `
            <div class="convert-container" style="max-width: 900px; margin: 0 auto;">
                <div class="glass-card" id="drop-zone" style="border: 2px dashed var(--border-glass); padding: 4rem; text-align: center; cursor: pointer; transition: all 0.3s;">
                    <i class="fa-solid fa-cloud-arrow-up" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1.5rem;"></i>
                    <h2>Déposez vos fichiers ici</h2>
                    <p style="margin-top: 0.5rem; color: var(--text-secondary);">ou cliquez pour parcourir vos dossiers</p>
                    <input type="file" id="file-input" multiple style="display: none;">
                </div>

                <div id="file-list" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Uploaded files list -->
                </div>

                <div id="convert-actions" style="margin-top: 2rem; display: none; justify-content: flex-end;">
                    <button id="convert-btn" style="background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary)); color: white; border: none; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fa-solid fa-play"></i> Convertir tout
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        dropZone.onclick = () => fileInput.click();
        
        fileInput.onchange = (e) => {
            this.handleFiles(Array.from(e.target.files));
        };

        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent-primary)'; };
        dropZone.ondragleave = () => { dropZone.style.borderColor = 'var(--border-glass)'; };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-glass)';
            this.handleFiles(Array.from(e.dataTransfer.files));
        };

        const convertBtn = document.getElementById('convert-btn');
        convertBtn.onclick = () => this.startConversion();
    }

    handleFiles(newFiles) {
        newFiles.forEach(file => {
            this.files.push({
                file,
                id: Math.random().toString(36).substr(2, 9),
                targetFormat: 'PNG',
                status: 'pending',
                progress: 0
            });
        });

        this.updateFileList();
        document.getElementById('convert-actions').style.display = this.files.length > 0 ? 'flex' : 'none';
    }

    updateFileList() {
        const list = document.getElementById('file-list');
        list.innerHTML = '';

        this.files.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style = 'display: flex; align-items: center; gap: 1.5rem; padding: 1rem;';
            
            card.innerHTML = `
                <div style="background: rgba(255,255,255,0.05); width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-file-code" style="color: var(--text-secondary);"></i>
                </div>
                <div style="flex-grow: 1;">
                    <p style="font-weight: 600; font-size: 0.9rem;">${item.file.name}</p>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">${(item.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Vers :</span>
                    <select class="format-select" data-id="${item.id}" style="background: rgba(0,0,0,0.2); color: white; border: 1px solid var(--border-glass); border-radius: 0.25rem; padding: 0.25rem;">
                        ${this.supportedTargets.map(f => `<option value="${f}" ${item.targetFormat === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                <div id="status-${item.id}" style="font-size: 0.8rem; font-weight: 600; min-width: 80px; text-align: right;">
                    ${item.status === 'pending' ? 'Prêt' : 'Converti'}
                </div>
                <i class="fa-solid fa-xmark remove-btn" data-id="${item.id}" style="color: #ef4444; cursor: pointer; padding: 0.5rem;"></i>
            `;

            card.querySelector('.format-select').onchange = (e) => {
                item.targetFormat = e.target.value;
            };

            card.querySelector('.remove-btn').onclick = () => {
                this.files = this.files.filter(f => f.id !== item.id);
                this.updateFileList();
            };

            list.appendChild(card);
        });
    }

    async startConversion() {
        for (let item of this.files) {
            if (item.status === 'done') continue;
            
            const statusLabel = document.getElementById(`status-${item.id}`);
            statusLabel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            try {
                // Image Conversion Logic (Canvas)
                if (item.file.type.startsWith('image/')) {
                    const result = await this.convertImage(item.file, item.targetFormat);
                    this.downloadBlob(result, `flowkit_${item.file.name.split('.')[0]}.${item.targetFormat.toLowerCase()}`);
                }
                
                item.status = 'done';
                statusLabel.innerText = 'Terminé';
                statusLabel.style.color = 'var(--accent-primary)';
            } catch (err) {
                statusLabel.innerText = 'Erreur';
                statusLabel.style.color = '#ef4444';
            }
        }
    }

    convertImage(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    const type = `image/${targetFormat.toLowerCase()}`;
                    canvas.toBlob((blob) => resolve(blob), type, 0.95);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    destroy() {}
}
