/**
 * schema-examples.ts - Exemples d'utilisation des schémas Zod
 *
 * Ce fichier montre comment utiliser les schémas Zod pour valider
 * les données dans le simulateur de cerf-volant.
 */

import {
  // Schémas de base
  Vector3Schema,
  Vector2Schema,
  ColorSchema,

  // Schémas d'enums
  KiteControlPointSchema,
  SimulationStateSchema,

  // Schémas de physique
  PhysicsConstantsSchema,
  PhysicsConfigSchema,

  // Schémas d'objets
  ObjectKiteConfigSchema,
  ObjectKiteStateSchema,
  PilotConfigSchema,

  // Schémas UI
  InputEventSchema,
  ControlConfigSchema,
  UserPreferencesSchema,

  // Schémas de rendu
  MaterialSchema,
  LightSchema,
  CameraSchema,

  // Fonctions utilitaires
  validateData,
  parseData
} from './index';

// =============================================================================
// EXEMPLES DE DONNÉES VALIDES
// =============================================================================

/**
 * Exemple de constantes physiques valides
 */
export const examplePhysicsConstants = {
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

/**
 * Exemple de configuration physique valide
 */
export const examplePhysicsConfig = {
  gravity: -9.81,
  airDensity: 1.225,
  deltaTimeMax: 1/30,
  angularDamping: 0.95,
  linearDamping: 0.98,
  angularDragCoeff: 0.1
};

/**
 * Exemple de configuration de cerf-volant valide
 */
export const exampleKiteConfig = {
  baseConfig: {
    id: "kite-001",
    name: "Test Kite",
    position: { x: 0, y: 10, z: 0 },
    visible: true,
    enabled: true
  },
  mass: 0.5,
  area: 2.5,
  inertia: 0.1,
  minHeight: 1,
  maxHeight: 100,
  material: "nylon",
  color: "#FF0000"
};

/**
 * Exemple d'état de cerf-volant valide
 */
export const exampleKiteState = {
  baseState: {
    lifecycleState: "ENTERING_TREE",
    position: { x: 5, y: 15, z: 2 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    enabled: true,
    lastUpdate: Date.now(),
    version: 1
  },
  velocity: { x: 2, y: 1, z: -0.5 },
  angularVelocity: { x: 0, y: 0.1, z: 0 },
  acceleration: { x: 0, y: -9.81, z: 0 },
  angularAcceleration: { x: 0, y: 0, z: 0 },
  windForce: { x: 1, y: 0.5, z: 0 },
  liftForce: { x: 0, y: 8, z: 0 },
  dragForce: { x: -0.5, y: 0, z: 0 },
  lineTension: 50,
  altitude: 15,
  speed: 2.5,
  angleOfAttack: 0.2,
  pitch: 0.1,
  yaw: 0,
  roll: 0
};

/**
 * Exemple d'événement d'entrée valide
 */
export const exampleInputEvent = {
  type: "KEYBOARD",
  key: "ArrowLeft",
  direction: "LEFT",
  timestamp: Date.now(),
  modifiers: {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false
  }
};

/**
 * Exemple de configuration de contrôles valide
 */
export const exampleControlConfig = {
  inputType: "KEYBOARD",
  sensitivity: 0.8,
  deadzone: 0.05,
  smoothing: 0.9,
  invertY: false,
  invertX: false,
  keyBindings: {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down"
  }
};

/**
 * Exemple de matériau valide
 */
export const exampleMaterial = {
  type: "physical",
  properties: {
    color: { r: 1, g: 0, b: 0, a: 1 },
    opacity: 1,
    transparent: false,
    wireframe: false,
    visible: true,
    side: "front"
  },
  texture: "kite-texture.png",
  normalMap: "kite-normal.png",
  roughness: 0.3,
  metalness: 0.1,
  emissive: { r: 0, g: 0, b: 0, a: 1 }
};

/**
 * Exemple de lumière valide
 */
export const exampleLight = {
  type: "directional",
  color: { r: 1, g: 1, b: 0.9, a: 1 },
  intensity: 1,
  position: { x: 10, y: 10, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  castShadow: true
};

/**
 * Exemple de caméra valide
 */
export const exampleCamera = {
  type: "perspective",
  fov: 75,
  aspect: 16/9,
  near: 0.1,
  far: 1000,
  position: { x: 0, y: 5, z: 10 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 }
};

// =============================================================================
// EXEMPLES D'UTILISATION DES SCHÉMAS
// =============================================================================

/**
 * Exemple de validation de constantes physiques
 */
export function validateExamplePhysicsConstants() {
  const result = validateData(PhysicsConstantsSchema, examplePhysicsConstants);

  if (result.success) {
    console.log("✅ Constantes physiques valides:", result.data);
    return result.data;
  } else {
    console.error("❌ Erreurs de validation:", result.errors);
    return null;
  }
}

/**
 * Exemple de validation de configuration de cerf-volant
 */
export function validateExampleKiteConfig() {
  const result = validateData(ObjectKiteConfigSchema, exampleKiteConfig);

  if (result.success) {
    console.log("✅ Configuration de cerf-volant valide:", result.data);
    return result.data;
  } else {
    console.error("❌ Erreurs de validation:", result.errors);
    return null;
  }
}

/**
 * Exemple de validation d'événement d'entrée
 */
export function validateExampleInputEvent() {
  const result = validateData(InputEventSchema, exampleInputEvent);

  if (result.success) {
    console.log("✅ Événement d'entrée valide:", result.data);
    return result.data;
  } else {
    console.error("❌ Erreurs de validation:", result.errors);
    return null;
  }
}

/**
 * Exemple de parsing avec transformation automatique
 */
export function parseExampleMaterial() {
  try {
    const material = parseData(MaterialSchema, exampleMaterial);
    console.log("✅ Matériau parsé avec succès:", material);
    return material;
  } catch (error) {
    console.error("❌ Erreur de parsing:", error);
    return null;
  }
}

/**
 * Exemple de validation en chaîne
 */
export function validateSimulationSetup() {
  // Validation individuelle pour éviter les conflits de types
  const physicsConstantsResult = validateData(PhysicsConstantsSchema, examplePhysicsConstants);
  const physicsConfigResult = validateData(PhysicsConfigSchema, examplePhysicsConfig);
  const kiteConfigResult = validateData(ObjectKiteConfigSchema, exampleKiteConfig);
  const controlConfigResult = validateData(ControlConfigSchema, exampleControlConfig);

  const results = [
    { name: "Physics Constants", success: physicsConstantsResult.success, errors: physicsConstantsResult.success ? [] : physicsConstantsResult.errors },
    { name: "Physics Config", success: physicsConfigResult.success, errors: physicsConfigResult.success ? [] : physicsConfigResult.errors },
    { name: "Kite Config", success: kiteConfigResult.success, errors: kiteConfigResult.success ? [] : kiteConfigResult.errors },
    { name: "Control Config", success: controlConfigResult.success, errors: controlConfigResult.success ? [] : controlConfigResult.errors }
  ];

  const allValid = results.every(r => r.success);

  if (allValid) {
    console.log("✅ Toutes les configurations sont valides!");
  } else {
    console.error("❌ Certaines configurations sont invalides:");
    results.filter(r => !r.success).forEach(r => {
      console.error(`  - ${r.name}:`, r.errors);
    });
  }

  return { allValid, results };
}

// =============================================================================
// EXEMPLES DE DONNÉES INVALIDE POUR LES TESTS
// =============================================================================

/**
 * Exemple de données invalides pour tester la validation
 */
export const invalidExamples = {
  // Constante négative invalide
  invalidPhysicsConstants: {
    ...examplePhysicsConstants,
    EPSILON: -1 // Devrait être positif
  },

  // Couleur invalide
  invalidColor: {
    r: 1.5, // Devrait être entre 0 et 1
    g: 1,
    b: 1,
    a: 1
  },

  // Vecteur 3D avec valeurs manquantes
  invalidVector3: {
    x: 1,
    // y et z manquants
  },

  // Configuration de cerf-volant avec masse négative
  invalidKiteConfig: {
    ...exampleKiteConfig,
    mass: -1 // Devrait être positif
  }
};

/**
 * Test de validation avec des données invalides
 */
export function testInvalidDataValidation() {
  console.log("🧪 Test de validation avec des données invalides:");

  // Test des constantes physiques invalides
  const invalidConstantsResult = validateData(PhysicsConstantsSchema, invalidExamples.invalidPhysicsConstants);
  console.log("Constantes invalides:", invalidConstantsResult.success ? "✅ Inattendu" : "❌ Correctement rejeté");

  // Test de couleur invalide
  const invalidColorResult = validateData(ColorSchema, invalidExamples.invalidColor);
  console.log("Couleur invalide:", invalidColorResult.success ? "✅ Inattendu" : "❌ Correctement rejeté");

  // Test de vecteur invalide
  const invalidVectorResult = validateData(Vector3Schema, invalidExamples.invalidVector3);
  console.log("Vecteur invalide:", invalidVectorResult.success ? "✅ Inattendu" : "❌ Correctement rejeté");

  // Test de configuration de cerf-volant invalide
  const invalidKiteResult = validateData(ObjectKiteConfigSchema, invalidExamples.invalidKiteConfig);
  console.log("Configuration cerf-volant invalide:", invalidKiteResult.success ? "✅ Inattendu" : "❌ Correctement rejeté");
}

// =============================================================================
// EXEMPLE D'INTÉGRATION DANS UNE CLASSE
// =============================================================================

/**
 * Exemple de classe utilisant les schémas Zod pour la validation
 */
export class ValidatedKiteSimulator {
  private physicsConstants: any = null;
  private kiteConfig: any = null;

  /**
   * Définit les constantes physiques avec validation
   */
  setPhysicsConstants(constants: unknown) {
    const result = validateData(PhysicsConstantsSchema, constants);

    if (!result.success) {
      throw new Error(`Constantes physiques invalides: ${JSON.stringify(result.errors, null, 2)}`);
    }

    this.physicsConstants = result.data;
    console.log("✅ Constantes physiques définies:", this.physicsConstants);
  }

  /**
   * Définit la configuration du cerf-volant avec validation
   */
  setKiteConfig(config: unknown) {
    const result = validateData(ObjectKiteConfigSchema, config);

    if (!result.success) {
      throw new Error(`Configuration de cerf-volant invalide: ${JSON.stringify(result.errors, null, 2)}`);
    }

    this.kiteConfig = result.data;
    console.log("✅ Configuration de cerf-volant définie:", this.kiteConfig);
  }

  /**
   * Initialise le simulateur avec des valeurs par défaut validées
   */
  initializeWithDefaults() {
    try {
      this.setPhysicsConstants(examplePhysicsConstants);
      this.setKiteConfig(exampleKiteConfig);
      console.log("✅ Simulateur initialisé avec succès!");
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
    }
  }
}

// =============================================================================
// FONCTIONS UTILITAIRES POUR LES TESTS
// =============================================================================

/**
 * Fonction pour exécuter tous les exemples
 */
export function runAllExamples() {
  console.log("🚀 Exécution de tous les exemples de schémas Zod\n");

  console.log("1. Validation des constantes physiques:");
  validateExamplePhysicsConstants();

  console.log("\n2. Validation de la configuration du cerf-volant:");
  validateExampleKiteConfig();

  console.log("\n3. Validation de l'événement d'entrée:");
  validateExampleInputEvent();

  console.log("\n4. Parsing du matériau:");
  parseExampleMaterial();

  console.log("\n5. Validation de la configuration complète:");
  validateSimulationSetup();

  console.log("\n6. Test avec des données invalides:");
  testInvalidDataValidation();

  console.log("\n7. Test de classe validée:");
  const simulator = new ValidatedKiteSimulator();
  simulator.initializeWithDefaults();
}

// Export par défaut pour utilisation facile
export default {
  examples: {
    physicsConstants: examplePhysicsConstants,
    physicsConfig: examplePhysicsConfig,
    kiteConfig: exampleKiteConfig,
    kiteState: exampleKiteState,
    inputEvent: exampleInputEvent,
    controlConfig: exampleControlConfig,
    material: exampleMaterial,
    light: exampleLight,
    camera: exampleCamera
  },
  validators: {
    validatePhysicsConstants: validateExamplePhysicsConstants,
    validateKiteConfig: validateExampleKiteConfig,
    validateInputEvent: validateExampleInputEvent,
    parseMaterial: parseExampleMaterial,
    validateSetup: validateSimulationSetup,
    testInvalid: testInvalidDataValidation
  },
  runAll: runAllExamples
};
