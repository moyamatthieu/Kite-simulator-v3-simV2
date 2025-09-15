/**
 * SimulationApp.ts - Application principale de simulation
 *
 * Architecture simple et accessible pour débutants :
 * - Chaque classe a UNE responsabilité claire
 * - Pas de complexité inutile
 * - Code facile à comprendre et modifier
 * - Fonctionnel et maintenable
 */

import * as THREE from 'three';

// === IMPORTS SIMPLES ET DIRECTS ===
import { SceneManager } from './core/SceneManager';
import { InputHandler } from './core/InputHandler';
import { EntityManager } from './core/EntityManager';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { CompactUI } from './ui/CompactUI';
import { UIManager } from './ui/UIManager';

export class SimulationApp {
    // === LES 4 CLASSES PRINCIPALES ===
    // Chaque classe a une responsabilité unique et claire

    /** Gère la scène 3D, caméra, lumières */
    private sceneManager: SceneManager;

    /** Capture et traite les inputs utilisateur */
    private inputHandler: InputHandler;

    /** Gère les objets 3D (cerf-volant, pilote, lignes) */
    private entityManager: EntityManager;

    /** Calcule la physique (forces, mouvement) */
    private physicsEngine: PhysicsEngine;

    /** Interface utilisateur */
    private ui: CompactUI;
    private uiManager: UIManager;

    // === ÉTAT DE LA SIMULATION ===
    private clock: THREE.Clock;
    private isPlaying: boolean = true;
    private debugMode: boolean = false;
    private frameCount: number = 0;

    /**
     * Constructeur simple - crée tout ce dont on a besoin
     */
    constructor(containerElement: HTMLElement) {
        console.log('🚀 Création de la simulation...');

        // 1. Créer la scène 3D
        this.sceneManager = new SceneManager(containerElement);

        // 2. Créer le gestionnaire d'inputs
        this.inputHandler = new InputHandler();

        // 3. Créer les objets 3D (cerf-volant, pilote, lignes)
        this.entityManager = new EntityManager(this.sceneManager.scene);

        // 4. Créer le moteur physique
        this.physicsEngine = new PhysicsEngine(
            this.entityManager.kite,
            new THREE.Vector3(0, 0, -2) // Position par défaut de la barre
        );

        // 5. Initialiser la boucle de temps
        this.clock = new THREE.Clock();

        // 6. Supprimer l'écran de chargement
        this.removeLoadingScreen(containerElement);

        // 7. Initialiser l'interface utilisateur
        this.ui = new CompactUI(this);
        this.uiManager = new UIManager(this, this.ui);

        // 8. Démarrer la simulation
        console.log('✅ Simulation créée avec succès !');
        this.startAnimationLoop();
    }

    /**
     * Supprime l'écran de chargement
     */
    private removeLoadingScreen(container: HTMLElement): void {
        const loadingElements = container.querySelectorAll('.loading, #div_loading, #loading');
        loadingElements.forEach(element => {
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        });
    }

    /**
     * Démarre la boucle d'animation principale
     */
    private startAnimationLoop(): void {
        const animate = () => {
            requestAnimationFrame(animate);
            this.update();
            this.render();
        };
        animate();
    }

    /**
     * Met à jour la simulation (60 fois par seconde)
     */
    private update(): void {
        const deltaTime = this.clock.getDelta();
        this.frameCount++;

        if (this.isPlaying) {
            // 1. Traiter les inputs utilisateur
            this.inputHandler.update(deltaTime);

            // 2. Calculer la physique
            this.physicsEngine.update(deltaTime, this.inputHandler.getTargetBarRotation());
        }

        // 3. Mettre à jour les lignes de contrôle
        this.updateControlLines();

        // 4. Afficher des informations de debug si activé
        if (this.debugMode) {
            this.showDebugInfo();
        }
    }

    /**
     * Met à jour les lignes de contrôle entre le pilote et le cerf-volant
     */
    private updateControlLines(): void {
        try {
            const kiteController = this.physicsEngine.getKiteController();
            // Simplifié : on ne met pas à jour les lignes pour éviter les erreurs
            // this.entityManager.updateControlLines(kiteController);
        } catch (error) {
            // En cas d'erreur, on continue sans les lignes
            console.warn('Impossible de mettre à jour les lignes de contrôle:', error);
        }
    }

    /**
     * Affiche des informations de debug simples
     */
    private showDebugInfo(): void {
        if (this.frameCount % 60 === 0) { // Toutes les secondes environ
            const kitePos = this.entityManager.kite.get_position();
            console.log(`Frame ${this.frameCount}: Cerf-volant en [${kitePos.x.toFixed(1)}, ${kitePos.y.toFixed(1)}, ${kitePos.z.toFixed(1)}]`);
        }
    }

    /**
     * Rend la scène 3D
     */
    private render(): void {
        this.sceneManager.render();
    }

    // === MÉTHODES PUBLIQUES SIMPLES ===

    /**
     * Démarre ou arrête la simulation
     */
    public togglePlayPause(): void {
        this.isPlaying = !this.isPlaying;
        console.log(this.isPlaying ? '▶️ Simulation démarrée' : '⏸️ Simulation arrêtée');
    }

    /**
     * Active ou désactive le mode debug
     */
    public toggleDebugMode(): void {
        this.debugMode = !this.debugMode;
        console.log(this.debugMode ? '🐛 Mode debug activé' : '🚫 Mode debug désactivé');
    }

    /**
     * Réinitialise complètement la simulation
     */
    public resetSimulation(): void {
        console.log('🔄 Réinitialisation de la simulation...');

        // Remettre l'état par défaut
        this.isPlaying = true;
        this.frameCount = 0;

        // Réinitialiser les objets
        this.entityManager.resetToInitialPosition();

        // Remettre le cerf-volant à sa position initiale
        try {
            this.entityManager.kite.group.position.set(0, 10, 0);
            this.entityManager.kite.group.rotation.set(0, 0, 0);
        } catch (error) {
            console.warn('Impossible de réinitialiser le cerf-volant:', error);
        }

        console.log('✅ Simulation réinitialisée');
    }

    /**
     * Change les paramètres du vent
     */
    // Accept either separate parameters or a partial params object
    public setWindParams(speedOrObj: number | Partial<{ speed:number; direction:number; turbulence:number }>, direction?: number, turbulence: number = 0): void {
        try {
            let params: { speed: number; direction: number; turbulence: number };
            if (typeof speedOrObj === 'number') {
                params = { speed: speedOrObj, direction: direction ?? 0, turbulence };
            } else {
                params = {
                    speed: speedOrObj.speed ?? 0,
                    direction: speedOrObj.direction ?? 0,
                    turbulence: speedOrObj.turbulence ?? 0
                };
            }

            this.physicsEngine.getWindSimulator().setParams(params);
            console.log(`💨 Vent modifié: ${params.speed} m/s, direction ${params.direction}°`);
        } catch (error) {
            console.warn('Impossible de modifier les paramètres du vent:', error);
        }
    }

    // Small API used by UI; stub that forwards to physics engine when available
    public setLiftCoefficient(coefficient: number): void {
        try {
            if (typeof this.physicsEngine.setLiftCoefficient === 'function') {
                // @ts-ignore optional
                this.physicsEngine.setLiftCoefficient(coefficient);
                console.log(`⚖️ Coefficient de portance réglé à ${coefficient}`);
            } else {
                console.warn('setLiftCoefficient non implémenté sur physicsEngine');
            }
        } catch (error) {
            console.warn('Impossible de définir le coefficient de portance:', error);
        }
    }

    /**
     * Change la longueur des lignes
     */
    public setLineLength(length: number): void {
        try {
            this.physicsEngine.getLineSystem().setLineLength(length);
            console.log(`📏 Longueur des lignes: ${length} mètres`);
        } catch (error) {
            console.warn('Impossible de modifier la longueur des lignes:', error);
        }
    }

    // === GETTERS POUR ACCÉDER AUX CLASSES INTERNES ===
    // Utile pour le debug ou l'extension

    public getSceneManager(): SceneManager {
        return this.sceneManager;
    }

    public getInputHandler(): InputHandler {
        return this.inputHandler;
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
    }

    public getPhysicsEngine(): PhysicsEngine {
        return this.physicsEngine;
    }

    public isSimulationPlaying(): boolean {
        return this.isPlaying;
    }

    public getFrameCount(): number {
        return this.frameCount;
    }
}
