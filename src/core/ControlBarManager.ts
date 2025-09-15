/**
 * ControlBarManager.ts - Gestionnaire de barre de contrôle optimisé
 * 
 * Responsabilité unique : gestion intelligente des positions et rotations de la barre
 * Architecture améliorée avec cache, interpolation et gestion d'état
 */

import * as THREE from 'three';
import { CONFIG, PhysicsConstants, HandlePositions } from './constants';
import { Kite } from '@objects/Kite';

/**
 * Configuration de la barre de contrôle
 */
interface ControlBarConfig {
    position: THREE.Vector3;
    width: number;
    maxRotation: number;
    smoothingFactor: number;
    autoOrientation: boolean;
    visualUpdate: boolean;
}

/**
 * État interne de la barre de contrôle
 */
interface ControlBarState {
    rotation: number;
    targetRotation: number;
    lastUpdateTime: number;
    isTracking: boolean;
}

/**
 * Gestionnaire de barre de contrôle avec fonctionnalités avancées
 */
export class ControlBarManager {
    private readonly position: THREE.Vector3;
    private readonly config: ControlBarConfig;
    private readonly state: ControlBarState;
    
    // Cache pour optimiser les calculs
    private readonly _tempVector = new THREE.Vector3();
    private readonly _tempQuaternion = new THREE.Quaternion();
    private readonly _rotationAxis = new THREE.Vector3();
    private readonly _cachedHandlePositions: HandlePositions = {
        left: new THREE.Vector3(),
        right: new THREE.Vector3()
    };
    
    private _handlePositionsDirty = true;
    private _lastKitePosition = new THREE.Vector3();
    private isDisposed = false;

    constructor(position?: THREE.Vector3, config?: Partial<ControlBarConfig>) {
        this.position = (position || CONFIG.controlBar.position).clone();
        this.config = this.createConfig(config);
        this.state = this.createInitialState();
    }

    /**
     * Crée la configuration avec les valeurs par défaut
     */
    private createConfig(userConfig?: Partial<ControlBarConfig>): ControlBarConfig {
        return {
            position: this.position,
            width: CONFIG.controlBar.width,
            maxRotation: Math.PI / 4, // 45 degrés max
            smoothingFactor: 0.1,
            autoOrientation: true,
            visualUpdate: true,
            ...userConfig
        };
    }

    /**
     * Crée l'état initial
     */
    private createInitialState(): ControlBarState {
        return {
            rotation: 0,
            targetRotation: 0,
            lastUpdateTime: performance.now(),
            isTracking: false
        };
    }

    /**
     * Calcule le quaternion de rotation de la barre avec optimisation
     */
    private computeRotationQuaternion(toKiteVector: THREE.Vector3): THREE.Quaternion {
        const barDirection = this._tempVector.set(1, 0, 0);
        this._rotationAxis.crossVectors(barDirection, toKiteVector).normalize();

        // Gestion du cas dégénéré
        if (this._rotationAxis.lengthSq() < PhysicsConstants.CONTROL_DEADZONE * PhysicsConstants.CONTROL_DEADZONE) {
            this._rotationAxis.set(0, 1, 0);
        }

        return this._tempQuaternion.setFromAxisAngle(this._rotationAxis, this.state.rotation);
    }

    /**
     * Met à jour la rotation de la barre avec interpolation
     */
    public update(deltaTime: number): void {
        if (this.isDisposed) return;

        const currentTime = performance.now();
        this.state.lastUpdateTime = currentTime;

        // Interpolation lisse vers la rotation cible
        if (Math.abs(this.state.targetRotation - this.state.rotation) > PhysicsConstants.CONTROL_DEADZONE) {
            const rotationDiff = this.state.targetRotation - this.state.rotation;
            this.state.rotation += rotationDiff * this.config.smoothingFactor * deltaTime * 60; // 60fps baseline
            
            // Clamp à la rotation maximale
            this.state.rotation = Math.max(
                -this.config.maxRotation,
                Math.min(this.config.maxRotation, this.state.rotation)
            );

            this._handlePositionsDirty = true;
        }
    }

    /**
     * Obtient les positions des poignées avec cache intelligent
     */
    public getHandlePositions(kitePosition: THREE.Vector3): HandlePositions {
        if (this.isDisposed) {
            return { left: new THREE.Vector3(), right: new THREE.Vector3() };
        }

        // Vérifier si le cache est valide
        if (!this._handlePositionsDirty && kitePosition.equals(this._lastKitePosition)) {
            return {
                left: this._cachedHandlePositions.left.clone(),
                right: this._cachedHandlePositions.right.clone()
            };
        }

        // Recalculer les positions
        const toKiteVector = this._tempVector.copy(kitePosition).sub(this.position).normalize();
        const rotationQuaternion = this.computeRotationQuaternion(toKiteVector);

        const halfWidth = this.config.width / 2;
        
        // Position gauche
        this._cachedHandlePositions.left.set(-halfWidth, 0, 0)
            .applyQuaternion(rotationQuaternion)
            .add(this.position);
        
        // Position droite
        this._cachedHandlePositions.right.set(halfWidth, 0, 0)
            .applyQuaternion(rotationQuaternion)
            .add(this.position);

        // Mettre à jour le cache
        this._lastKitePosition.copy(kitePosition);
        this._handlePositionsDirty = false;

        return {
            left: this._cachedHandlePositions.left.clone(),
            right: this._cachedHandlePositions.right.clone()
        };
    }

    /**
     * Définit la rotation cible (avec interpolation)
     */
    public setTargetRotation(rotation: number): void {
        if (this.isDisposed) return;
        
        this.state.targetRotation = Math.max(
            -this.config.maxRotation,
            Math.min(this.config.maxRotation, rotation)
        );
        this.state.isTracking = true;
    }

    /**
     * Définit la rotation immédiate (sans interpolation)
     */
    public setRotation(rotation: number): void {
        if (this.isDisposed) return;
        
        this.state.rotation = Math.max(
            -this.config.maxRotation,
            Math.min(this.config.maxRotation, rotation)
        );
        this.state.targetRotation = this.state.rotation;
        this._handlePositionsDirty = true;
    }

    /**
     * Obtient la rotation actuelle
     */
    public getRotation(): number {
        return this.state.rotation;
    }

    /**
     * Obtient la rotation cible
     */
    public getTargetRotation(): number {
        return this.state.targetRotation;
    }

    /**
     * Obtient la position de la barre
     */
    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    /**
     * Met à jour l'objet 3D visuel avec optimisations
     */
    public updateVisual(bar: THREE.Group, kite: Kite): void {
        if (this.isDisposed || !bar || !this.config.visualUpdate) return;

        const ctrlLeftPos = kite.getPointPosition('CTRL_GAUCHE');
        const ctrlRightPos = kite.getPointPosition('CTRL_DROIT');

        if (!ctrlLeftPos || !ctrlRightPos) {
            console.warn('ControlBarManager: Points de contrôle du kite non disponibles');
            return;
        }

        // Transformation en coordonnées monde
        const kiteLeftWorld = ctrlLeftPos.clone();
        const kiteRightWorld = ctrlRightPos.clone();
        kite.get_group().localToWorld(kiteLeftWorld);
        kite.get_group().localToWorld(kiteRightWorld);

        // Centre des points de contrôle
        const centerKite = this._tempVector.copy(kiteLeftWorld)
            .add(kiteRightWorld)
            .multiplyScalar(0.5);

        // Direction vers le kite
        const toKiteVector = centerKite.sub(this.position).normalize();

        // Application de la rotation
        bar.quaternion.copy(this.computeRotationQuaternion(toKiteVector));
    }

    /**
     * Remet à zéro l'état de la barre
     */
    public reset(): void {
        if (this.isDisposed) return;
        
        this.state.rotation = 0;
        this.state.targetRotation = 0;
        this.state.isTracking = false;
        this._handlePositionsDirty = true;
    }

    /**
     * Obtient les statistiques de la barre
     */
    public getStats(): {
        rotation: number;
        targetRotation: number;
        isTracking: boolean;
        positionsCached: boolean;
        isActive: boolean;
    } {
        return {
            rotation: this.state.rotation,
            targetRotation: this.state.targetRotation,
            isTracking: this.state.isTracking,
            positionsCached: !this._handlePositionsDirty,
            isActive: !this.isDisposed
        };
    }

    /**
     * Vérifie l'intégrité du gestionnaire
     */
    public validateIntegrity(): boolean {
        return !this.isDisposed && 
               this.position && 
               this.config && 
               this.state &&
               !isNaN(this.state.rotation) &&
               !isNaN(this.state.targetRotation);
    }

    /**
     * Met à jour la configuration
     */
    public updateConfig(newConfig: Partial<ControlBarConfig>): void {
        if (this.isDisposed) return;
        
        Object.assign(this.config, newConfig);
        this._handlePositionsDirty = true;
    }

    /**
     * Nettoyage des ressources
     */
    public dispose(): void {
        if (this.isDisposed) return;
        
        this.isDisposed = true;
        this.state.isTracking = false;
        
        // Pas de nettoyage spécifique nécessaire pour les objets THREE.js temporaires
        // car ils sont réutilisés et ne sont pas ajoutés à des scènes
    }
}