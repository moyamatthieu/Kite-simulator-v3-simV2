
/**
 * EntityManager.ts - Gestionnaire d'entités de simulation optimisé
 * 
 * Responsabilité unique : création, gestion et coordination des entités physiques
 * Architecture robuste avec gestion du cycle de vie et performance optimisée
 */

import * as THREE from 'three';
import { Kite } from '../objects/Kite';
import { Pilote3D } from '../objects/Pilote';
import { CONFIG } from './constants';
import { LineSystem } from '../objects/components/lines';
import { KiteControlPoint } from '../enum';

/**
 * Configuration des entités
 */
interface EntityConfig {
    kiteOptions: {
        sailColor: number;
        frameColor: number;
    };
    initialPosition: {
        kiteHeight: number;
        distanceRatio: number;
    };
    physics: {
        enableShadows: boolean;
        autoInitialize: boolean;
    };
}

/**
 * Gestionnaire d'entités avec cycle de vie complet
 */
export class EntityManager {
    public readonly kite: Kite;
    public readonly pilote: Pilote3D;
    public readonly lineSystem: LineSystem;
    
    private readonly scene: THREE.Scene;
    private readonly config: EntityConfig;
    private isDisposed = false;
    
    // Cache pour optimiser les calculs
    private readonly _tempVector = new THREE.Vector3();
    private readonly _tempQuaternion = new THREE.Quaternion();

    constructor(scene: THREE.Scene, config?: Partial<EntityConfig>) {
        this.scene = scene;
        this.config = this.createConfig(config);
        
        // Création ordonnée des entités
        this.pilote = this.createPilote();
        this.kite = this.createKite();
        this.lineSystem = this.createLineSystem();
        
        // Configuration initiale
        this.setupInitialState();
    }

    /**
     * Crée la configuration avec les valeurs par défaut
     */
    private createConfig(userConfig?: Partial<EntityConfig>): EntityConfig {
        return {
            kiteOptions: {
                sailColor: 0xff3333,
                frameColor: 0x2a2a2a,
                ...userConfig?.kiteOptions
            },
            initialPosition: {
                kiteHeight: 7,
                distanceRatio: 0.95,
                ...userConfig?.initialPosition
            },
            physics: {
                enableShadows: true,
                autoInitialize: true,
                ...userConfig?.physics
            }
        };
    }

    /**
     * Crée le pilote et l'ajoute à la scène
     */
    private createPilote(): Pilote3D {
        const pilote = new Pilote3D();
        this.scene.add(pilote.get_group());
        return pilote;
    }

    /**
     * Crée le kite avec positionnement intelligent
     */
    private createKite(): Kite {
        const kite = new Kite(this.config.kiteOptions);
        
        // Configuration des propriétés visuelles
        if (this.config.physics.enableShadows) {
            kite.get_group().castShadow = true;
            kite.get_group().receiveShadow = true;
        }

        // Initialisation physique
        if (this.config.physics.autoInitialize) {
            kite.initialize_root();
        }

        this.scene.add(kite.get_group());
        return kite;
    }

    /**
     * Crée le système de lignes
     */
    private createLineSystem(): LineSystem {
        const lineSystem = new LineSystem();
        this.scene.add(lineSystem.object3d);
        return lineSystem;
    }

    /**
     * Configure l'état initial des entités
     */
    private setupInitialState(): void {
        this.resetToInitialPosition();
    }

    /**
     * Calcule la position initiale optimale du kite
     */
    private calculateInitialKitePosition(): THREE.Vector3 {
        const pilotPos = this.pilote.getControlBarWorldPosition();
        const { kiteHeight, distanceRatio } = this.config.initialPosition;
        const targetDistance = CONFIG.lines.defaultLength * distanceRatio;
        
        const deltaY = kiteHeight - pilotPos.y;
        const horizontalDistance = Math.max(
            0.1, 
            Math.sqrt(Math.max(0, targetDistance * targetDistance - deltaY * deltaY))
        );

        return this._tempVector.set(
            pilotPos.x, 
            kiteHeight, 
            pilotPos.z - horizontalDistance
        );
    }

    /**
     * Met à jour les lignes de contrôle avec optimisation
     */
    public updateControlLines(): void {
        if (this.isDisposed) return;

        // Récupération des positions des poignées
        const leftHandlePos = this.pilote.getHandleWorldPosition('left', 0);
        const rightHandlePos = this.pilote.getHandleWorldPosition('right', 0);

        // Récupération des points de contrôle du kite
        const ctrlLeftPos = this.kite.getPointPosition(KiteControlPoint.CTRL_GAUCHE);
        const ctrlRightPos = this.kite.getPointPosition(KiteControlPoint.CTRL_DROIT);

        if (!ctrlLeftPos || !ctrlRightPos) {
            console.warn('EntityManager: Points de contrôle du kite non disponibles');
            return;
        }

        // Transformation en coordonnées monde avec réutilisation de vecteurs
        const kiteLeftWorld = ctrlLeftPos.clone();
        const kiteRightWorld = ctrlRightPos.clone();
        
        this.kite.get_group().localToWorld(kiteLeftWorld);
        this.kite.get_group().localToWorld(kiteRightWorld);

        // Mise à jour des lignes
        this.lineSystem.updateLine(0, leftHandlePos, kiteLeftWorld);
        this.lineSystem.updateLine(1, rightHandlePos, kiteRightWorld);
    }

    /**
     * Remet les entités à leur position initiale
     */
    public resetToInitialPosition(): void {
        if (this.isDisposed) return;

        const initialPosition = this.calculateInitialKitePosition();
        
        // Reset position et rotation du kite
        this.kite.set_position(initialPosition);
        this.kite.get_group().quaternion.copy(this._tempQuaternion.identity());

        // Reset physique du kite
        this.kite.state.velocity.set(0, 0, 0);
        this.kite.state.angularVelocity.set(0, 0, 0);
        
        // Reset du pilote (si nécessaire)
        // this.pilote.reset(); // À implémenter si besoin
    }

    /**
     * Met à jour toutes les entités
     */
    public update(deltaTime: number): void {
        if (this.isDisposed) return;

        // Mise à jour des lignes de contrôle
        this.updateControlLines();
        
        // Autres mises à jour peuvent être ajoutées ici
        // this.kite.update(deltaTime);
        // this.pilote.update(deltaTime);
    }

    /**
     * Obtient les statistiques des entités
     */
    public getStats(): { 
        kitePosition: THREE.Vector3;
        pilotePosition: THREE.Vector3;
        lineCount: number;
        isActive: boolean;
    } {
        return {
            kitePosition: this.kite.get_position().clone(),
            pilotePosition: this.pilote.getControlBarWorldPosition(),
            lineCount: 2, // Lignes gauche et droite
            isActive: !this.isDisposed
        };
    }

    /**
     * Vérifie l'intégrité des entités
     */
    public validateIntegrity(): boolean {
        if (this.isDisposed) return false;

        return !!(
            this.kite?.get_group() &&
            this.pilote?.get_group() &&
            this.lineSystem?.object3d &&
            this.scene.children.includes(this.kite.get_group()) &&
            this.scene.children.includes(this.pilote.get_group()) &&
            this.scene.children.includes(this.lineSystem.object3d)
        );
    }

    /**
     * Nettoyage des ressources
     */
    public dispose(): void {
        if (this.isDisposed) return;

        this.isDisposed = true;

        // Nettoyage des entités
        if (this.kite) {
            this.scene.remove(this.kite.get_group());
            // this.kite.dispose(); // À implémenter si nécessaire
        }

        if (this.pilote) {
            this.scene.remove(this.pilote.get_group());
            // this.pilote.dispose(); // À implémenter si nécessaire
        }

        if (this.lineSystem) {
            this.scene.remove(this.lineSystem.object3d);
            // this.lineSystem.dispose(); // À implémenter si nécessaire
        }
    }

    /**
     * Met à jour la configuration
     */
    public updateConfig(newConfig: Partial<EntityConfig>): void {
        Object.assign(this.config, newConfig);
        
        // Appliquer les changements si nécessaire
        if (newConfig.kiteOptions) {
            // Mise à jour des couleurs du kite
            // this.kite.updateColors(newConfig.kiteOptions);
        }
    }
}
