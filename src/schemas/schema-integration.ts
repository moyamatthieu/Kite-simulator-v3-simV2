/**
 * schema-integration.ts - Intégration des schémas Zod dans les classes existantes
 *
 * Ce fichier montre comment intégrer la validation Zod dans les classes
 * existantes du simulateur pour assurer la sécurité des données.
 */

import {
  // Schémas de base
  validateData,
  parseData,

  // Schémas physiques
  PhysicsConstantsSchema,
  PhysicsConfigSchema,
  type PhysicsConstants,
  type PhysicsConfig,

  // Schémas d'objets
  ObjectKiteConfigSchema,
  ObjectKiteStateSchema,
  type ObjectKiteConfig,
  type ObjectKiteState,

  // Schémas UI
  ControlConfigSchema,
  UserPreferencesSchema,
  type ControlConfig,
  type UserPreferences
} from './index';

// =============================================================================
// CLASSES AVEC VALIDATION INTÉGRÉE
// =============================================================================

/**
 * Classe PhysicsManager avec validation Zod intégrée
 */
export class ValidatedPhysicsManager {
  private constants: PhysicsConstants | null = null;
  private config: PhysicsConfig | null = null;

  /**
   * Définit les constantes physiques avec validation
   */
  setConstants(constants: unknown): void {
    const result = validateData(PhysicsConstantsSchema, constants);

    if (!result.success) {
      throw new Error(
        `Constantes physiques invalides:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.constants = result.data;
    console.log('✅ Constantes physiques validées et définies');
  }

  /**
   * Définit la configuration physique avec validation
   */
  setConfig(config: unknown): void {
    const result = validateData(PhysicsConfigSchema, config);

    if (!result.success) {
      throw new Error(
        `Configuration physique invalide:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.config = result.data;
    console.log('✅ Configuration physique validée et définie');
  }

  /**
   * Récupère les constantes (garanties valides)
   */
  getConstants(): PhysicsConstants {
    if (!this.constants) {
      throw new Error('Constantes physiques non initialisées');
    }
    return this.constants;
  }

  /**
   * Récupère la configuration (garantie valide)
   */
  getConfig(): PhysicsConfig {
    if (!this.config) {
      throw new Error('Configuration physique non initialisée');
    }
    return this.config;
  }

  /**
   * Initialise avec des valeurs par défaut
   */
  initializeWithDefaults(): void {
    const defaultConstants: PhysicsConstants = {
      EPSILON: 1e-6,
      CONTROL_DEADZONE: 0.05,
      LINE_CONSTRAINT_TOLERANCE: 0.01,
      LINE_TENSION_FACTOR: 0.8,
      GROUND_FRICTION: 0.3,
      CATENARY_SEGMENTS: 20,
      MAX_FORCE: 1000,
      MAX_VELOCITY: 50,
      MAX_ANGULAR_VELOCITY: Math.PI * 4,
      MAX_ACCELERATION: 100,
      MAX_ANGULAR_ACCELERATION: Math.PI * 8
    };

    const defaultConfig: PhysicsConfig = {
      gravity: -9.81,
      airDensity: 1.225,
      deltaTimeMax: 1/30,
      angularDamping: 0.95,
      linearDamping: 0.98,
      angularDragCoeff: 0.1
    };

    this.setConstants(defaultConstants);
    this.setConfig(defaultConfig);
  }
}

/**
 * Classe Kite avec validation intégrée
 */
export class ValidatedKite {
  private config: ObjectKiteConfig | null = null;
  private state: ObjectKiteState | null = null;

  /**
   * Définit la configuration du cerf-volant
   */
  setConfig(config: unknown): void {
    const result = validateData(ObjectKiteConfigSchema, config);

    if (!result.success) {
      throw new Error(
        `Configuration de cerf-volant invalide:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.config = result.data;
    console.log('✅ Configuration de cerf-volant validée');
  }

  /**
   * Met à jour l'état du cerf-volant
   */
  updateState(state: unknown): void {
    const result = validateData(ObjectKiteStateSchema, state);

    if (!result.success) {
      throw new Error(
        `État de cerf-volant invalide:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.state = result.data;
  }

  /**
   * Récupère la configuration (garantie valide)
   */
  getConfig(): ObjectKiteConfig {
    if (!this.config) {
      throw new Error('Configuration non initialisée');
    }
    return this.config;
  }

  /**
   * Récupère l'état actuel (garanti valide)
   */
  getState(): ObjectKiteState {
    if (!this.state) {
      throw new Error('État non initialisé');
    }
    return this.state;
  }
}

/**
 * Classe InputHandler avec validation intégrée
 */
export class ValidatedInputHandler {
  private controlConfig: ControlConfig | null = null;

  /**
   * Définit la configuration des contrôles
   */
  setControlConfig(config: unknown): void {
    const result = validateData(ControlConfigSchema, config);

    if (!result.success) {
      throw new Error(
        `Configuration des contrôles invalide:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.controlConfig = result.data;
    console.log('✅ Configuration des contrôles validée');
  }

  /**
   * Récupère la configuration des contrôles
   */
  getControlConfig(): ControlConfig {
    if (!this.controlConfig) {
      throw new Error('Configuration des contrôles non initialisée');
    }
    return this.controlConfig;
  }
}

/**
 * Classe UserPreferencesManager avec validation intégrée
 */
export class ValidatedUserPreferencesManager {
  private preferences: UserPreferences | null = null;

  /**
   * Définit les préférences utilisateur
   */
  setPreferences(prefs: unknown): void {
    const result = validateData(UserPreferencesSchema, prefs);

    if (!result.success) {
      throw new Error(
        `Préférences utilisateur invalides:\n${JSON.stringify(result.errors, null, 2)}`
      );
    }

    this.preferences = result.data;
    console.log('✅ Préférences utilisateur validées');
  }

  /**
   * Récupère les préférences utilisateur
   */
  getPreferences(): UserPreferences {
    if (!this.preferences) {
      throw new Error('Préférences non initialisées');
    }
    return this.preferences;
  }

  /**
   * Met à jour une préférence spécifique
   */
  updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    if (!this.preferences) {
      throw new Error('Préférences non initialisées');
    }

    // Validation de la valeur mise à jour
    const updatedPrefs = { ...this.preferences, [key]: value };
    this.setPreferences(updatedPrefs);
  }
}

// =============================================================================
// GESTIONNAIRES DE VALIDATION CENTRALISÉS
// =============================================================================

/**
 * Gestionnaire centralisé pour la validation des données
 */
export class ValidationManager {
  private static instance: ValidationManager;
  private validationCache = new Map<string, boolean>();

  static getInstance(): ValidationManager {
    if (!ValidationManager.instance) {
      ValidationManager.instance = new ValidationManager();
    }
    return ValidationManager.instance;
  }

  /**
   * Valide des données avec cache
   */
  validateWithCache<T>(
    schema: any,
    data: unknown,
    cacheKey?: string
  ): { success: true; data: T } | { success: false; errors: any[] } {
    // Utilisation du cache si une clé est fournie
    if (cacheKey && this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey);
      if (cached) {
        // Si déjà validé, on refait quand même la validation pour sécurité
        const result = validateData(schema, data);
        if (result.success) {
          return { success: true, data: result.data as T };
        } else {
          return { success: false, errors: result.errors };
        }
      }
    }

    const result = validateData(schema, data);

    // Mise en cache du résultat
    if (cacheKey) {
      this.validationCache.set(cacheKey, result.success);
    }

    if (result.success) {
      return { success: true, data: result.data as T };
    } else {
      return { success: false, errors: result.errors };
    }
  }

  /**
   * Valide un lot de données
   */
  validateBatch(
    validations: Array<{
      name: string;
      schema: any;
      data: unknown;
    }>
  ): {
    allValid: boolean;
    results: Array<{
      name: string;
      success: boolean;
      errors?: any[];
      data?: any;
    }>;
  } {
    const results = validations.map(({ name, schema, data }) => {
      const result = validateData(schema, data);
      return {
        name,
        success: result.success,
        errors: result.success ? undefined : result.errors,
        data: result.success ? result.data : undefined
      };
    });

    const allValid = results.every(r => r.success);

    return { allValid, results };
  }

  /**
   * Nettoie le cache de validation
   */
  clearCache(): void {
    this.validationCache.clear();
  }
}

// =============================================================================
// UTILITAIRES POUR LA MIGRATION
// =============================================================================

/**
 * Utilitaire pour migrer des données existantes vers les schémas validés
 */
export class DataMigrationHelper {
  /**
   * Migre des constantes physiques existantes
   */
  static migratePhysicsConstants(legacyConstants: any): PhysicsConstants | null {
    try {
      // Tentative de validation directe
      const result = validateData(PhysicsConstantsSchema, legacyConstants);
      if (result.success) {
        return result.data;
      }

      // Si échec, tentative de migration
      const migrated = {
        EPSILON: legacyConstants.EPSILON ?? 1e-6,
        CONTROL_DEADZONE: legacyConstants.CONTROL_DEADZONE ?? 0.05,
        LINE_CONSTRAINT_TOLERANCE: legacyConstants.LINE_CONSTRAINT_TOLERANCE ?? 0.01,
        LINE_TENSION_FACTOR: legacyConstants.LINE_TENSION_FACTOR ?? 0.8,
        GROUND_FRICTION: legacyConstants.GROUND_FRICTION ?? 0.3,
        CATENARY_SEGMENTS: legacyConstants.CATENARY_SEGMENTS ?? 20,
        MAX_FORCE: legacyConstants.MAX_FORCE ?? 1000,
        MAX_VELOCITY: legacyConstants.MAX_VELOCITY ?? 50,
        MAX_ANGULAR_VELOCITY: legacyConstants.MAX_ANGULAR_VELOCITY ?? Math.PI * 4,
        MAX_ACCELERATION: legacyConstants.MAX_ACCELERATION ?? 100,
        MAX_ANGULAR_ACCELERATION: legacyConstants.MAX_ANGULAR_ACCELERATION ?? Math.PI * 8
      };

      const migratedResult = validateData(PhysicsConstantsSchema, migrated);
      return migratedResult.success ? migratedResult.data : null;

    } catch (error) {
      console.error('Erreur lors de la migration des constantes physiques:', error);
      return null;
    }
  }

  /**
   * Migre une configuration de cerf-volant existante
   */
  static migrateKiteConfig(legacyConfig: any): ObjectKiteConfig | null {
    try {
      const migrated = {
        baseConfig: {
          id: legacyConfig.id,
          name: legacyConfig.name,
          position: legacyConfig.position ?? { x: 0, y: 10, z: 0 },
          rotation: legacyConfig.rotation ?? { x: 0, y: 0, z: 0 },
          scale: legacyConfig.scale ?? { x: 1, y: 1, z: 1 },
          visible: legacyConfig.visible ?? true,
          enabled: legacyConfig.enabled ?? true
        },
        mass: legacyConfig.mass ?? 0.5,
        area: legacyConfig.area ?? 2.5,
        inertia: legacyConfig.inertia ?? 0.1,
        minHeight: legacyConfig.minHeight ?? 1,
        maxHeight: legacyConfig.maxHeight,
        material: legacyConfig.material,
        color: legacyConfig.color
      };

      const result = validateData(ObjectKiteConfigSchema, migrated);
      return result.success ? result.data : null;

    } catch (error) {
      console.error('Erreur lors de la migration de la configuration du cerf-volant:', error);
      return null;
    }
  }
}

// =============================================================================
// EXEMPLES D'UTILISATION
// =============================================================================

/**
 * Exemple d'utilisation des classes validées
 */
export function demonstrateValidatedClasses() {
  console.log('🚀 Démonstration des classes avec validation Zod\n');

  // PhysicsManager
  console.log('1. PhysicsManager:');
  const physicsManager = new ValidatedPhysicsManager();
  physicsManager.initializeWithDefaults();
  console.log('   Constantes:', physicsManager.getConstants().EPSILON);

  // Kite
  console.log('\n2. Kite:');
  const kite = new ValidatedKite();
  const kiteConfig = {
    baseConfig: {
      name: "Cerf-Volant Test",
      position: { x: 0, y: 10, z: 0 },
      visible: true,
      enabled: true
    },
    mass: 0.5,
    area: 2.5,
    inertia: 0.1,
    minHeight: 1,
    material: "nylon",
    color: "#FF0000"
  };
  kite.setConfig(kiteConfig);
  console.log('   Configuration définie:', kite.getConfig().baseConfig.name);

  // InputHandler
  console.log('\n3. InputHandler:');
  const inputHandler = new ValidatedInputHandler();
  const controlConfig = {
    inputType: "KEYBOARD",
    sensitivity: 0.8,
    deadzone: 0.05,
    smoothing: 0.9,
    invertY: false,
    invertX: false
  };
  inputHandler.setControlConfig(controlConfig);
  console.log('   Configuration des contrôles définie');

  // UserPreferencesManager
  console.log('\n4. UserPreferencesManager:');
  const prefsManager = new ValidatedUserPreferencesManager();
  const preferences = {
    ui: {
      theme: "dark" as const,
      language: "fr",
      showTooltips: true,
      showGrid: false,
      showAxes: true,
      cameraFollow: true,
      autoSave: true,
      autoSaveInterval: 10000
    },
    controls: controlConfig,
    debug: {
      mode: "BASIC" as const,
      showPhysics: false,
      showForces: false,
      showCollisions: false,
      showPerformance: false,
      logLevel: "info" as const,
      maxLogEntries: 100,
      updateInterval: 1000
    },
    simulation: {
      maxFrameRate: 60,
      physicsSteps: 1,
      enableInterpolation: true,
      enableShadows: true,
      enableParticles: true
    }
  };
  prefsManager.setPreferences(preferences);
  console.log('   Préférences définies');

  console.log('\n✅ Toutes les classes ont été validées avec succès!');
}

/**
 * Exemple de gestionnaire de validation
 */
export function demonstrateValidationManager() {
  console.log('🔍 Démonstration du ValidationManager\n');

  const manager = ValidationManager.getInstance();

  // Validation avec cache
  const testData = { EPSILON: 1e-6, MAX_FORCE: 1000 };
  const result1 = manager.validateWithCache(PhysicsConstantsSchema, testData, 'test-constants');
  const result2 = manager.validateWithCache(PhysicsConstantsSchema, testData, 'test-constants'); // Utilise le cache

  console.log('Validation 1:', result1.success);
  console.log('Validation 2 (cache):', result2.success);

  // Validation en lot
  const batchResult = manager.validateBatch([
    { name: 'Constants', schema: PhysicsConstantsSchema, data: testData },
    { name: 'Config', schema: PhysicsConfigSchema, data: { gravity: -9.81, airDensity: 1.225 } }
  ]);

  console.log('Validation en lot - Tous valides:', batchResult.allValid);
  batchResult.results.forEach(r => {
    console.log(`  ${r.name}: ${r.success ? '✅' : '❌'}`);
  });
}

// Export par défaut
export default {
  classes: {
    ValidatedPhysicsManager,
    ValidatedKite,
    ValidatedInputHandler,
    ValidatedUserPreferencesManager
  },
  managers: {
    ValidationManager,
    DataMigrationHelper
  },
  demos: {
    demonstrateValidatedClasses,
    demonstrateValidationManager
  }
};
