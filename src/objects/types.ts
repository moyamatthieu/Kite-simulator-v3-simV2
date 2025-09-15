/**
 * types.ts - Types et interfaces dérivés des schémas Zod
 */

import { z } from 'zod';
import * as THREE from 'three';
import { Vector3Schema, QuaternionSchema } from '../schemas';

// =============================================================================
// SCHÉMAS ZOD POUR LA GÉOMÉTRIE
// =============================================================================

/**
 * Schéma pour un point 3D avec méthode clone
 */
export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

/**
 * Schéma pour la configuration de base des objets C_objet
 */
export const C_objetConfigSchema = z.object({
  name: z.string().optional(),
  id: z.string().optional(),
  position: Vector3Schema.optional(),
  rotation: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    order: z.string().optional()
  }).optional(),
  scale: Vector3Schema.optional(),
  visible: z.boolean().default(true)
});

/**
 * Schéma pour la configuration des objets 3D Kite
 */
export const KiteConfigSchema = C_objetConfigSchema.extend({
  color: z.string().optional(),
  wireframe: z.boolean().default(false),
  showPoints: z.boolean().default(false),
  showFrame: z.boolean().default(true),
  showSails: z.boolean().default(true),
  showLabels: z.boolean().default(false),
  aerodynamic: z.boolean().default(true),
  sailColor: z.number().optional(),
  frameColor: z.number().optional()
});

/**
 * Schéma pour la configuration des labels
 */
export const C_labelConfigSchema = C_objetConfigSchema.extend({
  text: z.string(),
  target: z.any().optional(), // C_objet
  fontSize: z.number().positive().default(10),
  color: z.string().default('#ffffff'),
  backgroundColor: z.string().default('rgba(0, 0, 0, 0.6)'),
  offset: Vector3Schema.optional(),
  fadeDistance: z.number().positive().default(5),
  maxDistance: z.number().positive().default(15),
  scaleMode: z.enum(['fixed', 'adaptive', 'distance']).default('distance'),
  baseScale: z.number().positive().default(0.1),
  minScale: z.number().positive().default(0.05),
  maxScale: z.number().positive().default(0.3),
  distanceScaling: z.boolean().default(true),
  // Propriétés héritées de KiteConfig pour compatibility
  wireframe: z.boolean().default(false),
  showPoints: z.boolean().default(false),
  showFrame: z.boolean().default(true),
  showSails: z.boolean().default(true),
  showLabels: z.boolean().default(false),
  aerodynamic: z.boolean().default(true),
  sailColor: z.number().optional(),
  frameColor: z.number().optional()
});

/**
 * Schéma pour les objets poolables
 */
export const IPoolableSchema = z.object({
  reset: z.function(),
  dispose: z.function().optional()
});

/**
 * Schéma pour l'état physique
 */
export const PhysicsStateSchema = z.object({
  position: Vector3Schema,
  velocity: Vector3Schema,
  acceleration: Vector3Schema,
  quaternion: QuaternionSchema,
  angularVelocity: Vector3Schema
});

// =============================================================================
// TYPES INFÉRÉS DEPUIS ZOD
// =============================================================================

/**
 * Types TypeScript inférés automatiquement depuis les schémas Zod
 */
export type Point = z.infer<typeof PointSchema> & {
  clone(): Point;
};

// Use Partial<> so constructors can accept partial config objects (defaults are applied elsewhere)
export type KiteConfig = Partial<z.infer<typeof KiteConfigSchema>>;
export type C_labelConfig = Partial<z.infer<typeof C_labelConfigSchema>>;
export type C_objetConfig = Partial<z.infer<typeof C_objetConfigSchema>>;
export type IPoolable<T> = z.infer<typeof IPoolableSchema>;
export type PhysicsState = z.infer<typeof PhysicsStateSchema>;

// Configuration par défaut pour C_objet (compatibilité)
export const DefaultObjetConfig: C_objetConfig = {
  visible: true
};

// Configuration par défaut pour KiteConfig
export const DefaultKiteConfig: KiteConfig = {
  visible: true,
  wireframe: false,
  showPoints: false,
  showFrame: true,
  showSails: true,
  showLabels: false,
  aerodynamic: true
};

// =============================================================================
// FONCTIONS DE VALIDATION
// =============================================================================

/**
 * Valide une configuration de Kite
 */
export function validateKiteConfig(config: unknown): KiteConfig {
  return KiteConfigSchema.parse(config);
}

/**
 * Valide une configuration de label
 */
export function validateLabelConfig(config: unknown): C_labelConfig {
  return C_labelConfigSchema.parse(config);
}

/**
 * Valide un état physique
 */
export function validatePhysicsState(state: unknown): PhysicsState {
  return PhysicsStateSchema.parse(state);
}

// Export par défaut pour la compatibilité
export default {
  PointSchema,
  KiteConfigSchema,
  C_labelConfigSchema,
  IPoolableSchema,
  PhysicsStateSchema,
  validateKiteConfig,
  validateLabelConfig,
  validatePhysicsState
};