/**
 * CaoApp.ts - Application de visualisation CAO pour observer le cerf-volant
 *
 * Scene 3D simple et épurée pour examiner la géométrie du Kite.ts
 * Interface minimaliste axée sur la visualisation et l'inspection
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Kite } from './objects/Kite';

export class CaoApp {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private kite!: Kite;

    // Interface de contrôle
    private controlPanel!: HTMLElement;

    constructor(container?: HTMLElement) {
        const targetContainer = container || document.getElementById('app');
        if (!targetContainer) {
            throw new Error('Container non trouvé pour CaoApp');
        }

        console.log('🔧 Démarrage CaoApp - Visualisation CAO');
        this.init(targetContainer);
        this.setupControls();
        this.createControlPanel();
        this.animate();

        // Supprimer l'overlay de chargement
        const loadingEl = targetContainer.querySelector('.loading, #div_loading, #loading');
        if (loadingEl && loadingEl.parentElement) {
            loadingEl.parentElement.removeChild(loadingEl);
        }
    }

    private init(container: HTMLElement): void {
        // Scene avec fond neutre pour CAO
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0); // Gris clair CAO

        // Pas de brouillard pour une vision claire
        this.scene.fog = null;

        // Caméra perspective optimisée pour l'inspection
        this.camera = new THREE.PerspectiveCamera(
            60, // FOV plus large pour une meilleure vue d'ensemble
            window.innerWidth / window.innerHeight,
            0.01, // Near plane très proche pour les détails
            100   // Far plane réduit
        );

        // Position de la caméra optimisée pour voir le kite
        this.camera.position.set(2, 1, 3);

        // Renderer haute qualité
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Ombres pour la profondeur
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);

        // Configuration de l'éclairage CAO
        this.setupCaoLighting();

        // Grille de référence
        this.setupGrid();

        // Cerf-volant au centre
        this.setupKite();

        // Contrôles orbite
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 0.3, 0); // Centré sur le kite
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 10;

        // Redimensionnement
        window.addEventListener('resize', () => this.onResize());
    }

    /**
     * Éclairage professionnel style CAO
     */
    private setupCaoLighting(): void {
        // Lumière ambiante douce
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Lumière principale (key light)
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.camera.left = -5;
        keyLight.shadow.camera.right = 5;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.mapSize.setScalar(2048);
        this.scene.add(keyLight);

        // Lumière de remplissage (fill light)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-3, 5, 3);
        this.scene.add(fillLight);

        // Lumière de contour (rim light)
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, 3, -5);
        this.scene.add(rimLight);
    }

    /**
     * Grille de référence professionnelle
     */
    private setupGrid(): void {
        // Grille principale
        const gridHelper = new THREE.GridHelper(4, 20, 0x888888, 0xcccccc);
        gridHelper.position.y = -0.01; // Légèrement en-dessous du plan Y=0
        this.scene.add(gridHelper);

        // Axes de coordonnées
        const axesHelper = new THREE.AxesHelper(1);
        this.scene.add(axesHelper);

        // Plan de travail invisible pour les ombres
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    /**
     * Configuration du cerf-volant
     */
    private setupKite(): void {
        this.kite = new Kite({
            showPoints: true,
            showFrame: true,
            showSails: true,
            showLabels: true,  // Activer les labels par défaut en mode CAO
            sailColor: 0xff3333,
            frameColor: 0x2a2a2a,
            pointSize: 0.02,
            aerodynamic: true
        });

        // Position centrale
        this.kite.set_position(new THREE.Vector3(0, 0.5, 0));

        // Déclencher le cycle de vie comme objet racine
        this.kite.initialize_root();

        // Ajouter à la scène
        this.scene.add(this.kite.get_group());

        console.log('🪁 Cerf-volant ajouté à la scène CAO');
    }

    /**
     * Panneau de contrôle pour l'inspection
     */
    private createControlPanel(): void {
        this.controlPanel = document.createElement('div');
        this.controlPanel.id = 'cao-controls';
        this.controlPanel.innerHTML = `
            <div class="cao-panel">
                <h3>🔧 Contrôles CAO</h3>

                <div class="control-section">
                    <h4>Affichage</h4>
                    <label>
                        <input type="checkbox" id="show-points" checked> Points
                    </label>
                    <label>
                        <input type="checkbox" id="show-frame" checked> Structure
                    </label>
                    <label>
                        <input type="checkbox" id="show-sails" checked> Voiles
                    </label>
                    <label>
                        <input type="checkbox" id="show-labels" checked> Labels
                    </label>
                </div>

                <div class="control-section">
                    <h4>Animation</h4>
                    <button id="start-pulse">Gonflement</button>
                    <button id="stop-pulse">Arrêter</button>
                    <button id="rotate-kite">Rotation auto</button>
                </div>

                <div class="control-section">
                    <h4>Vue</h4>
                    <button id="view-front">Face</button>
                    <button id="view-side">Profil</button>
                    <button id="view-top">Dessus</button>
                    <button id="view-iso">Isométrique</button>
                </div>

                <div class="control-section">
                    <h4>Mode</h4>
                    <button id="switch-to-simulation" class="mode-switch">🪁 Simulation</button>
                </div>

                <div class="control-section">
                    <h4>Informations</h4>
                    <div id="kite-info">
                        Surface: ${this.kite.getTotalArea().toFixed(2)}m²<br>
                        Points: ${this.kite.getPoints().size}<br>
                        Composants: ${this.getComponentCount()}
                    </div>
                </div>
            </div>
        `;

        // Ajouter styles CSS pour les boutons
        const style = document.createElement('style');
        style.textContent = `
            .cao-panel button {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                border: none;
                border-radius: 6px;
                color: white;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                margin: 2px;
            }
            .cao-panel button:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .mode-switch {
                background: linear-gradient(135deg, #5cb85c 0%, #449d44 100%) !important;
                box-shadow: 0 2px 8px rgba(92, 184, 92, 0.3) !important;
                width: 100% !important;
                font-size: 12px !important;
                padding: 10px 12px !important;
            }
        `;
        document.head.appendChild(style);

        // Styles CSS inline pour le panneau
        Object.assign(this.controlPanel.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            zIndex: '1000',
            minWidth: '200px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        });

        document.body.appendChild(this.controlPanel);

        // Événements
        this.setupControlEvents();
    }

    /**
     * Événements des contrôles
     */
    private setupControlEvents(): void {
        // Affichage
        document.getElementById('show-points')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.kite.setShowPoints(target.checked);
        });

        document.getElementById('show-frame')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.kite.setShowFrame(target.checked);
        });

        document.getElementById('show-sails')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.kite.setShowSails(target.checked);
        });

        document.getElementById('show-labels')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.kite.setShowLabels(target.checked);
        });

        // Animation
        document.getElementById('start-pulse')?.addEventListener('click', () => {
            this.kite.startPulsing(0.2, 2);
        });

        document.getElementById('stop-pulse')?.addEventListener('click', () => {
            this.kite.stopPulsing();
        });

        let autoRotate = false;
        document.getElementById('rotate-kite')?.addEventListener('click', (e) => {
            autoRotate = !autoRotate;
            this.controls.autoRotate = autoRotate;
            (e.target as HTMLButtonElement).textContent = autoRotate ? 'Arrêter rotation' : 'Rotation auto';
        });

        // Vues prédéfinies
        document.getElementById('view-front')?.addEventListener('click', () => {
            this.setCameraView(0, 0.5, 3);
        });

        document.getElementById('view-side')?.addEventListener('click', () => {
            this.setCameraView(3, 0.5, 0);
        });

        document.getElementById('view-top')?.addEventListener('click', () => {
            this.setCameraView(0, 3, 0);
        });

        document.getElementById('view-iso')?.addEventListener('click', () => {
            this.setCameraView(2, 1.5, 2);
        });

        // Bouton de switch vers Simulation
        document.getElementById('switch-to-simulation')?.addEventListener('click', () => {
            this.switchToMode('simulation');
        });
    }

    /**
     * Positionne la caméra selon une vue prédéfinie
     */
    private setCameraView(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
        this.controls.target.set(0, 0.3, 0);
        this.controls.update();
    }

    /**
     * Compte les composants du kite
     */
    private getComponentCount(): number {
        const debugInfo = this.kite.get_debug_info() as any;
        return (debugInfo.pointCount || 0) + (debugInfo.frameCount || 0) + (debugInfo.sailCount || 0);
    }

    /**
     * Configuration des contrôles de la caméra
     */
    private setupControls(): void {
        // Les contrôles sont configurés dans init()
        // Ajout d'aides clavier
        window.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.controls.reset();
                    break;
                case 'KeyF':
                    this.setCameraView(0, 0.5, 3); // Vue de face
                    break;
                case 'KeyS':
                    this.setCameraView(3, 0.5, 0); // Vue de côté
                    break;
                case 'KeyT':
                    this.setCameraView(0, 3, 0); // Vue du dessus
                    break;
                case 'KeyI':
                    this.setCameraView(2, 1.5, 2); // Vue isométrique
                    break;
            }
        });
    }

    private onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate = (): void => {
        requestAnimationFrame(this.animate);

        // Mise à jour des contrôles
        this.controls.update();

        // Mise à jour des labels du kite avec la position de la caméra pour l'adaptation
        if (this.kite) {
            this.kite.updateLabels(this.camera.position);
        }

        // Rendu de la scène
        this.renderer.render(this.scene, this.camera);
    };

    /**
     * Méthodes publiques pour contrôle externe
     */
    public getKite(): Kite {
        return this.kite;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    /**
     * Bascule vers un autre mode (simulation ou cao)
     */
    private switchToMode(mode: 'simulation' | 'cao'): void {
        // Construire la nouvelle URL
        const currentUrl = new URL(window.location.href);

        if (mode === 'simulation') {
            // Supprimer le paramètre mode pour revenir au mode par défaut
            currentUrl.searchParams.delete('mode');
        } else {
            // Ajouter le paramètre mode=cao
            currentUrl.searchParams.set('mode', mode);
        }

        // Rediriger vers la nouvelle URL
        window.location.href = currentUrl.toString();
    }

    public dispose(): void {
        // Nettoyage des ressources
        this.kite.queue_free();
        this.renderer.dispose();
        if (this.controlPanel && this.controlPanel.parentElement) {
            this.controlPanel.parentElement.removeChild(this.controlPanel);
        }
    }
}