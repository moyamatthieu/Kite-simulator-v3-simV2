# 📁 Structure des Énumérations

Ce dossier contient toutes les énumérations du projet, organisées selon le principe de responsabilité unique.

## 📋 Organisation

### Fichiers principaux :
- **`index.ts`** - Point d'entrée central pour tous les imports
- **`README.md`** - Documentation complète
- **`example-usage.ts`** - Exemples d'utilisation

### Fichiers spécialisés (un par enum avec préfixe E_) :
- **`E_KiteControlPoint.ts`** - Points de contrôle principaux du cerf-volant
- **`E_KiteGeometryPoint.ts`** - Points géométriques du cerf-volant
- **`E_ObjectLifecycleState.ts`** - États du cycle de vie d'un objet
- **`E_WarningType.ts`** - Types d'avertissements système
- **`E_DebugMode.ts`** - Niveaux de debug
- **`E_InputType.ts`** - Types d'entrée utilisateur
- **`E_ControlKey.ts`** - Touches de contrôle
- **`E_ControlDirection.ts`** - Directions de contrôle
- **`E_SimulationState.ts`** - États de simulation

## 🚀 Utilisation

### Import depuis le point d'entrée central :
```typescript
import { KiteGeometryPoint, WarningType, DebugMode } from '@enum';
```

### Import direct depuis un fichier spécifique :
```typescript
import { KiteGeometryPoint } from '@enum/E_KiteGeometryPoint';
```

## 📝 Migration depuis simulationV8.ts

Pour migrer le code de `simulationV8.ts` vers cette nouvelle architecture :

1. **Remplacer les chaînes littérales** par les valeurs d'enum
2. **Importer les enums** nécessaires dans chaque fichier
3. **Utiliser les types** pour améliorer la sécurité de type

### Exemple de migration :
```typescript
// Avant (simulationV8.ts)
const point = 'NEZ';

// Après (nouvelle architecture)
import { KiteGeometryPoint } from '@enum';
const point = KiteGeometryPoint.NEZ;
```

## 🎯 Avantages

- ✅ **Responsabilité unique** : Chaque enum dans son propre fichier
- ✅ **Maintenance facile** : Modifications isolées
- ✅ **Imports clairs** : Point d'entrée centralisé
- ✅ **Type safety** : Évite les erreurs de chaînes de caractères
- ✅ **Documentation** : Chaque enum est bien documenté
