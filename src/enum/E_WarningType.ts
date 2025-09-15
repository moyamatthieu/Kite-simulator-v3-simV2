/**
 * WarningType.ts - Énumération des types d'avertissements
 *
 * Définit les différents types d'alertes et d'avertissements utilisés
 * dans le système de debug et de monitoring de la simulation.
 */

export enum E_WarningType {
    EXCESSIVE_ACCELERATION = 'excessive_acceleration',
    EXCESSIVE_VELOCITY = 'excessive_velocity',
    EXCESSIVE_ANGULAR = 'excessive_angular',
    INVALID_FORCES = 'invalid_forces',
    INVALID_TORQUE = 'invalid_torque',
    POSITION_NAN = 'position_nan',
    LINE_BREAK = 'line_break',
}
