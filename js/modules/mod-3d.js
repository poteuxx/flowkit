/**
 * Module: 3D Engine (Pro Interact Edition)
 * Orbit controls and cinematic cinematic lighting
 */

export default class ThreeDModule {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.isDragging = false;
        this.prevMouse = { x: 0, y: 0 };
    }

    async render() {
        this.container.innerHTML = `
            <div class="3d-layout" style="display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; height: calc(100vh - 120px);">
                <!-- 3D Viewport -->
                <div class="glass-card" style="padding: 0; overflow: hidden; position: relative; background: #000;">
                    <div id="canvas-3d-holder" style="width: 100%; height: 100%;"></div>
                    <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; pointer-events: none;">
                        <p style="font-size: 0.7rem; color: var(--accent-primary); font-weight: 800; letter-spacing: 2px;">INTERACTIONS: CLIC + DRAG (ROTER) / SCROLL (ZOOM)</p>
                    </div>
                </div>

                <!-- Scene Controller -->
                <div class="glass-card flex flex-col gap-6">
                    <div>
                        <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 1rem;">Géométrie Elite</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <button class="poteuxx-mini-btn" id="add-cube-pro">CUBE</button>
                            <button class="poteuxx-mini-btn" id="add-sphere-pro">SPHÈRE</button>
                            <button class="poteuxx-mini-btn" id="add-torus-pro">TORUS</button>
                            <button class="poteuxx-mini-btn" id="add-cone-pro">CÔNE</button>
                        </div>
                    </div>

                    <div>
                        <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 1rem;">Éclairage Cinématique</h4>
                        <select id="light-preset" class="poteuxx-select" style="width: 100%;">
                            <option value="studio">STUDIO PRO</option>
                            <option value="cyber">CYBERPUNK NEON</option>
                            <option value="sunset">SUNSET GOLD</option>
                        </select>
                    </div>

                    <div style="flex-grow: 1;"></div>
                    <button id="render-capture" class="poteuxx-mega-btn" style="width: 100%;">CAPTURER RENDU HD</button>
                </div>
            </div>
        `;

        await this.loadThree();
        this.initScene();
    }

    async loadThree() {
        if (window.THREE) return;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.152.2/three.min.js';
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    initScene() {
        const holder = document.getElementById('canvas-3d-holder');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, holder.clientWidth / holder.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setSize(holder.clientWidth, holder.clientHeight);
        holder.appendChild(this.renderer.domElement);

        this.applyLighting('studio');
        this.addShape('cube');

        this.camera.position.set(3, 3, 5);
        this.camera.lookAt(0, 0, 0);

        this.setupOrbit();
        this.animate();
        this.setupHandlers();
    }

    setupOrbit() {
        const el = this.renderer.domElement;
        el.onmousedown = (e) => { this.isDragging = true; this.prevMouse = { x: e.clientX, y: e.clientY }; };
        window.onmouseup = () => { this.isDragging = false; };
        window.onmousemove = (e) => {
            if (!this.isDragging || !this.mesh) return;
            const delta = { x: e.clientX - this.prevMouse.x, y: e.clientY - this.prevMouse.y };
            this.mesh.rotation.y += delta.x * 0.01;
            this.mesh.rotation.x += delta.y * 0.01;
            this.prevMouse = { x: e.clientX, y: e.clientY };
        };
        el.onwheel = (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.01;
        };
    }

    setupHandlers() {
        document.getElementById('add-cube-pro').onclick = () => this.addShape('cube');
        document.getElementById('add-sphere-pro').onclick = () => this.addShape('sphere');
        document.getElementById('add-torus-pro').onclick = () => this.addShape('torus');
        document.getElementById('add-cone-pro').onclick = () => this.addShape('cone');
        document.getElementById('light-preset').onchange = (e) => this.applyLighting(e.target.value);
        document.getElementById('render-capture').onclick = () => this.capture();
    }

    addShape(type) {
        if (this.mesh) this.scene.remove(this.mesh);
        let geo;
        if (type === 'cube') geo = new THREE.BoxGeometry(2, 2, 2);
        else if (type === 'sphere') geo = new THREE.SphereGeometry(1.5, 32, 32);
        else if (type === 'torus') geo = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
        else geo = new THREE.ConeGeometry(1.5, 3, 32);

        const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.8 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.mesh);
    }

    applyLighting(preset) {
        // Clear lights
        this.scene.children = this.scene.children.filter(c => !(c instanceof THREE.Light));
        
        if (preset === 'studio') {
            const l1 = new THREE.DirectionalLight(0xffffff, 1); l1.position.set(5,5,5); this.scene.add(l1);
            this.scene.add(new THREE.AmbientLight(0x404040));
        } else if (preset === 'cyber') {
            const l1 = new THREE.PointLight(0x22d3ee, 5); l1.position.set(2,2,2); this.scene.add(l1);
            const l2 = new THREE.PointLight(0xf43fb0, 5); l2.position.set(-2,-2,2); this.scene.add(l2);
        } else {
            const l1 = new THREE.DirectionalLight(0xfbbf24, 2); l1.position.set(10,5,2); this.scene.add(l1);
            this.scene.add(new THREE.AmbientLight(0xfef3c7, 0.5));
        }
    }

    capture() {
        const link = document.createElement('a');
        link.download = 'poteuxx_3d_render.png';
        link.href = this.renderer.domElement.toDataURL();
        link.click();
    }

    animate() {
        if (!this.renderer) return;
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    destroy() { this.renderer?.dispose(); this.renderer = null; }
}
