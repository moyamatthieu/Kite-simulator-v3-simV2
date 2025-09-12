/**
 * `C_objet.ts` - Classe parent pour tous les objets 3D de la simulation
 *
 * Cette classe abstraite fournit les fonctionnalités de base communes à tous les objets :
 * - Gestion du groupe THREE.js
 * - Positionnement et transformation
 * - Gestion des ressources et nettoyage mémoire
 * - Interface standardisée pour l'ajout à la scène
 * - Système d'événements unifié
 */

import * as THREE from 'three';
import { generateId } from '../utils/debug';
import { type C_objetConfig, DefaultObjetConfig } from './types';

// Exporter C_objetConfig pour les autres modules
export type { C_objetConfig };

/**
 * Classe de base pour tous les objets de la simulation.
 * Gère le cycle de vie, les transformations et les événements.
 * @abstract
 */
export abstract class C_objet extends THREE.EventDispatcher<{
    initialized: {};
    added: { parent: C_objet };
    removed: { parent: C_objet };
    disposed: {};
}> {
    public id: string;
    public name: string;
    public config: C_objetConfig;
    public group: THREE.Group;
    public children: C_objet[] = [];
    public parent?: C_objet;

    constructor(config: Partial<C_objetConfig> = {}) {
        super();
        this.config = { ...DefaultObjetConfig, ...config };
        this.id = this.config.id ?? generateId();
        this.name = this.config.name ?? 'C_objet';
        this.group = new THREE.Group();
        this.group.name = this.name;

        // Configuration initiale
        if (config.position) this.group.position.copy(config.position);
        if (config.rotation) this.group.rotation.copy(config.rotation);
        if (config.scale) this.group.scale.copy(config.scale);
        if (config.visible !== undefined) this.group.visible = config.visible;

        // L'initialisation doit être appelée manuellement par les sous-classes
    }

    /**
     * Initialisation de l'objet - à appeler manuellement après le constructeur
     */
    public init(): void {
        this.createGeometry();
        this.createPhysics();
        this.group.userData.object = this;
        this.dispatchEvent({ type: 'initialized' });
    }

    /**
     * Crée la géométrie de l'objet.
     * @abstract
     */
    protected abstract createGeometry(): void;

    /**
     * Crée la physique de l'objet.
     * @abstract
     */
    protected abstract createPhysics(): void;

    /**
     * Met à jour l'objet à chaque frame.
     * @param deltaTime Le temps écoulé depuis la dernière frame.
     */
    public update(deltaTime: number): void {
        // Mise à jour des enfants
        this.children.forEach(child => child.update(deltaTime));
    }

    /**
     * Ajoute un objet enfant.
     * @param child L'objet enfant à ajouter.
     */
    public add(child: C_objet): void {
        if (!this.children.includes(child)) {
            this.children.push(child);
            this.group.add(child.group);
            child.parent = this;
            child.dispatchEvent({ type: 'added', parent: this });
        }
    }

    /**
     * Supprime un objet enfant.
     * @param child L'objet enfant à supprimer.
     */
    public remove(child: C_objet): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            this.group.remove(child.group);
            child.parent = undefined;
            child.dispatchEvent({ type: 'removed', parent: this });
        }
    }

    /**
     * Supprime l'objet et tous ses enfants de la scène.
     */
    public dispose(): void {
        // Supprime les enfants
        [...this.children].forEach(child => this.remove(child));

        // Supprime cet objet de son parent
        this.parent?.remove(this);

        this.dispatchEvent({ type: 'disposed' });
    }

    /**
     * Convertit un vecteur des coordonnées mondiales aux coordonnées locales de l'objet.
     * @param vector Le vecteur à convertir.
     * @returns Le vecteur dans le repère local.
     */
    public worldToLocal(vector: THREE.Vector3): THREE.Vector3 {
        const localVector = vector.clone();
        this.group.updateWorldMatrix(true, false);
        const invertedMatrix = this.group.matrixWorld.clone().invert();
        return localVector.applyMatrix4(invertedMatrix);
    }

    /**
     * Convertit un vecteur des coordonnées locales de l'objet aux coordonnées mondiales.
     * @param vector Le vecteur à convertir.
     * @returns Le vecteur dans le repère mondial.
     */
    public localToWorld(vector: THREE.Vector3): THREE.Vector3 {
        const worldVector = vector.clone();
        this.group.updateWorldMatrix(true, false);
        return worldVector.applyMatrix4(this.group.matrixWorld);
    }

    /**
     * Définit la position de l'objet
     * @param position La nouvelle position
     */
    public setPosition(position: THREE.Vector3): void {
        this.group.position.copy(position);
    }

    /**
     * Obtient la position actuelle de l'objet
     * @returns La position actuelle
     */
    public getPosition(): THREE.Vector3 {
        return this.group.position.clone();
    }

    /**
     * Définit la rotation de l'objet
     * @param rotation La nouvelle rotation (Euler ou Quaternion)
     */
    public setRotation(rotation: THREE.Euler | THREE.Quaternion): void {
        if (rotation instanceof THREE.Euler) {
            this.group.rotation.copy(rotation);
        } else {
            this.group.quaternion.copy(rotation);
        }
    }

    /**
     * Obtient la rotation actuelle de l'objet
     * @returns La rotation actuelle
     */
    public getRotation(): THREE.Euler {
        return this.group.rotation.clone();
    }

    /**
     * Définit l'échelle de l'objet
     * @param scale La nouvelle échelle
     */
    public setScale(scale: THREE.Vector3): void {
        this.group.scale.copy(scale);
    }

    /**
     * Obtient l'échelle actuelle de l'objet
     * @returns L'échelle actuelle
     */
    public getScale(): THREE.Vector3 {
        return this.group.scale.clone();
    }

    /**
     * Définit la visibilité de l'objet
     * @param visible La visibilité
     */
    public setVisible(visible: boolean): void {
        this.group.visible = visible;
    }

    /**
     * Obtient la visibilité actuelle de l'objet
     * @returns La visibilité actuelle
     */
    public getVisible(): boolean {
        return this.group.visible;
    }

    /**
     * Obtient le groupe THREE.js de l'objet
     * @returns Le groupe THREE.js
     */
    public getGroup(): THREE.Group {
        return this.group;
    }

    /**
     * Obtient les informations de debug de l'objet
     * @returns Les informations de debug
     */
    public getDebugInfo(): object {
        return {
            id: this.id,
            name: this.name,
            position: this.getPosition(),
            rotation: this.getRotation(),
            scale: this.getScale(),
            visible: this.getVisible(),
            childrenCount: this.children.length
        };
    }
}