/**
 * PhysicsConstants.ts - Constantes physiques pures avec validation Zod
 *
 * Responsabilité unique : Définir les limites et constantes physiques
 * de la simulation avec validation runtime.
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMA ZOD POUR LES CONSTANTES PHYSIQUES
// =============================================================================

/**
 * Schéma de validation pour les constantes physiques
 * Assure que toutes les valeurs sont dans des plages cohérentes
 */
export const PhysicsConstantsSchema = z.object({
    // Constantes numériques de base
    EPSILON: z.number().positive().max(1e-3),
    CONTROL_DEADZONE: z.number().min(0).max(0.1),

    // Contraintes de lignes
    LINE_CONSTRAINT_TOLERANCE: z.number().positive().max(0.1),
    LINE_TENSION_FACTOR: z.number().min(0.8).max(1.0),
    CATENARY_SEGMENTS: z.number().int().min(3).max(20),

    // Friction et résistances
    GROUND_FRICTION: z.number().min(0).max(1),

    // Limites de sécurité physique
    MAX_FORCE: z.number().positive().max(10000),           // Newton
    MAX_VELOCITY: z.number().positive().max(100),          // m/s
    MAX_ANGULAR_VELOCITY: z.number().positive().max(50),   // rad/s
    MAX_ACCELERATION: z.number().positive().max(1000),     // m/s²
    MAX_ANGULAR_ACCELERATION: z.number().positive().max(100) // rad/s²
});

// =============================================================================
// CONSTANTES PHYSIQUES VALIDÉES
// =============================================================================

/**
 * Les règles physiques du monde virtuel
 * Toutes les valeurs sont validées par Zod à l'initialisation
 */
export const PHYSICS_CONSTANTS = PhysicsConstantsSchema.parse({
    // Un tout petit nombre pour dire "presque zéro"
    EPSILON: 1e-4,

    // La barre ne réagit pas si vous la bougez très peu
    CONTROL_DEADZONE: 0.01,

    // Tolérance augmentée pour réduire les oscillations (2cm)
    LINE_CONSTRAINT_TOLERANCE: 0.02,

    // Les lignes restent un peu plus courtes pour rester tendues
    LINE_TENSION_FACTOR: 0.99,

    // Le sol freine le kite de 15% s'il le touche
    GROUND_FRICTION: 0.85,

    // Nombre de points pour dessiner la courbe des lignes
    CATENARY_SEGMENTS: 5,

    // === LIMITES DE SÉCURITÉ ===
    // Pour que la simulation ne devienne pas folle

    // Force max pour montée au zénith
    MAX_FORCE: 2500,

    // Vitesse max : 40 m/s = 144 km/h
    MAX_VELOCITY: 40,

    // Rotation max réduite pour moins d'oscillations
    MAX_ANGULAR_VELOCITY: 15,

    // Accélération max augmentée pour éviter les coupures
    MAX_ACCELERATION: 500,

    // La rotation ne peut pas s'emballer
    MAX_ANGULAR_ACCELERATION: 12
});

// =============================================================================
// TYPES EXPORTÉS
// =============================================================================

/**
 * Type inféré depuis le schéma Zod
 */
export type PhysicsConstants = z.infer<typeof PhysicsConstantsSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Valide des constantes physiques personnalisées
 */
export function validatePhysicsConstants(constants: unknown): PhysicsConstants {
    return PhysicsConstantsSchema.parse(constants);
}

/**
 * Vérifie si une valeur est considérée comme nulle (epsilon)
 */
export function isNearZero(value: number): boolean {
    return Math.abs(value) < PHYSICS_CONSTANTS.EPSILON;
}

/**
 * Limite une valeur selon les constantes physiques
 */
export function clampPhysicsValue(
    value: number,
    type: 'force' | 'velocity' | 'angular_velocity' | 'acceleration' | 'angular_acceleration'
): number {
    const limits = {
        force: PHYSICS_CONSTANTS.MAX_FORCE,
        velocity: PHYSICS_CONSTANTS.MAX_VELOCITY,
        angular_velocity: PHYSICS_CONSTANTS.MAX_ANGULAR_VELOCITY,
        acceleration: PHYSICS_CONSTANTS.MAX_ACCELERATION,
        angular_acceleration: PHYSICS_CONSTANTS.MAX_ANGULAR_ACCELERATION
    };

    const limit = limits[type];
    return Math.max(-limit, Math.min(limit, value));
}