# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kite Simulator V3** - Advanced physics-based kite simulation in TypeScript with Three.js. The project emphasizes **emergent physics** (no artificial coefficients), realistic aerodynamics, and a modular Entity3D architecture designed for potential Godot migration.

## Development Commands

```bash
# Primary development workflow
npm run dev          # Start Vite dev server on port 5173
npm run build        # TypeScript compile + Vite production build
npm run typecheck    # TypeScript type checking (run before commits)
npm run lint         # ESLint validation
npm run format       # Prettier code formatting
npm run test         # Vitest unit tests
npm run preview      # Preview production build
npm run clean        # Clean dist and node_modules
```

**Important**: Always run `npm run typecheck` before committing changes. The project uses strict TypeScript configuration.

## High-Level Architecture

### Core Design Philosophy
- **Emergent Physics**: No scripted behaviors, all kite movement emerges from pure physics laws
- **Entity3D Pattern**: All 3D objects inherit from Entity3D base class with mandatory component system
- **LEGO-Style Modularity**: Each component has single responsibility and can be composed together
- **Godot-Ready**: Architecture designed for potential migration to Godot Engine

### Main Application Flow
The application follows a simple 4-class architecture:

1. **SimulationApp** (`src/SimulationApp.ts`) - Main orchestrator
   - Creates and manages all core systems
   - Runs the main animation loop (60 FPS)
   - Handles user interaction integration

2. **SceneManager** (`src/core/SceneManager.ts`) - 3D rendering
   - Three.js scene, camera, renderer, controls
   - Environment setup (lighting, ground, fog)
   - Window resize handling

3. **EntityManager** (`src/core/EntityManager.ts`) - 3D objects
   - Creates and manages Kite, Pilote, LineSystem
   - Handles visual updates and coordination between objects

4. **PhysicsEngine** (`src/physics/PhysicsEngine.ts`) - Physics simulation
   - Orchestrates all physics calculations
   - Integrates KiteController, WindSimulator, AerodynamicsCalculator
   - Applies emergent forces and constraints

### Physics Architecture
- **Pure Emergent Behavior**: Kite movement emerges from 4 force sources:
  - Aerodynamic forces (lift/drag from 4 triangular surfaces)
  - Line tension constraints (Position-Based Dynamics)
  - Gravity (F = mg)
  - Ground collision response
- **Real-time Integration**: Verlet integration with temporal force smoothing
- **Constraint Satisfaction**: PBD constraints for realistic line behavior

### Entity3D Component System
All 3D objects follow this pattern:
```typescript
class MyObject extends Entity3D {
    constructor() {
        super();
        this.initialize_root(); // Required for Three.js integration
    }
}
```

## Import Alias Configuration

The project uses TypeScript path mapping for clean imports:

```typescript
import { Kite } from '@objects/Kite';                    // src/objects/
import { CONFIG } from '@core/constants';                // src/core/
import { WindSimulator } from '@physics/WindSimulator';  // src/physics/
import { CompactUI } from '@ui/CompactUI';              // src/ui/
import { debug } from '@utils/debug';                   // src/utils/
import { ServiceContainer } from '@core/di/ServiceContainer'; // src/core/di/
import { MyClass } from '@class/MyClass';                // src/class/
import { MyFactory } from '@factories/MyFactory';       // src/factories/
import { MyInterface } from '@types/interfaces';        // src/types/
```

Always use these aliases instead of relative paths for consistency.

## Project Structure

Key directories and their purposes:

```
src/
├── core/               # Core systems (SceneManager, EntityManager, PhysicsConstants, DI container)
├── objects/           # 3D objects (Kite, Pilote, KiteGeometry, components)
├── physics/           # Physics engine (PhysicsEngine, KiteController, AerodynamicsCalculator, WindSimulator)
├── ui/                # User interface (CompactUI, UIManager, input handling)
├── utils/             # Utilities (debug, ObjectPool)
├── schemas/           # Zod schema definitions for validation
├── class/             # Core class definitions and base classes
├── core/di/           # Dependency injection container
├── enum/              # TypeScript enums and constants
├── types/             # TypeScript type definitions and interfaces
├── factories/         # Factory patterns for object creation
├── main.ts            # Entry point with mode detection
├── SimulationApp.ts   # Main simulation application
└── CaoApp.ts          # CAD/design application
```

## Zod Schema Validation System

This project extensively uses **Zod** for runtime type validation and schema definition. All data structures, configurations, and API boundaries should be validated using Zod schemas.

### Schema Organization
- `src/schemas/` - Centralized schema definitions organized by domain
- `src/schemas/index.ts` - Main schema exports and utility functions
- `src/schemas/base-schemas.ts` - Core base schemas (Vector3, Quaternion, etc.)
- `src/schemas/physics-schemas.ts` - Physics simulation validation
- `src/schemas/object-schemas.ts` - 3D object configuration validation
- `src/schemas/ui-schemas.ts` - User interface data validation
- `src/schemas/render-schemas.ts` - Rendering and visual configuration
- `src/schemas/schema-integration.ts` - Schema integration utilities
- `src/schemas/schema-examples.ts` - Usage examples and patterns

### Core Patterns

#### Schema Definition
```typescript
// Define schema with validation rules
export const KiteConfigSchema = z.object({
  sailColor: z.number().optional(),
  frameColor: z.number().optional(),
  showPoints: z.boolean().default(false),
  aerodynamic: z.boolean().default(true)
});

// Infer TypeScript type from schema
export type KiteConfig = z.infer<typeof KiteConfigSchema>;
```

#### Data Validation
```typescript
import { validateData, parseData } from '@schemas';

// Safe validation with error handling
const result = validateData(KiteConfigSchema, userInput);
if (result.success) {
  // Use validated result.data
} else {
  console.error('Validation errors:', result.errors);
}

// Direct parsing (throws on error)
const config = parseData(KiteConfigSchema, userInput);
```

#### Configuration Validation
```typescript
// Physics constants validation
import { PhysicsConstantsSchema } from '@schemas/physics-schemas';
const validatedConstants = PhysicsConstantsSchema.parse(physicsData);

// Object configuration validation
import { KiteConfigSchema } from '@objects/types';
const kiteConfig = validateKiteConfig(userConfig);
```

### Schema Integration Rules
- **All external data** (user input, API responses, config files) must be validated
- **Configuration objects** should have corresponding Zod schemas
- **Type definitions** should be inferred from schemas using `z.infer<>`
- **Validation functions** should use `schema.safeParse()` for error handling
- **Default values** should be defined in schemas using `.default()`

### Common Schema Utilities
```typescript
import {
  Vector3Schema,
  QuaternionSchema,
  validateData,
  safeParseData
} from '@schemas';

// Three.js object validation
const position = safeParseData(Vector3Schema, { x: 0, y: 10, z: 0 });
const orientation = parseData(QuaternionSchema, rotationData);
```

## Critical Architecture Rules

### Physics Constraints
- **Never add artificial coefficients** - all behavior must emerge from real physics
- **Four force sources only**: aerodynamics, lines, gravity, ground collision
- **Emergent coupling**: rotation emerges from asymmetric left/right forces
- **Real-time constraints**: maintain 60 FPS with physics calculations

### Component Architecture
- **Single Responsibility**: Each class has exactly one clear purpose
- **Entity3D Inheritance**: All 3D objects must extend Entity3D
- **Component Composition**: Use composition over inheritance for complex behaviors
- **Mandatory Disposal**: Implement proper cleanup with EventBus pattern

### Code Standards
- **French Comments**: Code in English, comments in French (project originated in France)
- **Strict TypeScript**: No `any` types, full type coverage required
- **Zod Validation**: All external data and configurations must be validated with Zod schemas
- **Schema-First Types**: Define Zod schemas first, infer TypeScript types using `z.infer<>`
- **Import Aliases**: Always use @core, @objects, @physics, etc.
- **Physics-First**: Architecture decisions prioritize physics accuracy over convenience

## Configuration and Constants

Main configuration in `src/core/constants.ts`:
- **PhysicsConstants**: Safety limits and tolerances
- **CONFIG**: Organized by domain (physics, aero, kite, lines, wind, rendering)
- **WindParams, KiteState, AerodynamicForces**: Core type definitions

Key physics parameters:
- `MAX_ACCELERATION: 500` m/s² - prevents physics explosions
- `LINE_CONSTRAINT_TOLERANCE: 0.02` - 2cm tolerance for line length
- `FORCE_SMOOTHING: 0.25` - temporal smoothing to reduce oscillations

## Development Modes

The application supports two modes via URL parameter:
- `?mode=simulation` - Standard kite physics simulation (default) - Uses `SimulationApp`
- `?mode=cao` - CAD/design mode for kite geometry editing - Uses `CaoApp`

Access via `main.ts` which detects the mode parameter and instantiates the appropriate app class. Each mode has its own complete application architecture:

- **SimulationApp** (`src/SimulationApp.ts`) - Full physics simulation with kite flight
- **CaoApp** (`src/CaoApp.ts`) - CAD/design interface for kite geometry modification

Both apps share core components but have different UI and interaction patterns.

## Testing and Quality

- **Vitest** for unit testing with jsdom environment
- **Physics Tests**: Validate emergent behavior, force calculations, constraint satisfaction
- **ESLint + Prettier**: Enforced code style
- **TypeScript strict mode**: Full type checking required

Run the full quality pipeline before commits:
```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

## Common Patterns

### Creating New 3D Objects
```typescript
// 1. Define schema for configuration
const NewObjectConfigSchema = z.object({
  position: Vector3Schema.optional(),
  color: z.number().default(0xffffff),
  visible: z.boolean().default(true)
});
type NewObjectConfig = z.infer<typeof NewObjectConfigSchema>;

// 2. Create object with validated config
class NewObject extends Entity3D {
    constructor(config: unknown) {
        super();
        // Validate configuration with Zod
        const validConfig = NewObjectConfigSchema.parse(config);

        // Create Three.js geometry/material using validated data
        // Initialize component properties
        this.initialize_root(); // Essential for Entity3D integration
    }
}
```

### Physics Component Integration
```typescript
// In PhysicsEngine.update()
const forces = this.calculateAllForces(deltaTime);
const torque = this.calculateAllTorques(deltaTime);
this.kiteController.update(forces, torque, deltaTime);
```

### Service Registration (DI Container)
```typescript
// Register service
ServiceContainer.register('windSimulator', new WindSimulator());
// Resolve service
const wind = ServiceContainer.resolve<WindSimulator>('windSimulator');
```

### Configuration Handling Pattern
```typescript
// 1. Import schema and validation utilities
import { KiteConfigSchema, validateData } from '@schemas';

// 2. Validate external configuration
function createKiteFromConfig(userConfig: unknown): Kite {
    const result = validateData(KiteConfigSchema, userConfig);

    if (!result.success) {
        console.error('Invalid kite configuration:', result.errors);
        throw new Error('Configuration validation failed');
    }

    // Use validated configuration
    return new Kite(result.data);
}

// 3. Provide type-safe defaults
const defaultConfig = KiteConfigSchema.parse({
    sailColor: 0xff3333,
    frameColor: 0x2a2a2a,
    aerodynamic: true
});
```

This architecture emphasizes simplicity, physics accuracy, and maintainability while preparing for potential Godot Engine migration.