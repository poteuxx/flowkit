/**
 * Module: PDF Editor & Suite
 * Functional recreation of Foxit concepts
 */

export default class PdfModule {
    constructor(container) {
        this.container = container;
        this.pdfFiles = [];
        this.libUrl = 'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js';
        this.viewerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    }

    async render() {
        this.container.innerHTML = `
            <div class="pdf-container" style="max-width: 1000px; margin: 0 auto;">
                <div class="glass-card" style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <h2>Suite PDF</h2>
                            <p style="color: var(--text-secondary);">Fusionnez, visualisez et gérez vos documents PDF.</p>
                        </div>
                        <button id="add-pdf" style="background: var(--accent-primary); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            <i class="fa-solid fa-plus"></i> Ajouter PDF
                        </button>
                    </div>

                    <div id="pdf-list" style="display: flex; flex-direction: column; gap: 1rem;">
                        <!-- PDF files list -->
                        <div id="pdf-placeholder" style="text-align: center; padding: 3rem; border: 2px dashed var(--border-glass); border-radius: 1rem; color: var(--text-secondary);">
                            Aucun PDF sélectionné.
                        </div>
                    </div>

                    <div id="pdf-actions" style="margin-top: 2rem; display: none; justify-content: center; gap: 1rem;">
                        <button id="merge-pdf" style="background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; border: none; padding: 0.8rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer;">
                            <i class="fa-solid fa-layer-group"></i> Fusionner Tout
                        </button>
                    </div>
                </div>

                <div id="pdf-preview-container" class="glass-card" style="display: none; height: 600px; overflow-y: auto; background: #333; padding: 2rem;">
                    <!-- PDF rendering canvas will appear here -->
                </div>

                <input type="file" id="pdf-loader" style="display: none;" accept="application/pdf" multiple>
            </div>
        `;

        this.setupHandlers();
        await this.loadDependencies();
    }

    async loadDependencies() {
        if (window.PDFLib) return;
        
        const script = document.createElement('script');
        script.src = this.libUrl;
        document.head.appendChild(script);
        
        const viewerScript = document.createElement('script');
        viewerScript.src = this.viewerUrl;
        document.head.appendChild(viewerScript);
        
        await new Promise(r => script.onload = r);
    }

    setupHandlers() {
        const loader = document.getElementById('pdf-loader');
        const addBtn = document.getElementById('add-pdf');
        addBtn.onclick = () => loader.click();

        loader.onchange = (e) => {
            Array.from(e.target.files).forEach(file => {
                this.pdfFiles.push({
                    file,
                    id: Date.now() + Math.random(),
                    name: file.name
                });
            });
            this.updateUI();
        };

        const mergeBtn = document.getElementById('merge-pdf');
        mergeBtn.onclick = () => this.mergePDFs();
    }

    updateUI() {
        const list = document.getElementById('pdf-list');
        const placeholder = document.getElementById('pdf-placeholder');
        const actions = document.getElementById('pdf-actions');

        if (this.pdfFiles.length > 0) {
            placeholder.style.display = 'none';
            actions.style.display = 'flex';
            list.innerHTML = '';
            
            this.pdfFiles.forEach((pdf, index) => {
                const item = document.createElement('div');
                item.className = 'glass-card';
                item.style = 'display: flex; align-items: center; justify-content: space-between; padding: 1rem;';
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="background: rgba(239, 68, 68, 0.1); width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i>
                        </div>
                        <span style="font-weight: 500;">${pdf.name}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="view-btn" data-id="${pdf.id}" style="background: var(--bg-secondary); border: 1px solid var(--border-glass); color: white; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer;">Voir</button>
                        <button class="remove-btn" data-id="${pdf.id}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer;">X</button>
                    </div>
                `;

                item.querySelector('.view-btn').onclick = () => this.previewPDF(pdf);
                item.querySelector('.remove-btn').onclick = () => {
                    this.pdfFiles = this.pdfFiles.filter(p => p.id !== pdf.id);
                    this.updateUI();
                };

                list.appendChild(item);
            });
        }
    }

    async previewPDF(pdf) {
        const preview = document.getElementById('pdf-preview-container');
        preview.style.display = 'block';
        preview.innerHTML = '<p style="text-align:center;">Chargement du lecteur...</p>';

        const arrayBuffer = await pdf.file.arrayBuffer();
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdfDoc = await loadingTask.promise;
        
        preview.innerHTML = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.style = 'display: block; margin: 0 auto 2rem; box-shadow: 0 0 20px rgba(0,0,0,0.5);';
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            preview.appendChild(canvas);
        }
        
        preview.scrollIntoView({ behavior: 'smooth' });
    }

    async mergePDFs() {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const pdfItem of this.pdfFiles) {
            const donorPdfBytes = await pdfItem.file.arrayBuffer();
            const donorPdf = await PDFDocument.load(donorPdfBytes);
            const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flowkit_merged.pdf';
        a.click();
    }

    destroy() {}
}
