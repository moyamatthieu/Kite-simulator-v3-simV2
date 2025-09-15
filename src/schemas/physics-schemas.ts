/**
 * physics-schemas.ts - Schémas Zod pour la validation des données physiques
 *
 * Définit les schémas pour valider les paramètres physiques,
 * les constantes et les configurations de simulation.
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE BASE
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
// CONSTANTES PHYSIQUES
// =============================================================================

/**
 * Schéma pour les constantes physiques
 */
export const PhysicsConstantsSchema = z.object({
  EPSILON: z.number().positive(),
  CONTROL_DEADZONE: z.number().min(0).max(1),
  LINE_CONSTRAINT_TOLERANCE: z.number().positive(),
  LINE_TENSION_FACTOR: z.number().min(0).max(1),
  GROUND_FRICTION: z.number().min(0).max(1),
  CATENARY_SEGMENTS: z.number().int().positive(),
  MAX_FORCE: z.number().positive(),
  MAX_VELOCITY: z.number().positive(),
  MAX_ANGULAR_VELOCITY: z.number().positive(),
  MAX_ACCELERATION: z.number().positive(),
  MAX_ANGULAR_ACCELERATION: z.number().positive()
});

// =============================================================================
// CONFIGURATION DE SIMULATION
// =============================================================================

/**
 * Schéma pour la configuration physique
 */
export const PhysicsConfigSchema = z.object({
  gravity: z.number(),
  airDensity: z.number().positive(),
  deltaTimeMax: z.number().positive(),
  angularDamping: z.number().min(0).max(1),
  linearDamping: z.number().min(0).max(1),
  angularDragCoeff: z.number().min(0).max(1)
});

/**
 * Schéma pour la configuration aérodynamique
 */
export const AeroConfigSchema = z.object({
  liftScale: z.number().positive(),
  dragScale: z.number().positive()
});

/**
 * Schéma pour la configuration du cerf-volant
 */
export const KiteConfigSchema = z.object({
  mass: z.number().positive(),
  area: z.number().positive(),
  inertia: z.number().positive(),
  minHeight: z.number().min(0)
});

/**
 * Schéma pour la configuration des lignes
 */
export const LinesConfigSchema = z.object({
  defaultLength: z.number().positive(),
  stiffness: z.number().positive(),
  maxTension: z.number().positive(),
  maxSag: z.number().min(0).max(1),
  catenarySagFactor: z.number().positive()
});

/**
 * Schéma pour la configuration du vent
 */
export const WindConfigSchema = z.object({
  defaultSpeed: z.number().min(0),
  defaultDirection: z.number().min(0).max(360),
  defaultTurbulence: z.number().min(0).max(100),
  turbulenceScale: z.number().positive(),
  turbulenceFreqBase: z.number().positive(),
  turbulenceFreqY: z.number().positive(),
  turbulenceFreqZ: z.number().positive(),
  turbulenceIntensityXZ: z.number().min(0).max(1),
  turbulenceIntensityY: z.number().min(0).max(1),
  maxApparentSpeed: z.number().positive()
});

/**
 * Schéma pour la configuration du rendu
 */
export const RenderingConfigSchema = z.object({
  shadowMapSize: z.number().int().positive(),
  antialias: z.boolean(),
  fogStart: z.number().min(0),
  fogEnd: z.number().positive()
});

/**
 * Schéma pour la configuration de la barre de contrôle
 */
export const ControlBarConfigSchema = z.object({
  width: z.number().positive(),
  position: Vector3Schema
});

/**
 * Schéma complet de configuration de simulation
 */
export const SimulationConfigSchema = z.object({
  physics: PhysicsConfigSchema,
  aero: AeroConfigSchema,
  kite: KiteConfigSchema,
  lines: LinesConfigSchema,
  wind: WindConfigSchema,
  rendering: RenderingConfigSchema,
  controlBar: ControlBarConfigSchema
}).refine((data) => {
  // Validation croisée : fogStart doit être inférieur à fogEnd
  return data.rendering.fogStart < data.rendering.fogEnd;
}, {
  message: "fogStart doit être inférieur à fogEnd",
  path: ["rendering"]
});

// =============================================================================
// GÉOMÉTRIE DU CERF-VOLANT
// =============================================================================

/**
 * Schéma pour un point géométrique
 */
export const GeometryPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

/**
 * Schéma pour une surface (triangle)
 */
export const SurfaceSchema = z.object({
  vertices: z.array(GeometryPointSchema).length(3),
  area: z.number().positive()
});

/**
 * Schéma pour la géométrie complète du cerf-volant
 */
export const KiteGeometrySchema = z.object({
  POINTS: z.record(z.string(), GeometryPointSchema),
  SURFACES: z.array(SurfaceSchema),
  TOTAL_AREA: z.number().positive()
});

// =============================================================================
// DONNÉES AÉRODYNAMIQUES
// =============================================================================

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
 * Schéma pour les métriques aérodynamiques
 */
export const AerodynamicMetricsSchema = z.object({
  apparentSpeed: z.number().min(0),
  liftMag: z.number(),
  dragMag: z.number(),
  lOverD: z.number().min(0),
  aoaDeg: z.number()
});

// =============================================================================
// DONNÉES DE CONTRAINTE DES LIGNES
// =============================================================================

/**
 * Schéma pour les tensions des lignes
 */
export const LineTensionsSchema = z.object({
  leftForce: Vector3Schema,
  rightForce: Vector3Schema,
  torque: Vector3Schema
});

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

export type PhysicsConstants = z.infer<typeof PhysicsConstantsSchema>;
export type PhysicsConfig = z.infer<typeof PhysicsConfigSchema>;
export type AeroConfig = z.infer<typeof AeroConfigSchema>;
export type KiteConfig = z.infer<typeof KiteConfigSchema>;
export type LinesConfig = z.infer<typeof LinesConfigSchema>;
export type WindConfig = z.infer<typeof WindConfigSchema>;
export type RenderingConfig = z.infer<typeof RenderingConfigSchema>;
export type ControlBarConfig = z.infer<typeof ControlBarConfigSchema>;
export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;
export type GeometryPoint = z.infer<typeof GeometryPointSchema>;
export type Surface = z.infer<typeof SurfaceSchema>;
export type KiteGeometry = z.infer<typeof KiteGeometrySchema>;
export type AerodynamicForces = z.infer<typeof AerodynamicForcesSchema>;
export type AerodynamicMetrics = z.infer<typeof AerodynamicMetricsSchema>;
export type LineTensions = z.infer<typeof LineTensionsSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES SPÉCIALISÉES
// =============================================================================

/**
 * Valide une configuration de simulation complète
 */
export function validateSimulationConfig(config: unknown): {
  success: true;
  data: SimulationConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(SimulationConfigSchema, config);
}

/**
 * Valide les paramètres physiques
 */
export function validatePhysicsConstants(constants: unknown): {
  success: true;
  data: PhysicsConstants;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(PhysicsConstantsSchema, constants);
}

/**
 * Valide la géométrie du cerf-volant
 */
export function validateKiteGeometry(geometry: unknown): {
  success: true;
  data: KiteGeometry;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(KiteGeometrySchema, geometry);
}
