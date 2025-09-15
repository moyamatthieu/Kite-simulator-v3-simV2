
/**
 * SceneManager.ts - Gestionnaire de scène 3D optimisé
 * 
 * Responsabilité unique : Configuration et gestion de la scène Three.js
 * Architecture claire avec méthodes bien séparées
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CONFIG } from './constants';

/**
 * Gestionnaire principal de la scène 3D
 * Encapsule Three.js et fournit une API claire pour la simulation
 */
export class SceneManager {
    public readonly scene: THREE.Scene;
    public readonly camera: THREE.PerspectiveCamera;
    public readonly renderer: THREE.WebGLRenderer;
    public readonly controls: OrbitControls;
    
    private resizeHandler: () => void;
    private isDisposed = false;

    constructor(container: HTMLElement) {
        // Initialisation des composants Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: CONFIG.rendering.antialias,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Configuration
        this.init(container);
        this.setupEnvironment();
        this.setupControls();

        // Gestion du redimensionnement
        this.resizeHandler = () => this.onResize(container);
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * Initialisation des paramètres de base
     */
    private init(container: HTMLElement): void {
        // Configuration de la scène
        this.scene.background = new THREE.Color(CONFIG.rendering.backgroundColor);
        this.scene.fog = new THREE.Fog(0x87CEEB, CONFIG.rendering.fogStart, CONFIG.rendering.fogEnd);

        // Configuration de la caméra
        this.camera.position.set(3, 5, 12);
        this.camera.lookAt(0, 2, 0);

        // Configuration du renderer
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limite le pixel ratio pour les performances
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        container.appendChild(this.renderer.domElement);
    }

    /**
     * Configuration de l'environnement (lumières, sol, etc.)
     */
    private setupEnvironment(): void {
        // Éclairage ambiant
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        ambientLight.name = 'AmbientLight';
        this.scene.add(ambientLight);

        // Éclairage directionnel (soleil)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(50, 50, 50);
        sunLight.castShadow = true;
        sunLight.name = 'SunLight';
        
        // Configuration des ombres
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 200;
        sunLight.shadow.mapSize.setScalar(CONFIG.rendering.shadowMapSize);
        sunLight.shadow.bias = -0.0005;
        
        this.scene.add(sunLight);

        // Sol
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x7CFC00,
            transparent: false
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = 'Ground';
        this.scene.add(ground);

        // Grille de référence
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        gridHelper.name = 'Grid';
        (gridHelper.material as THREE.Material).transparent = true;
        (gridHelper.material as THREE.Material).opacity = 0.5;
        this.scene.add(gridHelper);
    }

    /**
     * Configuration des contrôles de caméra
     */
    private setupControls(): void {
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 3, -5);
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI * 0.9; // Empêche de passer sous le sol
        this.controls.enablePan = true;
        this.controls.panSpeed = 1.2;
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
    }

    /**
     * Gestion du redimensionnement de la fenêtre
     */
    public onResize(container?: HTMLElement): void {
        if (this.isDisposed) return;
        
        const width = container ? container.clientWidth : window.innerWidth;
        const height = container ? container.clientHeight : window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Rendu de la scène
     */
    public render(): void {
        if (this.isDisposed) return;
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Nettoyage des ressources
     */
    public dispose(): void {
        if (this.isDisposed) return;
        
        this.isDisposed = true;
        
        // Suppression du gestionnaire de redimensionnement
        window.removeEventListener('resize', this.resizeHandler);
        
        // Nettoyage des contrôles
        this.controls.dispose();
        
        // Nettoyage du renderer
        this.renderer.dispose();
        
        // Nettoyage de la scène
        this.scene.clear();
    }

    /**
     * Ajoute un objet à la scène
     */
    public add(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    /**
     * Supprime un objet de la scène
     */
    public remove(object: THREE.Object3D): void {
        this.scene.remove(object);
    }

    /**
     * Trouve un objet par son nom
     */
    public getObjectByName(name: string): THREE.Object3D | undefined {
        return this.scene.getObjectByName(name);
    }
}
