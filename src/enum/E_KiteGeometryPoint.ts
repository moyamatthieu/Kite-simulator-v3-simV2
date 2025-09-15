/**
 * E_KiteGeometryPoint.ts - Énumération complète des points géométriques du cerf-volant
 *
 * Définit tous les points de structure du cerf-volant utilisés pour
 * la géométrie, la physique et le rendu 3D.
 *
 * Note: Les points de contrôle principaux sont définis dans KiteControlPoint
 * et sont référencés ici pour éviter la duplication.
 */

import { KiteControlPoint } from './E_KiteControlPoint';

export enum E_KiteGeometryPoint {
    // Points de contrôle (références depuis KiteControlPoint)
    NEZ = KiteControlPoint.NEZ,
    SPINE_BAS = KiteControlPoint.SPINE_BAS,
    CTRL_GAUCHE = KiteControlPoint.CTRL_GAUCHE,
    CTRL_DROIT = KiteControlPoint.CTRL_DROIT,

    // Points de structure additionnels
    BORD_GAUCHE = 'BORD_GAUCHE',
    BORD_DROIT = 'BORD_DROIT',
    WHISKER_GAUCHE = 'WHISKER_GAUCHE',
    WHISKER_DROIT = 'WHISKER_DROIT',
}
