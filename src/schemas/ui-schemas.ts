/**
 * ui-schemas.ts - Schémas Zod pour la validation des interfaces utilisateur
 *
 * Définit les schémas pour valider les configurations UI,
 * les contrôles et les interactions utilisateur.
 */

import { z } from 'zod';
import { InputType, ControlKey, ControlDirection, DebugMode } from '../enum';

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
// SCHÉMAS POUR LES CONTRÔLES UTILISATEUR
// =============================================================================

/**
 * Schéma pour un événement d'entrée utilisateur
 */
export const InputEventSchema = z.object({
  type: z.nativeEnum(InputType),
  key: z.nativeEnum(ControlKey).optional(),
  direction: z.nativeEnum(ControlDirection).optional(),
  position: Vector2Schema.optional(),
  delta: Vector2Schema.optional(),
  button: z.number().int().min(0).max(2).optional(),
  pressure: z.number().min(0).max(1).optional(),
  timestamp: z.number(),
  modifiers: z.object({
    ctrl: z.boolean().default(false),
    shift: z.boolean().default(false),
    alt: z.boolean().default(false),
    meta: z.boolean().default(false)
  }).optional()
});

/**
 * Schéma pour la configuration des contrôles
 */
export const ControlConfigSchema = z.object({
  inputType: z.nativeEnum(InputType),
  sensitivity: z.number().min(0).max(1).default(0.5),
  deadzone: z.number().min(0).max(0.5).default(0.1),
  smoothing: z.number().min(0).max(1).default(0.8),
  invertY: z.boolean().default(false),
  invertX: z.boolean().default(false),
  keyBindings: z.record(z.nativeEnum(ControlKey), z.string()).optional(),
  axisBindings: z.record(z.string(), z.string()).optional()
});

/**
 * Schéma pour l'état des contrôles
 */
export const ControlStateSchema = z.object({
  activeInputs: z.array(z.nativeEnum(InputType)),
  currentDirection: z.nativeEnum(ControlDirection),
  controlAngle: z.number().min(-Math.PI).max(Math.PI),
  controlForce: z.number().min(0).max(1),
  lastInputTime: z.number(),
  inputHistory: z.array(InputEventSchema).max(100).default([]),
  isActive: z.boolean().default(false)
});

// =============================================================================
// SCHÉMAS POUR L'INTERFACE UTILISATEUR
// =============================================================================

/**
 * Schéma pour la configuration d'un élément UI
 */
export const UIElementConfigSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(['button', 'slider', 'checkbox', 'text', 'panel', 'graph']),
  position: Vector2Schema,
  size: Vector2Schema,
  visible: z.boolean().default(true),
  enabled: z.boolean().default(true),
  label: z.string().optional(),
  tooltip: z.string().optional(),
  style: z.object({
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional(),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional(),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional(),
    fontSize: z.number().positive().optional(),
    fontFamily: z.string().optional()
  }).optional()
});

/**
 * Schéma pour l'état d'un élément UI
 */
export const UIElementStateSchema = z.object({
  id: z.string(),
  visible: z.boolean(),
  enabled: z.boolean(),
  hovered: z.boolean().default(false),
  focused: z.boolean().default(false),
  pressed: z.boolean().default(false),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  lastInteraction: z.number().optional()
});

/**
 * Schéma pour la configuration d'un panneau UI
 */
export const UIPanelConfigSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().optional(),
  position: Vector2Schema,
  size: Vector2Schema,
  collapsible: z.boolean().default(true),
  resizable: z.boolean().default(false),
  movable: z.boolean().default(true),
  elements: z.array(UIElementConfigSchema),
  layout: z.enum(['vertical', 'horizontal', 'grid']).default('vertical'),
  style: z.object({
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional(),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional(),
    headerColor: z.string().regex(/^#[0-9A-Fa-f]{6,8}$/).optional()
  }).optional()
});

/**
 * Schéma pour l'état d'un panneau UI
 */
export const UIPanelStateSchema = z.object({
  id: z.string(),
  collapsed: z.boolean().default(false),
  position: Vector2Schema,
  size: Vector2Schema,
  elements: z.array(UIElementStateSchema),
  lastUpdate: z.number().optional(),
  zIndex: z.number().int().min(0).default(0)
});

// =============================================================================
// SCHÉMAS POUR LE DEBUG ET LES MÉTRIQUES
// =============================================================================

/**
 * Schéma pour la configuration du debug
 */
export const DebugConfigSchema = z.object({
  mode: z.nativeEnum(DebugMode),
  showPhysics: z.boolean().default(false),
  showForces: z.boolean().default(false),
  showCollisions: z.boolean().default(false),
  showPerformance: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  maxLogEntries: z.number().int().min(10).max(1000).default(100),
  updateInterval: z.number().positive().default(1000), // ms
  overlayPosition: Vector2Schema.optional()
});

/**
 * Schéma pour une entrée de log
 */
export const LogEntrySchema = z.object({
  timestamp: z.number(),
  level: z.enum(['error', 'warn', 'info', 'debug']),
  message: z.string(),
  category: z.string().optional(),
  data: z.unknown().optional(),
  source: z.string().optional()
});

/**
 * Schéma pour l'état du debug
 */
export const DebugStateSchema = z.object({
  mode: z.nativeEnum(DebugMode),
  logs: z.array(LogEntrySchema).max(1000),
  metrics: z.object({
    fps: z.number().min(0),
    frameTime: z.number().min(0),
    memoryUsage: z.number().min(0),
    objectCount: z.number().int().min(0),
    physicsTime: z.number().min(0),
    renderTime: z.number().min(0)
  }),
  lastUpdate: z.number(),
  isVisible: z.boolean().default(false)
});

// =============================================================================
// SCHÉMAS POUR LES MÉTRIQUES DE SIMULATION
// =============================================================================

/**
 * Schéma pour les métriques de performance
 */
export const PerformanceMetricsSchema = z.object({
  timestamp: z.number(),
  fps: z.number().min(0),
  frameTime: z.number().min(0),
  memoryUsage: z.number().min(0),
  cpuUsage: z.number().min(0).max(100),
  gpuUsage: z.number().min(0).max(100).optional(),
  physicsTime: z.number().min(0),
  renderTime: z.number().min(0),
  updateTime: z.number().min(0),
  inputTime: z.number().min(0)
});

/**
 * Schéma pour les métriques de simulation
 */
export const SimulationMetricsSchema = z.object({
  timestamp: z.number(),
  kiteAltitude: z.number(),
  kiteSpeed: z.number().min(0),
  windSpeed: z.number().min(0),
  lineTension: z.number().min(0),
  angleOfAttack: z.number(),
  controlAngle: z.number(),
  totalObjects: z.number().int().min(0),
  activeForces: z.number().int().min(0),
  collisions: z.number().int().min(0),
  simulationTime: z.number().min(0)
});

// =============================================================================
// SCHÉMAS POUR LES PRÉFÉRENCES UTILISATEUR
// =============================================================================

/**
 * Schéma pour les préférences utilisateur
 */
export const UserPreferencesSchema = z.object({
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('fr'),
    showTooltips: z.boolean().default(true),
    showGrid: z.boolean().default(false),
    showAxes: z.boolean().default(true),
    cameraFollow: z.boolean().default(true),
    autoSave: z.boolean().default(true),
    autoSaveInterval: z.number().int().min(1000).max(60000).default(10000)
  }),
  controls: ControlConfigSchema,
  debug: DebugConfigSchema,
  simulation: z.object({
    maxFrameRate: z.number().int().min(30).max(240).default(60),
    physicsSteps: z.number().int().min(1).max(10).default(1),
    enableInterpolation: z.boolean().default(true),
    enableShadows: z.boolean().default(true),
    enableParticles: z.boolean().default(true)
  })
});

// =============================================================================
// TYPES INFÉRÉS
// =============================================================================

export type InputEvent = z.infer<typeof InputEventSchema>;
export type ControlConfig = z.infer<typeof ControlConfigSchema>;
export type ControlState = z.infer<typeof ControlStateSchema>;
export type UIElementConfig = z.infer<typeof UIElementConfigSchema>;
export type UIElementState = z.infer<typeof UIElementStateSchema>;
export type UIPanelConfig = z.infer<typeof UIPanelConfigSchema>;
export type UIPanelState = z.infer<typeof UIPanelStateSchema>;
export type DebugConfig = z.infer<typeof DebugConfigSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type DebugState = z.infer<typeof DebugStateSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type SimulationMetrics = z.infer<typeof SimulationMetricsSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES SPÉCIALISÉES
// =============================================================================

/**
 * Valide un événement d'entrée
 */
export function validateInputEvent(event: unknown): {
  success: true;
  data: InputEvent;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(InputEventSchema, event);
}

/**
 * Valide la configuration des contrôles
 */
export function validateControlConfig(config: unknown): {
  success: true;
  data: ControlConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(ControlConfigSchema, config);
}

/**
 * Valide la configuration d'un élément UI
 */
export function validateUIElementConfig(config: unknown): {
  success: true;
  data: UIElementConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(UIElementConfigSchema, config);
}

/**
 * Valide la configuration d'un panneau UI
 */
export function validateUIPanelConfig(config: unknown): {
  success: true;
  data: UIPanelConfig;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(UIPanelConfigSchema, config);
}

/**
 * Valide les préférences utilisateur
 */
export function validateUserPreferences(prefs: unknown): {
  success: true;
  data: UserPreferences;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(UserPreferencesSchema, prefs);
}

/**
 * Valide les métriques de performance
 */
export function validatePerformanceMetrics(metrics: unknown): {
  success: true;
  data: PerformanceMetrics;
} | {
  success: false;
  errors: z.ZodError['issues'];
} {
  return validateData(PerformanceMetricsSchema, metrics);
}
