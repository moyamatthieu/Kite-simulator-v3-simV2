# Kite Simulator V1 Project Guide

## Project Overview

**Kite Simulator V1** is an advanced physics simulation project developed in TypeScript and Three.js. It offers a highly realistic kite-flying experience based on true aerodynamic principles.

### Key Technologies
- TypeScript 5.3+
- Three.js 0.160
- Vite 5.4
- ES Modules

### High-Level Architecture
The project follows a modular architecture with clear separation of concerns:

1. **Core**: Configuration, constants, and central managers
2. **Objects**: Kite, geometry, and 3D objects
3. **Physics**: Physics engine, aerodynamics, and PBD constraints
4. **UI**: Compact user interface
5. **Utils**: Debug utilities and history management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the project
cd kite-sim-v1

# Install dependencies
npm install

# Run development server
npm run dev
```

The simulator will be available at `http://localhost:5173`

### Basic Usage
- Use arrow keys or Q/D to control the kite
- Press 'D' to toggle debug mode
- Adjust wind speed and direction in the UI

### Running Tests
```bash
npm run test
```

## Project Structure

### Main Directories
- `src/core/`: Configuration, constants, and central managers
- `src/objects/`: Kite, geometry, and 3D objects
- `src/physics/`: Physics engine, aerodynamics, and PBD constraints
- `src/ui/`: Compact user interface
- `src/utils/`: Debug utilities and history management
- `src/types/`: Centralized TypeScript types

### Key Files
- `src/main.ts`: Main entry point
- `src/SimulationApp.ts`: Main application class
- `src/core/constants.ts`: Physical constants and configuration
- `src/objects/Kite.ts`: Kite geometry and properties
- `src/physics/PhysicsEngine.ts`: Core physics engine

### Important Configuration Files
- `vite.config.ts`: Vite configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts

## Development Workflow

### Coding Standards
- Use TypeScript strict typing
- Follow the project's import aliases
- Write code in English with French comments
- Focus on emergent physics

### Testing Approach
- Use Vitest for unit and integration tests
- Test physics calculations thoroughly
- Verify emergent behavior

### Build and Deployment
```bash
npm run build
```

### Contribution Guidelines
- Follow the existing code style
- Write clear, concise commit messages
- Include relevant tests with new features

## Key Concepts

### Domain-Specific Terminology
- **PBD (Position-Based Dynamics)**: Constraint-solving technique
- **Emergent Physics**: Natural behavior from simple rules
- **Kite Geometry**: Specific points and surfaces

### Core Abstractions
- **Physics Engine**: Core simulation loop
- **Kite Object**: Main simulated entity
- **Wind Simulator**: Environmental conditions

### Design Patterns Used
- Singleton for managers
- Factory pattern for complex objects
- Observer pattern for event handling

## Common Tasks

### Adding a New Physics Feature
1. Create a new file in `src/physics/`
2. Implement the new physics calculations
3. Integrate with the existing physics engine
4. Add relevant tests
5. Update the debug visualization

### Debugging Physics Issues
1. Enable debug mode (press 'D')
2. Observe the force vectors
3. Check the console for metrics
4. Adjust physical constants as needed

## Troubleshooting

### Common Issues
- **Oscillations**: Adjust damping factors in `src/core/constants.ts`
- **Performance issues**: Optimize geometry or reduce debug visualizations
- **Physics violations**: Check constraints and limits in the physics engine

### Debugging Tips
- Use the debug mode to visualize forces
- Check the console for detailed metrics
- Verify physical constants and limits

## References

### Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Important Resources
- [Kite Aerodynamics Guide](https://example.com/kite-aerodynamics)
- [Physics Simulation Best Practices](https://example.com/physics-simulation)

This guide provides a comprehensive overview of the Kite Simulator V1 project. For more specific information, refer to the relevant subdirectories and their documentation.