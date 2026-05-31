/**
 * Module: 3D Animation & Intro Maker
 * Functional recreation of Panzoid concepts
 */

export default class ThreeDModule {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.threeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.152.2/three.min.js';
    }

    async render() {
        this.container.innerHTML = `
            <div class="three-layout" style="display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; height: calc(100vh - 120px);">
                <!-- 3D Canvas -->
                <div id="three-viewport" class="glass-card" style="padding: 0; overflow: hidden; position: relative;">
                    <div style="position: absolute; top: 1rem; left: 1rem; z-index: 10; display: flex; gap: 0.5rem;">
                        <button id="add-cube" class="tool-btn"><i class="fa-solid fa-cube"></i> Cube</button>
                        <button id="add-sphere" class="tool-btn"><i class="fa-solid fa-circle"></i> Sphère</button>
                        <button id="capture-3d" class="tool-btn" style="background: var(--accent-secondary);"><i class="fa-solid fa-camera"></i> Capture</button>
                    </div>
                </div>

                <!-- Properties Panel -->
                <div class="controls flex flex-col gap-4">
                    <div class="glass-card" style="flex-grow: 1;">
                        <h4 style="margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Propriétés</h4>
                        <div id="prop-controls" style="display: flex; flex-direction: column; gap: 1rem;">
                            <p style="color: var(--text-secondary); text-align: center; padding-top: 2rem;">Sélectionnez un objet</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .tool-btn { background: var(--bg-glass); backdrop-filter: blur(8px); border: 1px solid var(--border-glass); color: white; padding: 0.5rem 1rem; border-radius: 0.4rem; cursor: pointer; transition: all 0.2s; }
                .tool-btn:hover { background: var(--accent-primary); border-color: var(--accent-primary); }
            </style>
        `;

        await this.loadThree();
        this.initThree();
    }

    async loadThree() {
        if (window.THREE) return;
        const script = document.createElement('script');
        script.src = this.threeUrl;
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    initThree() {
        const viewport = document.getElementById('three-viewport');
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 0);
        viewport.appendChild(this.renderer.domElement);

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x06b6d4, 0x1e293b);
        this.scene.add(gridHelper);

        this.camera.position.z = 5;
        this.camera.position.y = 2;
        this.camera.lookAt(0,0,0);

        this.setupHandlers();
        this.animate();
    }

    setupHandlers() {
        document.getElementById('add-cube').onclick = () => this.addShape('cube');
        document.getElementById('add-sphere').onclick = () => this.addShape('sphere');
        document.getElementById('capture-3d').onclick = () => this.capture();
        
        window.addEventListener('resize', () => {
            const viewport = document.getElementById('three-viewport');
            if (!viewport) return;
            this.camera.aspect = viewport.clientWidth / viewport.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        });
    }

    addShape(type) {
        let geometry;
        if (type === 'cube') geometry = new THREE.BoxGeometry(1, 1, 1);
        else geometry = new THREE.SphereGeometry(0.7, 32, 32);

        const material = new THREE.MeshPhongMaterial({ color: 0x06b6d4, shininess: 100 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;

        this.scene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
    }

    selectObject(mesh) {
        const props = document.getElementById('prop-controls');
        props.innerHTML = `
            <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Couleur</label>
                <input type="color" id="shape-color" value="#06b6d4" style="width: 100%; background: none; border: none; height: 40px; cursor: pointer;">
            </div>
            <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Rotation X</label>
                <input type="range" id="rot-x" min="0" max="6.28" step="0.1" style="width: 100%;">
            </div>
            <div>
                <label style="font-size: 0.8rem; color: var(--text-secondary);">Position Y</label>
                <input type="range" id="pos-y" min="-2" max="5" step="0.1" value="0.5" style="width: 100%;">
            </div>
            <button id="delete-shape" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; width: 100%; padding: 0.5rem; border-radius: 0.3rem; cursor: pointer; margin-top: 2rem;">Supprimer</button>
        `;

        document.getElementById('shape-color').oninput = (e) => mesh.material.color.set(e.target.value);
        document.getElementById('rot-x').oninput = (e) => mesh.rotation.x = e.target.value;
        document.getElementById('pos-y').oninput = (e) => mesh.position.y = e.target.value;
        document.getElementById('delete-shape').onclick = () => {
            this.scene.remove(mesh);
            this.objects = this.objects.filter(o => o !== mesh);
            props.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding-top: 2rem;">Sélectionnez un objet</p>';
        };
    }

    animate() {
        if (!this.renderer) return;
        requestAnimationFrame(() => this.animate());
        
        // Auto-rotate objects slightly for life
        this.objects.forEach(o => {
            o.rotation.y += 0.01;
        });

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.renderer?.dispose();
        this.renderer = null;
    }
}
