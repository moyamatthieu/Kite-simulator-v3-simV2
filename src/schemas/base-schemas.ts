/**
 * base-schemas.ts - Schémas de base pour éviter les dépendances circulaires
 *
 * Ce fichier contient tous les schémas fondamentaux qui sont utilisés
 * par d'autres fichiers de schémas pour éviter les imports circulaires.
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMAS GÉOMÉTRIQUES DE BASE
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

/**
 * Schéma pour les couleurs RGBA
 */
export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).default(1)
});

// =============================================================================
// SCHÉMAS D'ÉTAT DE BASE
// =============================================================================

/**
 * Schéma pour les états du cycle de vie des objets
 */
export const ObjectLifecycleStateSchema = z.enum([
  'created',
  'initializing', 
  'active',
  'paused',
  'destroyed'
]);

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
 * Fonction utilitaire pour valider sans lever d'exception
 */
export function safeParseData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Fonction utilitaire pour valider et transformer les données
 */
export function parseData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

/**
 * Types inférés depuis les schémas Zod
 */
export type Vector2 = z.infer<typeof Vector2Schema>;
export type Vector3 = z.infer<typeof Vector3Schema>;
export type Quaternion = z.infer<typeof QuaternionSchema>;
export type Euler = z.infer<typeof EulerSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type ObjectLifecycleState = z.infer<typeof ObjectLifecycleStateSchema>;
