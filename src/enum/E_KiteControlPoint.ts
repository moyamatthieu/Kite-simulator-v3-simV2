/**
 * E_KiteControlPoint.ts - Points de contrôle principaux du cerf-volant
 *
 * Définit les points de contrôle principaux utilisés pour
 * la géométrie, la physique et le bridage du cerf-volant.
 */

export enum KiteControlPoint {
    NEZ = 'NEZ',
    BORD_GAUCHE = 'BORD_GAUCHE',
    BORD_DROIT = 'BORD_DROIT',
    WHISKER_GAUCHE = 'WHISKER_GAUCHE',
    WHISKER_DROIT = 'WHISKER_DROIT',
    CTRL_GAUCHE = 'CTRL_GAUCHE',
    CTRL_DROIT = 'CTRL_DROIT',
    SPINE_BAS = 'SPINE_BAS',
}
