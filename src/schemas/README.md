# Schémas Zod pour le Simulateur de Cerf-Volant

Ce dossier contient tous les schémas Zod utilisés pour valider les données dans le simulateur de cerf-volant. Les schémas assurent la sécurité des types et la validation runtime des données.

## 📁 Structure des fichiers

```
src/schemas/
├── index.ts              # Schémas de base et exports principaux
├── physics-schemas.ts    # Schémas pour la physique et les constantes
├── object-schemas.ts     # Schémas pour les objets et entités
├── ui-schemas.ts         # Schémas pour l'interface utilisateur
├── render-schemas.ts     # Schémas pour le rendu et la visualisation
└── schema-examples.ts    # Exemples d'utilisation
```

## 🚀 Démarrage rapide

### Import des schémas

```typescript
import {
  Vector3Schema,
  PhysicsConstantsSchema,
  validateData,
  parseData
} from './src/schemas';
```

### Validation simple

```typescript
import { validateData, PhysicsConstantsSchema } from './src/schemas';

const constants = {
  EPSILON: 1e-6,
  MAX_FORCE: 1000,
  // ... autres propriétés
};

const result = validateData(PhysicsConstantsSchema, constants);

if (result.success) {
  console.log('✅ Données valides:', result.data);
} else {
  console.error('❌ Erreurs:', result.errors);
}
```

### Parsing avec transformation

```typescript
import { parseData, Vector3Schema } from './src/schemas';

const vector = { x: 1, y: 2, z: 3 };
const validatedVector = parseData(Vector3Schema, vector);
// TypeScript infère automatiquement le type Vector3
```

## 📋 Schémas disponibles

### Schémas de base

- `Vector2Schema` - Vecteurs 2D (x, y)
- `Vector3Schema` - Vecteurs 3D (x, y, z)
- `QuaternionSchema` - Quaternions (x, y, z, w)
- `EulerSchema` - Angles d'Euler (x, y, z, order?)
- `ColorSchema` - Couleurs RGBA (r, g, b, a)

### Schémas d'enums

- `KiteControlPointSchema` - Points de contrôle du cerf-volant
- `SimulationStateSchema` - États de simulation
- `InputTypeSchema` - Types d'entrée utilisateur
- `DebugModeSchema` - Modes de debug

### Schémas physiques

- `PhysicsConstantsSchema` - Constantes physiques
- `PhysicsConfigSchema` - Configuration physique
- `WindParamsSchema` - Paramètres de vent
- `KiteStateSchema` - État du cerf-volant
- `ForceSchema` - Forces appliquées

### Schémas d'objets

- `BaseObjectConfigSchema` - Configuration d'objet de base
- `BaseObjectStateSchema` - État d'objet de base
- `ObjectKiteConfigSchema` - Configuration de cerf-volant
- `ObjectKiteStateSchema` - État de cerf-volant
- `PilotConfigSchema` - Configuration de pilote
- `LineConfigSchema` - Configuration de ligne
- `EnvironmentConfigSchema` - Configuration d'environnement

### Schémas d'interface utilisateur

- `InputEventSchema` - Événements d'entrée
- `ControlConfigSchema` - Configuration des contrôles
- `UIElementConfigSchema` - Configuration d'élément UI
- `UIPanelConfigSchema` - Configuration de panneau UI
- `UserPreferencesSchema` - Préférences utilisateur

### Schémas de rendu

- `MaterialSchema` - Matériaux (basic/physical)
- `LightSchema` - Lumières (directional/point/ambient)
- `CameraSchema` - Caméras (perspective/orthographic)
- `RenderConfigSchema` - Configuration de rendu
- `SceneSchema` - Configuration de scène

## 🔧 Fonctions utilitaires

### `validateData<T>(schema, data)`

Valide des données contre un schéma et retourne un résultat typé.

```typescript
const result = validateData(MySchema, myData);

if (result.success) {
  // result.data est de type T (inféré automatiquement)
  useValidatedData(result.data);
} else {
  // result.errors contient les erreurs de validation
  handleValidationErrors(result.errors);
}
```

### `parseData<T>(schema, data)`

Parse et valide des données, lance une exception en cas d'erreur.

```typescript
try {
  const validatedData = parseData(MySchema, myData);
  // validatedData est de type T
} catch (error) {
  // Erreur de validation
}
```

## 📝 Exemples d'utilisation

### Validation de constantes physiques

```typescript
import { validatePhysicsConstants } from './src/schemas';

const constants = {
  EPSILON: 1e-6,
  MAX_FORCE: 1000,
  // ...
};

const result = validatePhysicsConstants(constants);
```

### Validation d'un cerf-volant

```typescript
import { validateObjectKiteConfig } from './src/schemas';

const kiteConfig = {
  baseConfig: {
    name: "Mon Cerf-Volant",
    position: { x: 0, y: 10, z: 0 }
  },
  mass: 0.5,
  area: 2.5,
  // ...
};

const result = validateObjectKiteConfig(kiteConfig);
```

### Intégration dans une classe

```typescript
import { validateData, PhysicsConstantsSchema } from './src/schemas';

class KiteSimulator {
  setPhysicsConstants(constants: unknown) {
    const result = validateData(PhysicsConstantsSchema, constants);

    if (!result.success) {
      throw new Error(`Constantes invalides: ${result.errors}`);
    }

    this.constants = result.data;
  }
}
```

## 🎯 Bonnes pratiques

### 1. Validation en entrée

Validez toujours les données externes (fichiers de config, API, etc.)

```typescript
function loadConfig(configData: unknown) {
  const result = validateData(ConfigSchema, configData);

  if (!result.success) {
    throw new Error(`Configuration invalide: ${result.errors}`);
  }

  return result.data;
}
```

### 2. Types déduits

Utilisez les types inférés par Zod pour TypeScript.

```typescript
import type { PhysicsConstants } from './src/schemas';

function useConstants(constants: PhysicsConstants) {
  // TypeScript connaît toutes les propriétés
  console.log(constants.EPSILON); // number
}
```

### 3. Gestion d'erreurs

Gérez les erreurs de validation de manière appropriée.

```typescript
const result = validateData(Schema, data);

if (!result.success) {
  // Loggez les erreurs pour le debug
  console.error('Erreurs de validation:', result.errors);

  // Affichez un message utilisateur
  showUserError('Données invalides. Vérifiez votre configuration.');

  return;
}
```

### 4. Schémas composés

Composez des schémas pour des validations complexes.

```typescript
import { z } from 'zod';
import { Vector3Schema } from './src/schemas';

const ComplexObjectSchema = z.object({
  id: z.string().uuid(),
  position: Vector3Schema,
  velocity: Vector3Schema,
  timestamp: z.number().positive()
});
```

## 🧪 Tests et exemples

Le fichier `schema-examples.ts` contient des exemples complets d'utilisation :

```typescript
import { runAllExamples } from './src/schemas/schema-examples';

// Exécute tous les exemples
runAllExamples();
```

## 🔄 Migration depuis l'ancien système

### Avant (sans Zod)

```typescript
interface PhysicsConstants {
  EPSILON: number;
  MAX_FORCE: number;
  // ...
}

function validateConstants(constants: any): PhysicsConstants {
  // Validation manuelle...
}
```

### Après (avec Zod)

```typescript
import { PhysicsConstantsSchema, validateData } from './src/schemas';

function validateConstants(constants: unknown) {
  return validateData(PhysicsConstantsSchema, constants);
}

// Type inféré automatiquement
type PhysicsConstants = z.infer<typeof PhysicsConstantsSchema>;
```

## 📊 Avantages de Zod

1. **Sécurité des types** - Validation runtime avec inférence TypeScript
2. **Messages d'erreur clairs** - Erreurs détaillées et localisables
3. **Composition** - Schémas réutilisables et composables
4. **Performance** - Validation rapide et optimisée
5. **Écosystème** - Bibliothèque mature et bien maintenue

## 🚨 Dépannage

### Erreur "Module not found"

Assurez-vous que Zod est installé :

```bash
npm install zod
```

### Erreur de type TypeScript

Vérifiez que vous utilisez la bonne version de TypeScript (>= 4.5) et que les types sont correctement importés.

### Schéma non trouvé

Vérifiez que le schéma est exporté dans `index.ts` :

```typescript
export { MySchema } from './my-schemas';
```

## 📚 Ressources

- [Documentation Zod](https://zod.dev/)
- [Guide des schémas](https://zod.dev/guide)
- [API Reference](https://zod.dev/api)
