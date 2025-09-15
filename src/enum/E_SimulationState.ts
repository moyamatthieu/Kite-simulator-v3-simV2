/**
 * SimulationState.ts - Énumération des états de simulation
 *
 * Définit les différents états possibles de la simulation physique,
 * permettant de contrôler son comportement général.
 */

export enum E_SimulationState {
    STOPPED = 'stopped',
    RUNNING = 'running',
    PAUSED = 'paused',
    RESETTING = 'resetting',
}
