/**
 * E_ObjectLifecycleState.ts - États du cycle de vie d'un objet
 *
 * Définit les différents états du cycle de vie d'un C_objet,
 * inspiré par le Node de Godot. Gère l'initialisation,
 * l'entrée/sortie de l'arbre de scène et la destruction.
 */

export enum E_ObjectLifecycleState {
    CREATED = 'created',           // Objet créé mais pas encore ajouté à l'arbre
    ENTERING_TREE = 'entering',    // En cours d'ajout à l'arbre de scène
    IN_TREE = 'in_tree',           // Dans l'arbre de scène, _enter_tree() a été appelé
    READY = 'ready',               // Prêt à l'emploi, _ready() a été appelé
    EXITING_TREE = 'exiting',      // En cours de suppression de l'arbre
    DISPOSED = 'disposed'          // Objet détruit et ressources libérées
}
