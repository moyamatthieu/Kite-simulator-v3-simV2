/**
 * render.ts - Gestionnaire de rendu 3D optimisé avec Three.js
 * 
 * Architecture moderne avec gestion des performances, cache de shaders,
 * pipeline de rendu intelligent et système de qualité adaptatif
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Configuration du rendu
 */
interface RenderConfig {
    camera: {
        fov: number;
        near: number;
        far: number;
        initialPosition: THREE.Vector3;
        lookAtTarget: THREE.Vector3;
    };
    scene: {
        backgroundColor: number;
        fogColor: number;
        fogNear: number;
        fogFar: number;
    };
    lighting: {
        hemisphereLight: {
            skyColor: number;
            groundColor: number;
            intensity: number;
        };
        directionalLight: {
            color: number;
            intensity: number;
            position: THREE.Vector3;
        };
        ambientLight: {
            color: number;
            intensity: number;
        };
    };
    shadows: {
        enabled: boolean;
        type: THREE.ShadowMapType;
        mapSize: number;
        bias: number;
    };
    quality: {
        antialias: boolean;
        pixelRatio: number;
        powerPreference: 'default' | 'high-performance' | 'low-power';
        adaptiveQuality: boolean;
    };
    controls: {
        target: THREE.Vector3;
        enableDamping: boolean;
        dampingFactor: number;
        enableZoom: boolean;
        minDistance: number;
        maxDistance: number;
    };
}

/**
 * Métriques de performance
 */
interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    triangles: number;
    geometries: number;
    textures: number;
    programs: number;
}

/**
 * Gestionnaire de rendu avec pipeline optimisé
 */
export class RenderManager {
    public readonly scene: THREE.Scene;
    public readonly camera: THREE.PerspectiveCamera;
    public readonly renderer: THREE.WebGLRenderer;
    public readonly controls: OrbitControls;
    
    private readonly config: RenderConfig;
    private readonly container: HTMLElement;
    
    // État et performance
    private isDisposed = false;
    private frameCount = 0;
    private lastTime = 0;
    private currentFPS = 0;
    private performanceMetrics: PerformanceMetrics;
    
    // Cache et optimisations
    private readonly shaderCache = new Map<string, THREE.ShaderMaterial>();
    private readonly textureCache = new Map<string, THREE.Texture>();
    private defaultGroundGroup: THREE.Group | null = null;
    
    // Observateurs et gestionnaires
    private resizeObserver: ResizeObserver | null = null;
    private animationFrameId: number | null = null;
    
    // Lumières avec gestion intelligente
    private hemisphereLight!: THREE.HemisphereLight;
    private directionalLight!: THREE.DirectionalLight;
    private ambientLight!: THREE.AmbientLight;

    constructor(container: HTMLElement, userConfig?: Partial<RenderConfig>) {
        this.container = container;
        this.config = this.createConfig(userConfig);
        this.performanceMetrics = this.createInitialMetrics();
        
        // Initialisation ordonnée
        this.scene = this.createScene();
        this.camera = this.createCamera();
        this.renderer = this.createRenderer();
        this.controls = this.createControls();
        
        // Configuration avancée
        this.setupLighting();
        this.setupResizeHandling();
        this.setupPostProcessing();
    }

    /**
     * Crée la configuration avec les valeurs par défaut
     */
    private createConfig(userConfig?: Partial<RenderConfig>): RenderConfig {
        const defaultConfig: RenderConfig = {
            camera: {
                fov: 60,
                near: 0.1,
                far: 1000,
                initialPosition: new THREE.Vector3(0, 5, 15),
                lookAtTarget: new THREE.Vector3(0, 3, -5)
            },
            scene: {
                backgroundColor: 0x222222,
                fogColor: 0x87ceeb,
                fogNear: 30,
                fogFar: 120
            },
            lighting: {
                hemisphereLight: {
                    skyColor: 0xe7f3ff,
                    groundColor: 0x335533,
                    intensity: 0.9
                },
                directionalLight: {
                    color: 0xffffff,
                    intensity: 0.9,
                    position: new THREE.Vector3(12, 18, 10)
                },
                ambientLight: {
                    color: 0xffffff,
                    intensity: 0.25
                }
            },
            shadows: {
                enabled: true,
                type: THREE.PCFSoftShadowMap,
                mapSize: 2048,
                bias: -0.0002
            },
            quality: {
                antialias: true,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                powerPreference: 'high-performance',
                adaptiveQuality: true
            },
            controls: {
                target: new THREE.Vector3(0, 3, -5),
                enableDamping: true,
                dampingFactor: 0.05,
                enableZoom: true,
                minDistance: 2,
                maxDistance: 100
            }
        };

        return this.mergeConfig(defaultConfig, userConfig);
    }

    /**
     * Fusionne la configuration utilisateur avec les valeurs par défaut
     */
    private mergeConfig(defaultConfig: RenderConfig, userConfig?: Partial<RenderConfig>): RenderConfig {
        if (!userConfig) return defaultConfig;
        
        return {
            camera: { ...defaultConfig.camera, ...userConfig.camera },
            scene: { ...defaultConfig.scene, ...userConfig.scene },
            lighting: {
                hemisphereLight: { ...defaultConfig.lighting.hemisphereLight, ...userConfig.lighting?.hemisphereLight },
                directionalLight: { ...defaultConfig.lighting.directionalLight, ...userConfig.lighting?.directionalLight },
                ambientLight: { ...defaultConfig.lighting.ambientLight, ...userConfig.lighting?.ambientLight }
            },
            shadows: { ...defaultConfig.shadows, ...userConfig.shadows },
            quality: { ...defaultConfig.quality, ...userConfig.quality },
            controls: { ...defaultConfig.controls, ...userConfig.controls }
        };
    }

    /**
     * Crée les métriques de performance initiales
     */
    private createInitialMetrics(): PerformanceMetrics {
        return {
            fps: 0,
            frameTime: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            programs: 0
        };
    }

    /**
     * Crée et configure la scène
     */
    private createScene(): THREE.Scene {
        const scene = new THREE.Scene();
        const { backgroundColor, fogColor, fogNear, fogFar } = this.config.scene;
        
        scene.background = new THREE.Color(backgroundColor);
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
        
        return scene;
    }

    /**
     * Crée et configure la caméra
     */
    private createCamera(): THREE.PerspectiveCamera {
        const { fov, near, far, initialPosition, lookAtTarget } = this.config.camera;
        
        const camera = new THREE.PerspectiveCamera(
            fov,
            this.container.clientWidth / this.container.clientHeight,
            near,
            far
        );
        
        camera.position.copy(initialPosition);
        camera.lookAt(lookAtTarget);
        
        return camera;
    }

    /**
     * Crée et configure le renderer avec optimisations
     */
    private createRenderer(): THREE.WebGLRenderer {
        const { antialias, pixelRatio, powerPreference } = this.config.quality;
        
        const renderer = new THREE.WebGLRenderer({
            antialias,
            powerPreference,
            preserveDrawingBuffer: false,
            alpha: false
        });
        
        renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        renderer.setPixelRatio(pixelRatio);
        
        // Configuration des ombres
        if (this.config.shadows.enabled) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = this.config.shadows.type;
            renderer.shadowMap.autoUpdate = true;
        }
        
        // Configuration du rendu moderne
        this.setupRendererProperties(renderer);
        
        this.container.appendChild(renderer.domElement);
        return renderer;
    }

    /**
     * Configure les propriétés avancées du renderer
     */
    private setupRendererProperties(renderer: THREE.WebGLRenderer): void {
        try {
            // Configuration de l'espace colorimétrique
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            
            // Optimisations de performance
            renderer.info.autoReset = false;
            renderer.sortObjects = true;
            renderer.autoClear = true;
            
        } catch (error) {
            console.warn('RenderManager: Certaines propriétés avancées du renderer ne sont pas supportées', error);
        }
    }

    /**
     * Crée et configure les contrôles
     */
    private createControls(): OrbitControls {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { target, enableDamping, dampingFactor, enableZoom, minDistance, maxDistance } = this.config.controls;
        
        controls.target.copy(target);
        controls.enableDamping = enableDamping;
        controls.dampingFactor = dampingFactor;
        controls.enableZoom = enableZoom;
        controls.minDistance = minDistance;
        controls.maxDistance = maxDistance;
        
        // Configuration des restrictions
        controls.maxPolarAngle = Math.PI * 0.9; // Empêche de passer sous le sol
        controls.enablePan = true;
        controls.keyPanSpeed = 7.0;
        
        controls.update();
        return controls;
    }

    /**
     * Configure l'éclairage de la scène
     */
    private setupLighting(): void {
        const { hemisphereLight, directionalLight, ambientLight } = this.config.lighting;
        
        // Lumière hémisphérique
        this.hemisphereLight = new THREE.HemisphereLight(
            hemisphereLight.skyColor,
            hemisphereLight.groundColor,
            hemisphereLight.intensity
        );
        this.scene.add(this.hemisphereLight);
        
        // Lumière directionnelle avec ombres
        this.directionalLight = new THREE.DirectionalLight(
            directionalLight.color,
            directionalLight.intensity
        );
        this.directionalLight.position.copy(directionalLight.position);
        
        if (this.config.shadows.enabled) {
            this.setupDirectionalLightShadows();
        }
        
        this.scene.add(this.directionalLight);
        
        // Lumière ambiante
        this.ambientLight = new THREE.AmbientLight(
            ambientLight.color,
            ambientLight.intensity
        );
        this.scene.add(this.ambientLight);
    }

    /**
     * Configure les ombres de la lumière directionnelle
     */
    private setupDirectionalLightShadows(): void {
        this.directionalLight.castShadow = true;
        
        const { mapSize, bias } = this.config.shadows;
        this.directionalLight.shadow.mapSize.set(mapSize, mapSize);
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 200;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.directionalLight.shadow.bias = bias;
        
        // Optimisation des ombres
        this.directionalLight.shadow.radius = 4;
        this.directionalLight.shadow.blurSamples = 8;
    }

    /**
     * Configure la gestion intelligente du redimensionnement
     */
    private setupResizeHandling(): void {
        if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.onResize(width, height);
                }
            });
            this.resizeObserver.observe(this.container);
        } else if (typeof window !== 'undefined') {
            // Fallback pour les navigateurs plus anciens
            const resizeHandler = () => {
                this.onResize(this.container.clientWidth, this.container.clientHeight);
            };
            (window as any).addEventListener('resize', resizeHandler);
        }
    }

    /**
     * Configure le post-processing (extensible)
     */
    private setupPostProcessing(): void {
        // Prêt pour l'ajout d'effets de post-processing
        // comme la Bloom, l'SSAO, etc.
    }

    /**
     * Gère le redimensionnement avec optimisations
     */
    private onResize(width: number, height: number): void {
        if (this.isDisposed) return;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // Notification d'événement pour les systèmes dépendants
        this.container.dispatchEvent(new CustomEvent('renderResize', {
            detail: { width, height, aspect: this.camera.aspect }
        }));
    }

    /**
     * Met à jour les métriques de performance
     */
    private updatePerformanceMetrics(deltaTime: number): void {
        this.frameCount++;
        
        if (deltaTime > 0) {
            this.currentFPS = 1000 / deltaTime;
        }
        
        const info = this.renderer.info;
        this.performanceMetrics = {
            fps: this.currentFPS,
            frameTime: deltaTime,
            triangles: info.render.triangles,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            programs: info.programs?.length || 0
        };
        
        // Adaptation automatique de la qualité si activée
        if (this.config.quality.adaptiveQuality) {
            this.adaptQuality();
        }
    }

    /**
     * Adapte automatiquement la qualité en fonction des performances
     */
    private adaptQuality(): void {
        const { fps } = this.performanceMetrics;
        
        if (fps < 30 && this.renderer.getPixelRatio() > 1) {
            // Réduire la résolution si les performances sont faibles
            this.renderer.setPixelRatio(Math.max(1, this.renderer.getPixelRatio() - 0.25));
        } else if (fps > 55 && this.renderer.getPixelRatio() < this.config.quality.pixelRatio) {
            // Augmenter la résolution si les performances le permettent
            this.renderer.setPixelRatio(Math.min(this.config.quality.pixelRatio, this.renderer.getPixelRatio() + 0.25));
        }
    }

    /**
     * Effectue un cycle de rendu optimisé
     */
    public render(deltaTime?: number): void {
        if (this.isDisposed) return;
        
        const currentTime = performance.now();
        const actualDeltaTime = deltaTime || (currentTime - this.lastTime);
        
        // Mise à jour des contrôles
        this.controls.update();
        
        // Rendu de la scène
        this.renderer.render(this.scene, this.camera);
        
        // Mise à jour des métriques
        this.updatePerformanceMetrics(actualDeltaTime);
        
        this.lastTime = currentTime;
    }

    /**
     * Ajoute le sol et la grille par défaut avec optimisations
     */
    public ensureGroundAndGrid(): void {
        if (this.isDisposed) return;
        
        const existingGround = this.scene.getObjectByName('Ground');
        if (existingGround) {
            // Un environnement gère déjà le sol/grille
            if (this.defaultGroundGroup) {
                this.scene.remove(this.defaultGroundGroup);
                this.disposeGroup(this.defaultGroundGroup);
                this.defaultGroundGroup = null;
            }
            return;
        }

        if (this.defaultGroundGroup) return; // Déjà ajouté

        this.defaultGroundGroup = this.createDefaultGround();
        this.scene.add(this.defaultGroundGroup);
    }

    /**
     * Crée le sol et la grille par défaut
     */
    private createDefaultGround(): THREE.Group {
        const group = new THREE.Group();
        group.name = 'DefaultGroundGroup';

        // Grille optimisée
        const grid = new THREE.GridHelper(120, 120, 0x335533, 0x224422);
        const gridMaterial = grid.material as THREE.Material;
        gridMaterial.transparent = true;
        gridMaterial.opacity = 0.4;
        group.add(grid);

        // Sol avec ombres
        const groundGeometry = new THREE.CircleGeometry(90, 72);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a9e4f });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.name = 'Ground';
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        group.add(ground);

        // Axes de repère discrets
        const axes = new THREE.AxesHelper(1.25);
        axes.position.set(0.7, 0, 0.7);
        group.add(axes);

        return group;
    }

    /**
     * Obtient les métriques de performance actuelles
     */
    public getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * Obtient les informations du renderer
     */
    public getRendererInfo(): THREE.WebGLInfo {
        return this.renderer.info;
    }

    /**
     * Met à jour la configuration
     */
    public updateConfig(newConfig: Partial<RenderConfig>): void {
        if (this.isDisposed) return;
        
        Object.assign(this.config, newConfig);
        
        // Appliquer les changements
        if (newConfig.quality?.pixelRatio) {
            this.renderer.setPixelRatio(newConfig.quality.pixelRatio);
        }
        
        if (newConfig.shadows?.enabled !== undefined) {
            this.renderer.shadowMap.enabled = newConfig.shadows.enabled;
        }
    }

    /**
     * Nettoie proprement un groupe Three.js
     */
    private disposeGroup(group: THREE.Group): void {
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    /**
     * Nettoie toutes les ressources
     */
    public dispose(): void {
        if (this.isDisposed) return;
        
        this.isDisposed = true;
        
        // Arrêter les animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Nettoyer les observateurs
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Nettoyer les contrôles
        this.controls.dispose();
        
        // Nettoyer le renderer
        this.renderer.dispose();
        
        // Nettoyer les caches
        this.shaderCache.clear();
        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();
        
        // Nettoyer le sol par défaut
        if (this.defaultGroundGroup) {
            this.disposeGroup(this.defaultGroundGroup);
        }
        
        // Nettoyer la scène complètement
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.scene.clear();
        
        // Retirer le canvas du DOM
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}

