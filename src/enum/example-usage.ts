/**
 * example-usage.ts - Exemple d'utilisation des enums avec préfixe E_
 *
 * Ce fichier montre comment utiliser les enums organisés avec la convention E_.
 */

// Import depuis le point d'entrée central (recommandé)
import {
    KiteGeometryPoint,
    WarningType,
    DebugMode,
    InputType,
    ControlKey,
    ControlDirection,
    SimulationState
} from './index';

/**
 * Exemple d'utilisation des points géométriques du cerf-volant
 */
export class GeometryExample {
    static getPointCoordinates(point: KiteGeometryPoint): string {
        switch (point) {
            case KiteGeometryPoint.NEZ:
                return "Point supérieur du cerf-volant";
            case KiteGeometryPoint.SPINE_BAS:
                return "Point inférieur central";
            case KiteGeometryPoint.CTRL_GAUCHE:
                return "Point d'attache de la ligne gauche";
            case KiteGeometryPoint.CTRL_DROIT:
                return "Point d'attache de la ligne droite";
            case KiteGeometryPoint.BORD_GAUCHE:
                return "Extrémité de l'aile gauche";
            case KiteGeometryPoint.BORD_DROIT:
                return "Extrémité de l'aile droite";
            case KiteGeometryPoint.WHISKER_GAUCHE:
                return "Stabilisateur gauche";
            case KiteGeometryPoint.WHISKER_DROIT:
                return "Stabilisateur droit";
            default:
                return "Point inconnu";
        }
    }
}

/**
 * Exemple d'utilisation du système d'avertissements
 */
export class WarningSystem {
    private warnings: WarningType[] = [];

    addWarning(type: WarningType): void {
        this.warnings.push(type);
        console.warn(`⚠️ Avertissement: ${type}`);
    }

    getWarnings(): WarningType[] {
        return [...this.warnings];
    }

    clearWarnings(): void {
        this.warnings = [];
    }
}

/**
 * Exemple d'utilisation des contrôles utilisateur
 */
export class InputManager {
    private inputType: InputType = InputType.KEYBOARD;
    private debugMode: DebugMode = DebugMode.BASIC;

    setInputType(type: InputType): void {
        this.inputType = type;
    }

    setDebugMode(mode: DebugMode): void {
        this.debugMode = mode;
    }

    handleKeyPress(key: string): ControlDirection {
        switch (key) {
            case ControlKey.LEFT_ARROW:
            case ControlKey.Q_KEY:
            case ControlKey.A_KEY:
                return ControlDirection.LEFT;
            case ControlKey.RIGHT_ARROW:
            case ControlKey.D_KEY:
                return ControlDirection.RIGHT;
            default:
                return ControlDirection.NEUTRAL;
        }
    }
}

/**
 * Exemple d'utilisation des états de simulation
 */
export class SimulationManager {
    private state: SimulationState = SimulationState.STOPPED;

    getState(): SimulationState {
        return this.state;
    }

    setState(newState: SimulationState): void {
        this.state = newState;
        console.log(`🔄 État de simulation changé: ${newState}`);
    }

    start(): void {
        this.setState(SimulationState.RUNNING);
    }

    pause(): void {
        this.setState(SimulationState.PAUSED);
    }

    stop(): void {
        this.setState(SimulationState.STOPPED);
    }

    reset(): void {
        this.setState(SimulationState.RESETTING);
        // Logique de réinitialisation...
        this.setState(SimulationState.STOPPED);
    }
}

// Exemple d'utilisation
export function demonstrateEnums(): void {
    console.log("🚀 Démonstration des enums avec préfixe E_");

    // Géométrie
    console.log("📐 Point NEZ:", GeometryExample.getPointCoordinates(KiteGeometryPoint.NEZ));

    // Système d'avertissements
    const warningSystem = new WarningSystem();
    warningSystem.addWarning(WarningType.EXCESSIVE_VELOCITY);

    // Gestionnaire d'entrée
    const inputManager = new InputManager();
    inputManager.setInputType(InputType.KEYBOARD);
    inputManager.setDebugMode(DebugMode.DETAILED);

    // Simulation
    const simManager = new SimulationManager();
    simManager.start();
    simManager.pause();
    simManager.reset();

    console.log("✅ Démonstration terminée !");
}
