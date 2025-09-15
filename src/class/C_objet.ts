/**
 * `C_objet.ts` - Classe parent pour tous les objets 3D de la simulation
 * Inspirée de l'architecture Node3D de Godot avec cycle de vie complet
 *
 * Cette classe abstraite fournit les fonctionnalités de base communes à tous les objets :
 * - Gestion du groupe THREE.js avec hiérarchie parent-enfant
 * - Cycle de vie complet : _init() -> _enter_tree() -> _ready() -> _exit_tree()
 * - Positionnement et transformations avec héritage hiérarchique
 * - Gestion des ressources et nettoyage mémoire automatique
 * - Interface standardisée pour l'ajout à la scène
 * - Système d'événements unifié compatible avec le scene tree
 */

import * as THREE from 'three';
import { generateId } from '../utils/debug';
import { type C_objetConfig, DefaultObjetConfig } from '../objects/types';

// Exporter C_objetConfig pour les autres modules
export type { C_objetConfig };

import { ObjectLifecycleState } from '../enum';

/**
 * Classe de base pour tous les objets de la simulation.
 * Suit le pattern Node3D de Godot avec cycle de vie complet.
 * @abstract
 */
export abstract class C_objet extends THREE.EventDispatcher<{
    enter_tree: {};
    ready: {};
    exit_tree: {};
    disposed: {};
    child_added: { child: C_objet };
    child_removed: { child: C_objet };
}> {
    public readonly id: string;
    public readonly name: string;
    public readonly config: C_objetConfig;
    public readonly group: THREE.Group;
    
    private _children: C_objet[] = [];
    private _parent?: C_objet;
    private _lifecycleState: ObjectLifecycleState = ObjectLifecycleState.CREATED;
    private _isInTree: boolean = false;
    private _isReady: boolean = false;

    constructor(config: Partial<C_objetConfig> = {}) {
        super();
        
        // Phase _init() - équivalent Godot
        this.config = { ...DefaultObjetConfig, ...config };
        this.id = this.config.id ?? generateId();
        this.name = this.config.name ?? 'C_objet';
        this.group = new THREE.Group();
        this.group.name = this.name;
        this.group.userData.object = this;

    // Configuration initiale des transformations
    if (config.position) this.group.position.copy(this._toVector3(config.position));
    if (config.rotation) this.group.rotation.copy(this._toEuler(config.rotation));
    if (config.scale) this.group.scale.copy(this._toVector3(config.scale));
    if (config.visible !== undefined) this.group.visible = !!config.visible;

        // Appeler _init() personnalisé
        this._init();
    }

    // Helpers pour accepter soit des THREE types soit des plain objects {x,y,z}
    private _toVector3(v: any): THREE.Vector3 {
        if (v instanceof THREE.Vector3) return v;
        if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') {
            return new THREE.Vector3(v.x, v.y, v.z);
        }
        return new THREE.Vector3();
    }

    private _toEuler(r: any): THREE.Euler {
        if (r instanceof THREE.Euler) return r;
        if (r && typeof r.x === 'number' && typeof r.y === 'number' && typeof r.z === 'number') {
            const order = (r.order as THREE.Euler['order']) || 'XYZ';
            return new THREE.Euler(r.x, r.y, r.z, order);
        }
        return new THREE.Euler();
    }

    /**
     * Phase d'initialisation personnalisée (équivalent _init() Godot)
     * Appelée automatiquement dans le constructeur
     */
    protected _init(): void {
        // À surcharger dans les sous-classes si nécessaire
    }

    /**
     * Phase d'entrée dans le scene tree (équivalent _enter_tree() Godot)
     * Appelée automatiquement quand l'objet est ajouté au tree
     */
    protected _enter_tree(): void {
        // À surcharger dans les sous-classes
        // Ici on peut créer la géométrie de base
    }

    /**
     * Phase de préparation finale (équivalent _ready() Godot)
     * Appelée après _enter_tree() quand tous les enfants sont prêts
     */
    protected _ready(): void {
        // À surcharger dans les sous-classes
        // Ici on peut finaliser l'initialisation, créer la physique, etc.
    }

    /**
     * Phase de sortie du scene tree (équivalent _exit_tree() Godot)
     * Appelée automatiquement quand l'objet est retiré du tree
     */
    protected _exit_tree(): void {
        // À surcharger dans les sous-classes
        // Ici on peut nettoyer les ressources spécifiques
    }

    // ============================================================================
    // GESTION DU SCENE TREE (Inspiré de Godot)
    // ============================================================================

    /**
     * Ajoute un enfant au scene tree (équivalent add_child() Godot)
     * Déclenche automatiquement le cycle de vie _enter_tree() -> _ready()
     */
    public add_child(child: C_objet): void {
        if (this._children.includes(child)) {
            console.warn(`Enfant ${child.name} déjà ajouté à ${this.name}`);
            return;
        }

        // Retirer de l'ancien parent si nécessaire
        if (child._parent) {
            child._parent.remove_child(child);
        }

        // Ajouter au nouveau parent
        this._children.push(child);
        this.group.add(child.group);
        child._parent = this;

        // Déclencher le cycle de vie si le parent est dans le tree
        if (this._isInTree) {
            child._enter_scene_tree();
        }

        // Émettre événement
        this.dispatchEvent({ type: 'child_added', child });
    }

    /**
     * Retire un enfant du scene tree (équivalent remove_child() Godot)
     * Déclenche automatiquement _exit_tree()
     */
    public remove_child(child: C_objet): void {
        const index = this._children.indexOf(child);
        if (index === -1) {
            console.warn(`Enfant ${child.name} non trouvé dans ${this.name}`);
            return;
        }

        // Déclencher _exit_tree() si l'enfant était dans le tree
        if (child._isInTree) {
            child._exit_scene_tree();
        }

        // Retirer de la hiérarchie
        this._children.splice(index, 1);
        this.group.remove(child.group);
        child._parent = undefined;

        // Émettre événement
        this.dispatchEvent({ type: 'child_removed', child });
    }

    /**
     * Entre dans le scene tree (processus interne)
     */
    private _enter_scene_tree(): void {
        if (this._isInTree) return;

        this._lifecycleState = ObjectLifecycleState.ENTERING_TREE;
        this._isInTree = true;

        // Appeler _enter_tree() de cet objet
        this._enter_tree();
        this._lifecycleState = ObjectLifecycleState.IN_TREE;
        this.dispatchEvent({ type: 'enter_tree' });

        // Faire entrer tous les enfants dans le tree
        for (const child of this._children) {
            child._enter_scene_tree();
        }

        // Une fois que tous les enfants sont dans le tree, appeler _ready()
        this._become_ready();
    }

    /**
     * Devient prêt (processus interne) 
     */
    private _become_ready(): void {
        if (this._isReady) return;

        // Attendre que tous les enfants soient prêts
        const allChildrenReady = this._children.every(child => child._isReady || !child._isInTree);
        if (!allChildrenReady) return;

        this._isReady = true;
        this._lifecycleState = ObjectLifecycleState.READY;
        
        // Appeler _ready() de cet objet
        this._ready();
        this.dispatchEvent({ type: 'ready' });

        // Déclencher _ready() pour le parent si tous ses enfants sont prêts
        if (this._parent && this._parent._isInTree) {
            this._parent._become_ready();
        }
    }

    /**
     * Initialise l'objet racine manuellement (pour les objets sans parent)
     * Équivalent public de _enter_scene_tree() pour l'objet racine
     */
    public initialize_root(): void {
        if (!this._isInTree) {
            this._enter_scene_tree();
        }
    }

    /**
     * Sort du scene tree (processus interne)
     */
    private _exit_scene_tree(): void {
        if (!this._isInTree) return;

        this._lifecycleState = ObjectLifecycleState.EXITING_TREE;

        // Faire sortir tous les enfants du tree d'abord
        for (const child of this._children) {
            if (child._isInTree) {
                child._exit_scene_tree();
            }
        }

        // Appeler _exit_tree() de cet objet
        this._exit_tree();
        this.dispatchEvent({ type: 'exit_tree' });

        this._isInTree = false;
        this._isReady = false;
        this._lifecycleState = ObjectLifecycleState.CREATED;
    }

    /**
     * Détruit l'objet et tous ses enfants (équivalent queue_free() Godot)
     */
    public queue_free(): void {
        if (this._lifecycleState === ObjectLifecycleState.DISPOSED) return;

        // Sortir du tree d'abord
        if (this._isInTree) {
            this._exit_scene_tree();
        }

        // Retirer du parent
        if (this._parent) {
            this._parent.remove_child(this);
        }

        // Détruire tous les enfants
        [...this._children].forEach(child => child.queue_free());

        this._lifecycleState = ObjectLifecycleState.DISPOSED;
        this.dispatchEvent({ type: 'disposed' });
    }

    // ============================================================================
    // MÉTHODES DE MISE À JOUR (Compatible avec l'ancien système)
    // ============================================================================

    /**
     * Met à jour l'objet à chaque frame (équivalent _process() Godot)
     * @param deltaTime Le temps écoulé depuis la dernière frame.
     */
    public update(deltaTime: number): void {
        if (!this._isReady) return;

        // Mise à jour des enfants
        this._children.forEach(child => child.update(deltaTime));
    }


    // ============================================================================
    // TRANSFORMATIONS (Équivalent Node3D)
    // ============================================================================

    /**
     * Convertit un vecteur du repère mondial vers le repère local (équivalent to_local() Godot)
     * @param vector Le vecteur à convertir
     * @returns Le vecteur dans le repère local
     */
    public to_local(vector: THREE.Vector3): THREE.Vector3 {
        const localVector = vector.clone();
        this.group.updateWorldMatrix(true, false);
        const invertedMatrix = this.group.matrixWorld.clone().invert();
        return localVector.applyMatrix4(invertedMatrix);
    }

    /**
     * Convertit un vecteur du repère local vers le repère mondial (équivalent to_global() Godot)
     * @param vector Le vecteur à convertir
     * @returns Le vecteur dans le repère mondial
     */
    public to_global(vector: THREE.Vector3): THREE.Vector3 {
        const worldVector = vector.clone();
        this.group.updateWorldMatrix(true, false);
        return worldVector.applyMatrix4(this.group.matrixWorld);
    }

    /**
     * Définit la position de l'objet (équivalent set_position() Godot)
     * @param position La nouvelle position
     */
    public set_position(position: THREE.Vector3): void {
        this.group.position.copy(position);
    }

    /**
     * Obtient la position actuelle de l'objet (équivalent get_position() Godot)
     * @returns La position actuelle
     */
    public get_position(): THREE.Vector3 {
        return this.group.position.clone();
    }

    /**
     * Définit la rotation de l'objet (équivalent set_rotation() Godot)
     * @param rotation La nouvelle rotation (Euler ou Quaternion)
     */
    public set_rotation(rotation: THREE.Euler | THREE.Quaternion): void {
        if (rotation instanceof THREE.Euler) {
            this.group.rotation.copy(rotation);
        } else {
            this.group.quaternion.copy(rotation);
        }
    }

    /**
     * Obtient la rotation actuelle de l'objet (équivalent get_rotation() Godot)
     * @returns La rotation actuelle
     */
    public get_rotation(): THREE.Euler {
        return this.group.rotation.clone();
    }

    /**
     * Définit l'échelle de l'objet (équivalent set_scale() Godot)
     * @param scale La nouvelle échelle
     */
    public set_scale(scale: THREE.Vector3): void {
        this.group.scale.copy(scale);
    }

    /**
     * Obtient l'échelle actuelle de l'objet (équivalent get_scale() Godot)
     * @returns L'échelle actuelle
     */
    public get_scale(): THREE.Vector3 {
        return this.group.scale.clone();
    }

    /**
     * Définit la visibilité de l'objet (équivalent set_visible() Godot)
     * @param visible La visibilité
     */
    public set_visible(visible: boolean): void {
        this.group.visible = visible;
    }

    /**
     * Obtient la visibilité actuelle de l'objet (équivalent is_visible_in_tree() Godot)
     * @returns La visibilité actuelle
     */
    public is_visible_in_tree(): boolean {
        return this.group.visible && this._isInTree;
    }

    /**
     * Oriente l'objet vers une cible (équivalent look_at() Godot)
     * @param target La position cible à regarder
     * @param up Le vecteur "vers le haut" (optionnel)
     */
    public look_at(target: THREE.Vector3, up?: THREE.Vector3): void {
        this.group.lookAt(target);
        if (up) {
            // Ajustement pour le vecteur "up" si nécessaire
            // Three.js look_at ne supporte pas directement le paramètre up
        }
    }

    // ============================================================================
    // ACCESSEURS ET INFORMATIONS (Godot-style)
    // ============================================================================

    /**
     * Obtient le parent Node3D (équivalent get_parent_node_3d() Godot)
     * @returns Le parent ou undefined
     */
    public get_parent_node_3d(): C_objet | undefined {
        return this._parent;
    }

    /**
     * Obtient tous les enfants (équivalent get_children() Godot)
     * @returns Liste des enfants
     */
    public get_children(): readonly C_objet[] {
        return [...this._children];
    }

    /**
     * Cherche un enfant par nom (équivalent get_node() Godot)
     * @param name Le nom de l'enfant à trouver
     * @returns L'enfant trouvé ou undefined
     */
    public get_node(name: string): C_objet | undefined {
        return this._children.find(child => child.name === name);
    }

    /**
     * Vérifie si l'objet est dans le scene tree (équivalent is_inside_tree() Godot)
     * @returns true si l'objet est dans le tree
     */
    public is_inside_tree(): boolean {
        return this._isInTree;
    }

    /**
     * Vérifie si l'objet est prêt (équivalent is_node_ready() Godot)
     * @returns true si l'objet est prêt
     */
    public is_node_ready(): boolean {
        return this._isReady;
    }

    /**
     * Obtient l'état actuel du cycle de vie
     * @returns L'état du cycle de vie
     */
    public get_lifecycle_state(): ObjectLifecycleState {
        return this._lifecycleState;
    }

    /**
     * Obtient le groupe THREE.js de l'objet
     * @returns Le groupe THREE.js
     */
    public get_group(): THREE.Group {
        return this.group;
    }

    /**
     * Obtient les informations de debug de l'objet
     * @returns Les informations de debug
     */
    public get_debug_info(): object {
        return {
            id: this.id,
            name: this.name,
            position: this.get_position(),
            rotation: this.get_rotation(),
            scale: this.get_scale(),
            visible: this.is_visible_in_tree(),
            children_count: this._children.length,
            lifecycle_state: this._lifecycleState,
            is_in_tree: this._isInTree,
            is_ready: this._isReady
        };
    }

}