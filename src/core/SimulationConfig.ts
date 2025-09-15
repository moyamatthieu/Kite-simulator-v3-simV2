/**
 * SimulationConfig.ts - Configuration de simulation avec validation Zod
 * 
 * Architecture propre respectant les bonnes pratiques TypeScript, Three.js et Zod
 */

import { z } from 'zod';
import * as THREE from 'three';

// =============================================================================
// ENUMS ET CONSTANTES (Bonnes pratiques TypeScript)
// =============================================================================

export enum SimulationEnvironment {
    DEVELOPMENT = 'development',
    TESTING = 'testing',
    PRODUCTION = 'production',
    DEBUGGING = 'debugging'
}

export enum ConfigPreset {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXTREME = 'extreme'
}

export enum RenderQuality {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    ULTRA = 'ultra'
}

// =============================================================================
// SCHÉMAS ZOD AVEC VALIDATION STRICTE (Bonnes pratiques Zod)
// =============================================================================

/**
 * Schéma Vector3 avec transformation automatique Three.js
 */
const Vector3Schema = z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    z: z.number().finite()
}).transform(data => new THREE.Vector3(data.x, data.y, data.z));

/**
 * Configuration physique avec valeurs par défaut et validation stricte
 */
export const PhysicsConfigSchema = z.object({
    gravity: z.number().min(0).max(20).default(9.81),
    airDensity: z.number().positive().max(2).default(1.225),
    deltaTimeMax: z.number().positive().max(0.1).default(0.016),
    angularDamping: z.number().min(0).max(1).default(0.5),
    linearDamping: z.number().min(0).max(1).default(0.5),
    angularDragCoeff: z.number().min(0).max(1).default(0.15),
    constraintIterations: z.number().int().min(1).max(20).default(5),
    positionCorrection: z.number().min(0).max(1).default(0.8),
    velocityThreshold: z.number().positive().default(0.001),
    energyConservation: z.number().min(0).max(1).default(0.95),
    maxVelocity: z.number().positive().default(100),
    maxAngularVelocity: z.number().positive().default(50)
});

/**
 * Configuration aérodynamique avec paramètres réalistes
 */
export const AeroConfigSchema = z.object({
    liftScale: z.number().min(0).max(10).default(1),
    dragScale: z.number().min(0).max(10).default(1.0),
    liftCoefficient: z.number().min(0).max(5).default(1.0),
    stallAngle: z.number().min(0).max(Math.PI).default(Math.PI / 6),
    turbulenceResponse: z.number().min(0).max(1).default(0.8),
    wingtipLoss: z.number().min(0).max(1).default(0.1),
    aspectRatioEffect: z.number().min(0).max(2).default(1.2),
    reynoldsEffect: z.number().min(0).max(1).default(0.3)
});

/**
 * Configuration du cerf-volant avec propriétés physiques réalistes
 */
export const KiteConfigSchema = z.object({
    mass: z.number().positive().max(5).default(0.28),
    area: z.number().positive().max(10).default(0.68),
    inertia: z.number().positive().max(1).default(0.08),
    minHeight: z.number().min(0).max(5).default(0.5),
    wingspan: z.number().positive().max(5).default(1.2),
    chordLength: z.number().positive().max(2).default(0.8),
    dihedral: z.number().min(-Math.PI/4).max(Math.PI/4).default(0.1),
    camber: z.number().min(0).max(0.2).default(0.05),
    fabricDensity: z.number().positive().default(0.15),
    frameMass: z.number().positive().default(0.15),
    rigidity: z.number().min(0).max(1).default(0.7)
});

/**
 * Configuration des lignes avec propriétés dynamiques
 */
export const LinesConfigSchema = z.object({
    defaultLength: z.number().min(5).max(100).default(15),
    stiffness: z.number().positive().max(100000).default(50000),
    maxTension: z.number().positive().max(10000).default(2500),
    maxSag: z.number().min(0).max(1).default(0.015),
    catenarySagFactor: z.number().positive().max(10).default(3),
    damping: z.number().min(0).max(1).default(0.02),
    elasticity: z.number().min(0).max(1).default(0.8),
    stretchLimit: z.number().min(0).max(0.5).default(0.05),
    breakingPoint: z.number().positive().default(5000),
    windResistance: z.number().min(0).max(1).default(0.1)
});

/**
 * Configuration du vent avec modèles avancés
 */
export const WindConfigSchema = z.object({
    defaultSpeed: z.number().min(0).max(200).default(18),
    defaultDirection: z.number().min(0).max(360).default(0),
    defaultTurbulence: z.number().min(0).max(100).default(1),
    turbulenceScale: z.number().min(0).max(1).default(0.15),
    turbulenceFreqBase: z.number().min(0).max(5).default(0.3),
    turbulenceFreqY: z.number().min(0).max(5).default(1.3),
    turbulenceFreqZ: z.number().min(0).max(5).default(0.7),
    turbulenceIntensityXZ: z.number().min(0).max(2).default(0.8),
    turbulenceIntensityY: z.number().min(0).max(2).default(0.2),
    maxApparentSpeed: z.number().positive().max(100).default(25),
    gradientHeight: z.number().positive().default(50),
    gradientExponent: z.number().min(0).max(1).default(0.14),
    gustFactor: z.number().min(1).max(3).default(1.5),
    thermicStrength: z.number().min(0).max(10).default(0),
    windShear: z.number().min(0).max(1).default(0.1)
});

/**
 * Configuration de rendu Three.js optimisée
 */
export const RenderingConfigSchema = z.object({
    backgroundColor: z.number().int().min(0).max(0xFFFFFF).default(0x87CEEB),
    shadowMapSize: z.number().int().positive().default(2048),
    antialias: z.boolean().default(true),
    fogStart: z.number().positive().default(100),
    fogEnd: z.number().positive().default(1000),
    quality: z.nativeEnum(RenderQuality).default(RenderQuality.HIGH),
    pixelRatio: z.number().min(0.5).max(3).default(1),
    enablePostProcessing: z.boolean().default(false),
    bloomIntensity: z.number().min(0).max(3).default(0.3),
    tonemapping: z.number().min(0).max(5).default(1),
    exposure: z.number().min(0).max(3).default(1),
    shadowRadius: z.number().min(1).max(10).default(4),
    shadowBias: z.number().default(-0.0002)
});

/**
 * Configuration de la barre de contrôle
 */
export const ControlBarConfigSchema = z.object({
    width: z.number().positive().max(2).default(0.6),
    position: Vector3Schema.default(new THREE.Vector3(0, 1.4, 0)),
    responsiveness: z.number().min(0).max(2).default(1),
    deadZone: z.number().min(0).max(0.1).default(0.02),
    maxRotation: z.number().min(0).max(Math.PI/2).default(Math.PI/4),
    returnForce: z.number().min(0).max(10).default(2.0),
    inertia: z.number().min(0).max(1).default(0.1)
});

/**
 * Configuration des contrôles avec support avancé
 */
export const ControlConfigSchema = z.object({
    inputSmoothing: z.number().min(0).max(1).default(0.8),
    returnSpeed: z.number().positive().max(10).default(2.0),
    maxTilt: z.number().positive().max(5).default(1.0),
    sensitivity: z.number().min(0.1).max(3).default(1),
    acceleration: z.number().min(0).max(5).default(1.5),
    keyMapping: z.object({
        left: z.array(z.string()).default(['ArrowLeft', 'KeyA', 'KeyQ']),
        right: z.array(z.string()).default(['ArrowRight', 'KeyD']),
        reset: z.array(z.string()).default(['KeyR', 'Space'])
    }).default({
        left: ['ArrowLeft', 'KeyA', 'KeyQ'],
        right: ['ArrowRight', 'KeyD'],
        reset: ['KeyR', 'Space']
    }),
    gamepadSupport: z.boolean().default(true),
    vibrationFeedback: z.boolean().default(false)
});

/**
 * Configuration du pilote avec propriétés physiques
 */
export const PilotConfigSchema = z.object({
    height: z.number().positive().max(3).default(1.8),
    armLength: z.number().positive().max(2).default(0.7),
    mass: z.number().positive().max(150).default(75),
    reach: z.number().positive().max(3).default(1.2),
    stance: z.number().min(0.3).max(1).default(0.6),
    balance: z.number().min(0).max(1).default(0.8),
    experience: z.number().min(0).max(1).default(0.5)
});

/**
 * Configuration de développement pour debugging
 */
export const DevelopmentConfigSchema = z.object({
    environment: z.nativeEnum(SimulationEnvironment).default(SimulationEnvironment.PRODUCTION),
    debugMode: z.boolean().default(false),
    showStats: z.boolean().default(false),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('warn'),
    enableProfiling: z.boolean().default(false),
    hotReload: z.boolean().default(false),
    experimentalFeatures: z.boolean().default(false)
});

/**
 * Schéma principal de configuration avec métadonnées
 */
export const SimulationConfigSchema = z.object({
    physics: PhysicsConfigSchema,
    aero: AeroConfigSchema,
    kite: KiteConfigSchema,
    lines: LinesConfigSchema,
    wind: WindConfigSchema,
    rendering: RenderingConfigSchema,
    controlBar: ControlBarConfigSchema,
    control: ControlConfigSchema,
    pilot: PilotConfigSchema,
    development: DevelopmentConfigSchema,
    version: z.string().default('3.0.0'),
    preset: z.nativeEnum(ConfigPreset).default(ConfigPreset.INTERMEDIATE),
    lastModified: z.string().default(() => new Date().toISOString()),
    author: z.string().optional()
});

// =============================================================================
// TYPES EXPORTÉS (Bonnes pratiques TypeScript)
// =============================================================================

export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;
export type PhysicsConfig = z.infer<typeof PhysicsConfigSchema>;
export type AeroConfig = z.infer<typeof AeroConfigSchema>;
export type KiteConfig = z.infer<typeof KiteConfigSchema>;
export type LinesConfig = z.infer<typeof LinesConfigSchema>;
export type WindConfig = z.infer<typeof WindConfigSchema>;
export type RenderingConfig = z.infer<typeof RenderingConfigSchema>;
export type ControlBarConfig = z.infer<typeof ControlBarConfigSchema>;
export type ControlConfig = z.infer<typeof ControlConfigSchema>;
export type PilotConfig = z.infer<typeof PilotConfigSchema>;
export type DevelopmentConfig = z.infer<typeof DevelopmentConfigSchema>;

// =============================================================================
// CONFIGURATION PAR DÉFAUT
// =============================================================================

/**
 * Configuration par défaut validée par Zod
 */
export const DEFAULT_SIMULATION_CONFIG = SimulationConfigSchema.parse({
    preset: ConfigPreset.INTERMEDIATE,
    version: '3.0.0'
});

// =============================================================================
// GESTIONNAIRE DE CONFIGURATION (Singleton Pattern)
// =============================================================================

/**
 * Gestionnaire de configuration centralisé avec validation
 */
export class SimulationConfigManager {
    private static instance: SimulationConfigManager;
    private config: SimulationConfig;
    private readonly listeners = new Set<(config: SimulationConfig) => void>();
    private validationErrors: z.ZodError | null = null;

    private constructor(initialConfig?: Partial<SimulationConfig>) {
        this.config = this.createValidatedConfig(initialConfig);
    }

    /**
     * Obtient l'instance singleton
     */
    public static getInstance(initialConfig?: Partial<SimulationConfig>): SimulationConfigManager {
        if (!SimulationConfigManager.instance) {
            SimulationConfigManager.instance = new SimulationConfigManager(initialConfig);
        }
        return SimulationConfigManager.instance;
    }

    /**
     * Crée une configuration validée
     */
    private createValidatedConfig(userConfig?: Partial<SimulationConfig>): SimulationConfig {
        const baseConfig = { ...DEFAULT_SIMULATION_CONFIG };
        const mergedConfig = this.deepMerge(baseConfig, userConfig || {});
        return SimulationConfigSchema.parse(mergedConfig);
    }

    /**
     * Fusion profonde d'objets (immutable)
     */
    private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(
                    (target[key] as Record<string, any>) || {}, 
                    source[key] as Record<string, any>
                ) as T[Extract<keyof T, string>];
            } else if (source[key] !== undefined) {
                result[key] = source[key] as T[Extract<keyof T, string>];
            }
        }
        
        return result;
    }

    /**
     * Obtient la configuration actuelle (readonly)
     */
    public getConfig(): Readonly<SimulationConfig> {
        return Object.freeze({ ...this.config });
    }

    /**
     * Met à jour la configuration avec validation
     */
    public updateConfig(newConfig: Partial<SimulationConfig>): boolean {
        try {
            const mergedConfig = this.deepMerge(this.config, newConfig);
            const validatedConfig = SimulationConfigSchema.parse(mergedConfig);
            
            this.config = {
                ...validatedConfig,
                lastModified: new Date().toISOString()
            };
            
            this.validationErrors = null;
            this.notifyListeners();
            
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                this.validationErrors = error;
                console.error('Configuration validation failed:', error.issues);
            }
            return false;
        }
    }

    /**
     * Valide la configuration actuelle
     */
    public validate(): { isValid: boolean; errors?: z.ZodError } {
        try {
            SimulationConfigSchema.parse(this.config);
            return { isValid: true };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { isValid: false, errors: error };
            }
            throw error;
        }
    }

    /**
     * Ajoute un listener pour les changements
     */
    public addConfigListener(listener: (config: SimulationConfig) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notifie tous les listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.getConfig());
            } catch (error) {
                console.error('Config listener error:', error);
            }
        });
    }

    /**
     * Exporte la configuration
     */
    public exportConfig(): string {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Importe une configuration depuis JSON
     */
    public importConfig(jsonConfig: string): boolean {
        try {
            const parsed = JSON.parse(jsonConfig);
            return this.updateConfig(parsed);
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }

    /**
     * Remet aux valeurs par défaut
     */
    public resetToDefaults(): void {
        this.config = { ...DEFAULT_SIMULATION_CONFIG };
        this.notifyListeners();
    }

    /**
     * Obtient les erreurs de validation
     */
    public getValidationErrors(): z.ZodError | null {
        return this.validationErrors;
    }
}

// =============================================================================
// INSTANCE GLOBALE ET EXPORT PRINCIPAL
// =============================================================================

/**
 * Instance globale du gestionnaire (Singleton)
 */
export const configManager = SimulationConfigManager.getInstance();

/**
 * Configuration globale accessible (raccourci)
 */
export const SIMULATION_CONFIG = configManager.getConfig();

// =============================================================================
// FONCTIONS UTILITAIRES (Pure Functions)
// =============================================================================

/**
 * Valide une configuration externe
 */
export function validateConfig(config: unknown): SimulationConfig {
    return SimulationConfigSchema.parse(config);
}

/**
 * Crée une configuration avec preset
 */
export function createConfigWithPreset(preset: ConfigPreset): SimulationConfig {
    return SimulationConfigSchema.parse({ preset });
}

/**
 * Obtient la position de la barre de contrôle (Three.js Vector3)
 */
export function getControlBarPosition(config: SimulationConfig = SIMULATION_CONFIG): THREE.Vector3 {
    return config.controlBar.position.clone();
}

/**
 * Type pour les propriétés partielles en profondeur
 */
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends Record<string, any> 
        ? DeepPartial<T[K]>
        : T[K];
};

/**
 * Obtient une configuration optimisée pour l'environnement
 */
export function getEnvironmentOptimizedConfig(env: SimulationEnvironment): DeepPartial<SimulationConfig> {
    const optimizations: Record<SimulationEnvironment, DeepPartial<SimulationConfig>> = {
        [SimulationEnvironment.DEVELOPMENT]: {
            development: {
                environment: env,
                debugMode: true,
                showStats: true,
                logLevel: 'debug',
                enableProfiling: false,
                hotReload: true,
                experimentalFeatures: true
            }
        },
        [SimulationEnvironment.TESTING]: {
            development: {
                environment: env,
                debugMode: false,
                enableProfiling: true,
                logLevel: 'warn',
                showStats: false,
                hotReload: false,
                experimentalFeatures: false
            }
        },
        [SimulationEnvironment.PRODUCTION]: {
            development: {
                environment: env,
                debugMode: false,
                enableProfiling: false,
                logLevel: 'error',
                showStats: false,
                hotReload: false,
                experimentalFeatures: false
            },
            rendering: {
                quality: RenderQuality.HIGH
            }
        },
        [SimulationEnvironment.DEBUGGING]: {
            development: {
                environment: env,
                debugMode: true,
                showStats: true,
                experimentalFeatures: true,
                logLevel: 'debug',
                enableProfiling: true,
                hotReload: true
            }
        }
    };

    return optimizations[env] || {};
}

/**
 * Obtient une configuration adaptée aux performances du dispositif
 */
export function getPerformanceOptimizedConfig(): DeepPartial<SimulationConfig> {
    const isLowEndDevice = (
        navigator.hardwareConcurrency < 4 || 
        (performance as any)?.memory?.usedJSHeapSize > 50_000_000
    );

    if (isLowEndDevice) {
        return {
            rendering: {
                quality: RenderQuality.MEDIUM,
                shadowMapSize: 1024,
                pixelRatio: 1,
                enablePostProcessing: false
            },
            physics: {
                constraintIterations: 3,
                deltaTimeMax: 0.02
            }
        };
    }

    return {
        rendering: {
            quality: RenderQuality.HIGH,
            shadowMapSize: 2048,
            enablePostProcessing: true
        },
        physics: {
            constraintIterations: 8
        }
    };
}