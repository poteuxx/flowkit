/**
 * Module: PDF Station (Elite Interact Edition)
 * Professional PDF management with page-level control
 */

export default class PdfModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.pdfs = [];
        this.libUrl = 'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js';
    }

    async render() {
        this.container.innerHTML = `
            <div class="pdf-workspace" style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: calc(100vh - 120px);">
                <!-- Document List & Upload -->
                <div class="glass-card flex flex-col">
                    <div style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.5rem;">PDF Station</h2>
                        <p style="color: var(--text-secondary); font-size: 0.85rem;">Gérez vos pages et fusionnez vos documents.</p>
                    </div>

                    <button id="pdf-upload-btn" class="poteuxx-btn-full" style="margin-bottom: 1.5rem;">
                        <i class="fa-solid fa-file-circle-plus"></i> Importer PDF
                    </button>

                    <div id="pdf-doc-list" style="flex-grow:1; display:flex; flex-direction:column; gap:1rem; overflow-y:auto;">
                        <!-- List of imported PDFs -->
                    </div>

                    <button id="pdf-merge-pro" class="poteuxx-mega-btn" style="margin-top: 1.5rem; width: 100%; display:none;">
                        EXPORTER TOUT (FUSION)
                    </button>
                </div>

                <!-- Page Interaction Area -->
                <div class="glass-card flex flex-col" style="background: rgba(0,0,0,0.2); overflow: hidden;">
                    <div id="page-grid" style="flex-grow: 1; overflow-y: auto; padding: 2rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem;">
                        <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 5rem;">
                            <i class="fa-solid fa-file-pdf" style="font-size: 4rem; opacity: 0.1; margin-bottom: 2rem; display: block;"></i>
                            Sélectionnez un document pour voir et manipuler ses pages.
                        </div>
                    </div>
                </div>

                <input type="file" id="pdf-file-loader" style="display:none;" accept="application/pdf" multiple>
            </div>
        `;

        this.setupHandlers();
        await this.loadLib();
    }

    async loadLib() {
        if (window.PDFLib) return;
        const script = document.createElement('script');
        script.src = this.libUrl;
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    setupHandlers() {
        const loader = document.getElementById('pdf-file-loader');
        const uploadBtn = document.getElementById('pdf-upload-btn');
        
        uploadBtn.onclick = () => loader.click();
        loader.onchange = (e) => this.handleUpload(Array.from(e.target.files));

        document.getElementById('pdf-merge-pro').onclick = () => this.mergeAll();
    }

    async handleUpload(files) {
        const { PDFDocument } = window.PDFLib;
        
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(bytes);
            this.pdfs.push({ id: Date.now() + Math.random(), name: file.name, doc, bytes });
        }
        
        this.updateDocList();
        document.getElementById('pdf-merge-pro').style.display = 'block';
    }

    updateDocList() {
        const list = document.getElementById('pdf-doc-list');
        list.innerHTML = '';
        
        this.pdfs.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style = 'padding: 1rem; cursor: pointer; transition: all 0.2s; border-color: rgba(255,255,255,0.05);';
            card.innerHTML = `
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                    <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; opacity: 0.5;"></i>
                </div>
            `;
            card.onclick = () => this.inspectDoc(item);
            list.appendChild(card);
        });
    }

    async inspectDoc(item) {
        const grid = document.getElementById('page-grid');
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Génération des miniatures...</p>';
        
        const pages = item.doc.getPages();
        grid.innerHTML = '';

        pages.forEach((page, idx) => {
            const pageCard = document.createElement('div');
            pageCard.className = 'glass-card page-item';
            pageCard.style = 'padding: 1rem; position: relative; background: #fff; color: #333; height: 240px; display: flex; flex-direction: column;';
            
            pageCard.innerHTML = `
                <div style="flex-grow: 1; display:flex; align-items:center; justify-content:center; font-weight: 900; font-size: 3rem; color: #ddd;">${idx + 1}</div>
                <div class="page-controls" style="display: flex; justify-content: center; gap: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                    <button class="page-btn" onclick="item.doc.getPages()[${idx}].setRotation(item.doc.getPages()[${idx}].getRotation() + 90)"><i class="fa-solid fa-rotate-right"></i></button>
                    <button class="page-btn" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            grid.appendChild(pageCard);
        });
    }

    async mergeAll() {
        const { PDFDocument } = window.PDFLib;
        const resultDoc = await PDFDocument.create();
        
        for (const item of this.pdfs) {
            const copiedPages = await resultDoc.copyPages(item.doc, item.doc.getPageIndices());
            copiedPages.forEach(p => resultDoc.addPage(p));
        }

        const bytes = await resultDoc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poteuxx_integrated_doc.pdf';
        a.click();
    }

    destroy() {}
}
