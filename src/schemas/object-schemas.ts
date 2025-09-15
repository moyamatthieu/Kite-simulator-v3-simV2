/**
 * object-schemas.ts - Schémas Zod pour la validation des objets et entités
 *
 * Définit les schémas pour valider les objets du jeu,
 * leurs configurations et leurs états.
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE BASE (pour éviter les dépendances circulaires)
// =============================================================================

/**
 * Schéma pour les vecteurs 3D (Three.js)
 */
const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

/**
 * Schéma pour les angles d'Euler (Three.js)
 */
const EulerSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  order: z.string().optional()
});

/**
 * Schéma pour les états du cycle de vie des objets
 */
const ObjectLifecycleStateSchema = z.enum(['created', 'initializing', 'active', 'paused', 'destroyed']);

/**
 * Fonction utilitaire pour valider les données avec gestion d'erreur
 */
function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
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

// =============================================================================
// SCHÉMAS POUR LES OBJETS DE BASE
// =============================================================================

/**
 * Schéma pour la configuration de base d'un objet
 */
export const BaseObjectConfigSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100).optional(),
  position: Vector3Schema.optional(),
  rotation: EulerSchema.optional(),
  scale: Vector3Schema.optional(),
  visible: z.boolean().default(true),
  enabled: z.boolean().default(true)
});

/**
 * Schéma pour l'état de base d'un objet
 */
export const BaseObjectStateSchema = z.object({
  lifecycleState: ObjectLifecycleStateSchema,
  position: Vector3Schema,
  rotation: EulerSchema,
  scale: Vector3Schema,
  visible: z.boolean(),
  enabled: z.boolean(),
  lastUpdate: z.number().optional(), // timestamp
  version: z.number().int().min(0).default(0)
});

// =============================================================================
// SCHÉMAS POUR LES CERF-VOLANTS
// =============================================================================

/**
 * Schéma pour la configuration d'un cerf-volant
 */
export const KiteConfigSchema = z.object({
  baseConfig: BaseObjectConfigSchema,
  mass: z.number().positive(),
  area: z.number().positive(),
  inertia: z.number().positive(),
  minHeight: z.number().min(0),
  maxHeight: z.number().positive().optional(),
  material: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

/**
 * Schéma pour l'état d'un cerf-volant
 */
export const KiteStateSchema = z.object({
  baseState: BaseObjectStateSchema,
  velocity: Vector3Schema,
  angularVelocity: Vector3Schema,
  acceleration: Vector3Schema,
  angularAcceleration: Vector3Schema,
  windForce: Vector3Schema,
  liftForce: Vector3Schema,
  dragForce: Vector3Schema,
  lineTension: z.number().min(0),
  altitude: z.number(),
  speed: z.number().min(0),
  angleOfAttack: z.number(),
  pitch: z.number(),
  yaw: z.number(),
  roll: z.number()
});

// =============================================================================
// SCHÉMAS POUR LES PILOTES
// =============================================================================

/**
 * Schéma pour la configuration d'un pilote
 */
export const PilotConfigSchema = z.object({
  baseConfig: BaseObjectConfigSchema,
  controlSensitivity: z.number().min(0).max(1).default(0.5),
  maxControlAngle: z.number().min(0).max(Math.PI).default(Math.PI / 6),
  controlResponsiveness: z.number().min(0).max(1).default(0.8),
  autoCenterSpeed: z.number().min(0).max(10).default(3.0)
});

/**
 * Schéma pour l'état d'un pilote
 */
export const PilotStateSchema = z.object({
  baseState: BaseObjectStateSchema,
  controlAngle: z.number(),
  targetAngle: z.number(),
  controlForce: z.number().min(0),
  isControlling: z.boolean(),
  controlMode: z.enum(['manual', 'auto', 'assisted']).default('manual'),
  lastInputTime: z.number().optional()
});

// =============================================================================
// SCHÉMAS POUR LES LIGNES
// =============================================================================

/**
 * Schéma pour la configuration d'une ligne
 */
export const LineConfigSchema = z.object({
  baseConfig: BaseObjectConfigSchema,
  length: z.number().positive(),
  stiffness: z.number().positive(),
  damping: z.number().min(0).max(1).default(0.9),
  maxTension: z.number().positive(),
  breakingForce: z.number().positive(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  thickness: z.number().positive().default(0.005)
});

/**
 * Schéma pour l'état d'une ligne
 */
export const LineStateSchema = z.object({
  baseState: BaseObjectStateSchema,
  tension: z.number().min(0),
  strain: z.number().min(0).max(1),
  isBroken: z.boolean().default(false),
  attachmentPoints: z.array(Vector3Schema).length(2),
  segments: z.number().int().positive().default(10),
  sag: z.number().min(0)
});

// =============================================================================
// SCHÉMAS POUR L'ENVIRONNEMENT
// =============================================================================

/**
 * Schéma pour la configuration de l'environnement
 */
export const EnvironmentConfigSchema = z.object({
  baseConfig: BaseObjectConfigSchema,
  gravity: z.number().negative(), // Gravité négative (vers le bas)
  airDensity: z.number().positive(),
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  turbulence: z.number().min(0).max(100),
  temperature: z.number().min(-50).max(50).default(20),
  humidity: z.number().min(0).max(100).default(50),
  groundLevel: z.number().default(0),
  skyBox: z.string().optional()
});

/**
 * Schéma pour l'état de l'environnement
 */
export const EnvironmentStateSchema = z.object({
  baseState: BaseObjectStateSchema,
  currentWindSpeed: z.number().min(0),
  currentWindDirection: z.number().min(0).max(360),
  turbulenceIntensity: z.number().min(0).max(1),
  temperature: z.number(),
  humidity: z.number(),
  timeOfDay: z.number().min(0).max(24).optional(),
  weatherCondition: z.enum(['clear', 'cloudy', 'rainy', 'stormy']).default('clear')
});

// =============================================================================
// SCHÉMAS POUR LES COLLECTIONS D'OBJETS
// =============================================================================

/**
 * Schéma pour une collection d'objets
 */
export const ObjectCollectionSchema = z.object({
  objects: z.array(z.object({
    id: z.string().uuid(),
    type: z.string(),
    config: z.unknown(), // Schéma spécifique selon le type
    state: z.unknown()   // Schéma spécifique selon le type
  })),
  metadata: z.object({
    version: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    totalObjects: z.number().int().min(0)
  })
});

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

export type BaseObjectConfig = z.infer<typeof BaseObjectConfigSchema>;
export type BaseObjectState = z.infer<typeof BaseObjectStateSchema>;
export type KiteConfig = z.infer<typeof KiteConfigSchema>;
export type KiteState = z.infer<typeof KiteStateSchema>;
export type PilotConfig = z.infer<typeof PilotConfigSchema>;
export type PilotState = z.infer<typeof PilotStateSchema>;
export type LineConfig = z.infer<typeof LineConfigSchema>;
export type LineState = z.infer<typeof LineStateSchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type EnvironmentState = z.infer<typeof EnvironmentStateSchema>;
export type ObjectCollection = z.infer<typeof ObjectCollectionSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES SPÉCIALISÉES
// =============================================================================

/**
 * Valide la configuration d'un cerf-volant
 */
export function validateKiteConfig(config: unknown): {
  success: true;
  data: KiteConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(KiteConfigSchema, config);
}

/**
 * Valide l'état d'un cerf-volant
 */
export function validateKiteState(state: unknown): {
  success: true;
  data: KiteState;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(KiteStateSchema, state);
}

/**
 * Valide la configuration d'un pilote
 */
export function validatePilotConfig(config: unknown): {
  success: true;
  data: PilotConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(PilotConfigSchema, config);
}

/**
 * Valide la configuration d'une ligne
 */
export function validateLineConfig(config: unknown): {
  success: true;
  data: LineConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(LineConfigSchema, config);
}

/**
 * Valide la configuration de l'environnement
 */
export function validateEnvironmentConfig(config: unknown): {
  success: true;
  data: EnvironmentConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(EnvironmentConfigSchema, config);
}
