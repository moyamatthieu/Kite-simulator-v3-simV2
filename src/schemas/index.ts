/**
 * schemas/index.ts - Schémas Zod pour la validation des données
 *
 * Ce fichier centralise tous les schémas Zod du projet pour valider
 * les données et assurer la sécurité des types.
 */

import { z } from 'zod';
import {
  KiteControlPoint,
  KiteGeometryPoint,
  ObjectLifecycleState,
  WarningType,
  DebugMode,
  InputType,
  ControlKey,
  ControlDirection,
  SimulationState
} from '../enum';

// =============================================================================
// SCHÉMAS POUR LES ENUMS
// =============================================================================

/**
 * Schéma pour les points de contrôle du cerf-volant
 */
export const KiteControlPointSchema = z.nativeEnum(KiteControlPoint);

/**
 * Schéma pour tous les points géométriques du cerf-volant
 */
export const KiteGeometryPointSchema = z.nativeEnum(KiteGeometryPoint);

/**
 * Schéma pour les états du cycle de vie des objets
 */
export const ObjectLifecycleStateSchema = z.nativeEnum(ObjectLifecycleState);

/**
 * Schéma pour les types d'avertissements
 */
export const WarningTypeSchema = z.nativeEnum(WarningType);

/**
 * Schéma pour les modes de debug
 */
export const DebugModeSchema = z.nativeEnum(DebugMode);

/**
 * Schéma pour les types d'entrée utilisateur
 */
export const InputTypeSchema = z.nativeEnum(InputType);

/**
 * Schéma pour les touches de contrôle
 */
export const ControlKeySchema = z.nativeEnum(ControlKey);

/**
 * Schéma pour les directions de contrôle
 */
export const ControlDirectionSchema = z.nativeEnum(ControlDirection);

/**
 * Schéma pour les états de simulation
 */
export const SimulationStateSchema = z.nativeEnum(SimulationState);

// =============================================================================
// SCHÉMAS POUR LES TYPES DE BASE
// =============================================================================

/**
 * Schéma pour les vecteurs 2D
 */
export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number()
});

/**
 * Schéma pour les vecteurs 3D (Three.js)
 */
export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

/**
 * Schéma pour les quaternions (Three.js)
 */
export const QuaternionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number()
});

/**
 * Schéma pour les angles d'Euler (Three.js)
 */
export const EulerSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  order: z.string().optional()
});

// =============================================================================
// SCHÉMAS POUR LES ÉTATS ET CONFIGURATIONS
// =============================================================================

/**
 * Schéma pour l'état d'un cerf-volant
 */
export const KiteStateSchema = z.object({
  position: Vector3Schema,
  velocity: Vector3Schema,
  angularVelocity: Vector3Schema,
  orientation: QuaternionSchema
});

/**
 * Schéma pour les positions des poignées de contrôle
 */
export const HandlePositionsSchema = z.object({
  left: Vector3Schema,
  right: Vector3Schema
});

/**
 * Schéma pour les paramètres du vent
 */
export const WindParamsSchema = z.object({
  speed: z.number().min(0).max(200), // km/h
  direction: z.number().min(0).max(360), // degrés
  turbulence: z.number().min(0).max(100) // pourcentage
});

/**
 * Schéma pour les forces aérodynamiques
 */
export const AerodynamicForcesSchema = z.object({
  lift: Vector3Schema,
  drag: Vector3Schema,
  torque: Vector3Schema,
  leftForce: Vector3Schema.optional(),
  rightForce: Vector3Schema.optional()
});

/**
 * Schéma pour les métriques de simulation
 */
export const SimulationMetricsSchema = z.object({
  apparentSpeed: z.number().min(0).max(100), // m/s
  liftMag: z.number().min(0),                // N
  dragMag: z.number().min(0),                // N
  lOverD: z.number().min(0),                 // ratio
  aoaDeg: z.number().min(-180).max(180)      // degrés
});

/**
 * Schéma pour la configuration d'un objet
 */
export const CObjetConfigSchema = z.object({
  name: z.string().optional(),
  id: z.string().optional(),
  position: Vector3Schema.optional(),
  rotation: EulerSchema.optional()
});

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

/**
 * Types inférés depuis les schémas Zod
 */
export type KiteState = z.infer<typeof KiteStateSchema>;
export type HandlePositions = z.infer<typeof HandlePositionsSchema>;
export type WindParams = z.infer<typeof WindParamsSchema>;
export type AerodynamicForces = z.infer<typeof AerodynamicForcesSchema>;
export type SimulationMetrics = z.infer<typeof SimulationMetricsSchema>;
export type CObjetConfig = z.infer<typeof CObjetConfigSchema>;
export type Vector3 = z.infer<typeof Vector3Schema>;
export type Quaternion = z.infer<typeof QuaternionSchema>;
export type Euler = z.infer<typeof EulerSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Fonction utilitaire pour valider les données avec gestion d'erreur
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues };
  }
}

/**
 * Fonction utilitaire pour valider et transformer les données
 */
export function parseData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// =============================================================================
// EXPORTS DES AUTRES FICHIERS DE SCHÉMAS
// =============================================================================

// Export des schémas de physique
export {
  PhysicsConstantsSchema,
  PhysicsConfigSchema,
  validatePhysicsConstants,
  type PhysicsConstants,
  type PhysicsConfig
} from './physics-schemas';

// Export des schémas d'objets
export {
  BaseObjectConfigSchema,
  BaseObjectStateSchema,
  KiteConfigSchema as ObjectKiteConfigSchema,
  KiteStateSchema as ObjectKiteStateSchema,
  PilotConfigSchema,
  PilotStateSchema,
  LineConfigSchema,
  LineStateSchema,
  EnvironmentConfigSchema,
  EnvironmentStateSchema,
  ObjectCollectionSchema,
  validateKiteConfig as validateObjectKiteConfig,
  validateKiteState as validateObjectKiteState,
  validatePilotConfig,
  validateLineConfig,
  validateEnvironmentConfig,
  type BaseObjectConfig,
  type BaseObjectState,
  type KiteConfig as ObjectKiteConfig,
  type KiteState as ObjectKiteState,
  type PilotConfig,
  type PilotState,
  type LineConfig,
  type LineState,
  type EnvironmentConfig,
  type EnvironmentState,
  type ObjectCollection
} from './object-schemas';

// Export des schémas d'interface utilisateur
export * from './ui-schemas';

// Export des schémas de rendu
export * from './render-schemas';

/**
 * Fonction utilitaire pour valider sans lever d'exception
 */
export function safeParseData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
