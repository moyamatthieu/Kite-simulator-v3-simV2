/**
 * render-schemas.ts - Schémas Zod pour la validation du rendu et de la visualisation
 *
 * Définit les schémas pour valider les configurations de rendu,
 * les matériaux, les lumières et les effets visuels.
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMAS DE BASE (pour éviter les dépendances circulaires)
// =============================================================================

/**
 * Schéma pour les vecteurs 2D
 */
const Vector2Schema = z.object({
  x: z.number(),
  y: z.number()
});

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
// SCHÉMAS POUR LES MATÉRIAUX
// =============================================================================

/**
 * Schéma pour les couleurs RGBA
 */
export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).default(1)
});

/**
 * Schéma pour les propriétés de base d'un matériau
 */
export const MaterialPropertiesSchema = z.object({
  color: ColorSchema,
  opacity: z.number().min(0).max(1).default(1),
  transparent: z.boolean().default(false),
  wireframe: z.boolean().default(false),
  visible: z.boolean().default(true),
  side: z.enum(['front', 'back', 'double']).default('front')
});

/**
 * Schéma pour un matériau de base
 */
export const BasicMaterialSchema = z.object({
  type: z.literal('basic'),
  properties: MaterialPropertiesSchema,
  texture: z.string().optional(),
  normalMap: z.string().optional(),
  roughness: z.number().min(0).max(1).optional(),
  metalness: z.number().min(0).max(1).optional()
});

/**
 * Schéma pour un matériau physique (PBR)
 */
export const PhysicalMaterialSchema = z.object({
  type: z.literal('physical'),
  properties: MaterialPropertiesSchema,
  texture: z.string().optional(),
  normalMap: z.string().optional(),
  roughness: z.number().min(0).max(1).default(0.5),
  metalness: z.number().min(0).max(1).default(0.0),
  emissive: ColorSchema.optional(),
  clearcoat: z.number().min(0).max(1).optional(),
  clearcoatRoughness: z.number().min(0).max(1).optional()
});

/**
 * Schéma générique pour tous les types de matériaux
 */
export const MaterialSchema = z.discriminatedUnion('type', [
  BasicMaterialSchema,
  PhysicalMaterialSchema
]);

// =============================================================================
// SCHÉMAS POUR LES GÉOMÉTRIES
// =============================================================================

/**
 * Schéma pour une géométrie de base
 */
export const GeometrySchema = z.object({
  type: z.enum(['box', 'sphere', 'cylinder', 'plane', 'custom']),
  parameters: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
  vertices: z.array(Vector3Schema).optional(),
  indices: z.array(z.number().int()).optional(),
  uvs: z.array(Vector2Schema).optional(),
  normals: z.array(Vector3Schema).optional()
});

/**
 * Schéma pour une géométrie de boîte
 */
export const BoxGeometrySchema = z.object({
  type: z.literal('box'),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  widthSegments: z.number().int().positive().default(1),
  heightSegments: z.number().int().positive().default(1),
  depthSegments: z.number().int().positive().default(1)
});

/**
 * Schéma pour une géométrie de sphère
 */
export const SphereGeometrySchema = z.object({
  type: z.literal('sphere'),
  radius: z.number().positive(),
  widthSegments: z.number().int().positive().default(32),
  heightSegments: z.number().int().positive().default(16),
  phiStart: z.number().default(0),
  phiLength: z.number().default(Math.PI * 2),
  thetaStart: z.number().default(0),
  thetaLength: z.number().default(Math.PI)
});

// =============================================================================
// SCHÉMAS POUR LES LUMIÈRES
// =============================================================================

/**
 * Schéma pour une lumière directionnelle
 */
export const DirectionalLightSchema = z.object({
  type: z.literal('directional'),
  color: ColorSchema,
  intensity: z.number().min(0).default(1),
  position: Vector3Schema,
  target: Vector3Schema.optional(),
  castShadow: z.boolean().default(true),
  shadow: z.object({
    mapSize: Vector2Schema.default({ x: 1024, y: 1024 }),
    camera: z.object({
      left: z.number().default(-5),
      right: z.number().default(5),
      top: z.number().default(5),
      bottom: z.number().default(-5),
      near: z.number().default(0.5),
      far: z.number().default(50)
    })
  }).optional()
});

/**
 * Schéma pour une lumière ponctuelle
 */
export const PointLightSchema = z.object({
  type: z.literal('point'),
  color: ColorSchema,
  intensity: z.number().min(0).default(1),
  position: Vector3Schema,
  distance: z.number().min(0).default(0),
  decay: z.number().min(0).default(1),
  castShadow: z.boolean().default(true),
  shadow: z.object({
    mapSize: Vector2Schema.default({ x: 1024, y: 1024 }),
    camera: z.object({
      near: z.number().default(0.5),
      far: z.number().default(500)
    })
  }).optional()
});

/**
 * Schéma pour une lumière ambiante
 */
export const AmbientLightSchema = z.object({
  type: z.literal('ambient'),
  color: ColorSchema,
  intensity: z.number().min(0).default(1)
});

/**
 * Schéma générique pour tous les types de lumières
 */
export const LightSchema = z.discriminatedUnion('type', [
  DirectionalLightSchema,
  PointLightSchema,
  AmbientLightSchema
]);

// =============================================================================
// SCHÉMAS POUR LA CAMÉRA
// =============================================================================

/**
 * Schéma pour une caméra perspective
 */
export const PerspectiveCameraSchema = z.object({
  type: z.literal('perspective'),
  fov: z.number().min(1).max(179).default(75),
  aspect: z.number().positive().default(16/9),
  near: z.number().positive().default(0.1),
  far: z.number().positive().default(1000),
  position: Vector3Schema.default({ x: 0, y: 0, z: 5 }),
  target: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  up: Vector3Schema.default({ x: 0, y: 1, z: 0 })
});

/**
 * Schéma pour une caméra orthographique
 */
export const OrthographicCameraSchema = z.object({
  type: z.literal('orthographic'),
  left: z.number().default(-1),
  right: z.number().default(1),
  top: z.number().default(1),
  bottom: z.number().default(-1),
  near: z.number().default(0.1),
  far: z.number().default(1000),
  position: Vector3Schema.default({ x: 0, y: 0, z: 5 }),
  target: Vector3Schema.default({ x: 0, y: 0, z: 0 })
});

/**
 * Schéma générique pour tous les types de caméras
 */
export const CameraSchema = z.discriminatedUnion('type', [
  PerspectiveCameraSchema,
  OrthographicCameraSchema
]);

// =============================================================================
// SCHÉMAS POUR LES EFFETS VISUELS
// =============================================================================

/**
 * Schéma pour les particules
 */
export const ParticleSystemSchema = z.object({
  count: z.number().int().positive(),
  size: z.number().positive().default(1),
  color: ColorSchema,
  lifetime: z.number().positive(),
  velocity: Vector3Schema.optional(),
  acceleration: Vector3Schema.optional(),
  texture: z.string().optional(),
  blending: z.enum(['normal', 'additive', 'multiply']).default('normal'),
  transparent: z.boolean().default(true)
});

/**
 * Schéma pour les effets de post-traitement
 */
export const PostProcessingEffectSchema = z.object({
  type: z.enum(['bloom', 'motionBlur', 'depthOfField', 'toneMapping', 'colorCorrection']),
  enabled: z.boolean().default(true),
  parameters: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional()
});

/**
 * Schéma pour la configuration du rendu
 */
export const RenderConfigSchema = z.object({
  antialias: z.boolean().default(true),
  shadows: z.boolean().default(true),
  shadowMapSize: Vector2Schema.default({ x: 2048, y: 2048 }),
  toneMapping: z.enum(['none', 'linear', 'reinhard', 'cineon', 'aces']).default('none'),
  toneMappingExposure: z.number().min(0).default(1),
  outputEncoding: z.enum(['linear', 'sRGB', 'gamma']).default('sRGB'),
  physicallyCorrectLights: z.boolean().default(false),
  pixelRatio: z.number().min(0.1).max(2).default(1),
  clearColor: ColorSchema.default({ r: 0.5, g: 0.7, b: 1.0, a: 1.0 }),
  fog: z.object({
    enabled: z.boolean().default(false),
    color: ColorSchema.optional(),
    near: z.number().positive().optional(),
    far: z.number().positive().optional()
  }).optional()
});

// =============================================================================
// SCHÉMAS POUR LES OBJETS DE RENDU
// =============================================================================

/**
 * Schéma pour un objet de rendu de base
 */
export const RenderObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  geometry: GeometrySchema,
  material: MaterialSchema,
  position: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  rotation: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  scale: Vector3Schema.default({ x: 1, y: 1, z: 1 }),
  visible: z.boolean().default(true),
  castShadow: z.boolean().default(true),
  receiveShadow: z.boolean().default(true),
  renderOrder: z.number().int().default(0),
  layers: z.number().int().min(0).default(0)
});

/**
 * Schéma pour une scène de rendu
 */
export const SceneSchema = z.object({
  name: z.string().optional(),
  background: z.union([ColorSchema, z.string()]).optional(), // URL de texture
  environment: z.string().optional(), // URL d'environnement
  objects: z.array(RenderObjectSchema),
  lights: z.array(LightSchema),
  camera: CameraSchema,
  fog: z.object({
    type: z.enum(['linear', 'exponential']),
    color: ColorSchema,
    near: z.number().positive().optional(),
    far: z.number().positive().optional(),
    density: z.number().positive().optional()
  }).optional()
});

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

export type Color = z.infer<typeof ColorSchema>;
export type MaterialProperties = z.infer<typeof MaterialPropertiesSchema>;
export type BasicMaterial = z.infer<typeof BasicMaterialSchema>;
export type PhysicalMaterial = z.infer<typeof PhysicalMaterialSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type BoxGeometry = z.infer<typeof BoxGeometrySchema>;
export type SphereGeometry = z.infer<typeof SphereGeometrySchema>;
export type DirectionalLight = z.infer<typeof DirectionalLightSchema>;
export type PointLight = z.infer<typeof PointLightSchema>;
export type AmbientLight = z.infer<typeof AmbientLightSchema>;
export type Light = z.infer<typeof LightSchema>;
export type PerspectiveCamera = z.infer<typeof PerspectiveCameraSchema>;
export type OrthographicCamera = z.infer<typeof OrthographicCameraSchema>;
export type Camera = z.infer<typeof CameraSchema>;
export type ParticleSystem = z.infer<typeof ParticleSystemSchema>;
export type PostProcessingEffect = z.infer<typeof PostProcessingEffectSchema>;
export type RenderConfig = z.infer<typeof RenderConfigSchema>;
export type RenderObject = z.infer<typeof RenderObjectSchema>;
export type Scene = z.infer<typeof SceneSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES SPÉCIALISÉES
// =============================================================================

/**
 * Valide un matériau
 */
export function validateMaterial(material: unknown): {
  success: true;
  data: Material;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(MaterialSchema, material);
}

/**
 * Valide une lumière
 */
export function validateLight(light: unknown): {
  success: true;
  data: Light;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(LightSchema, light);
}

/**
 * Valide une caméra
 */
export function validateCamera(camera: unknown): {
  success: true;
  data: Camera;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(CameraSchema, camera);
}

/**
 * Valide la configuration de rendu
 */
export function validateRenderConfig(config: unknown): {
  success: true;
  data: RenderConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(RenderConfigSchema, config);
}

/**
 * Valide un objet de rendu
 */
export function validateRenderObject(obj: unknown): {
  success: true;
  data: RenderObject;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(RenderObjectSchema, obj);
}

/**
 * Valide une scène
 */
export function validateScene(scene: unknown): {
  success: true;
  data: Scene;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(SceneSchema, scene);
}
