/**
 * Index des objets de simulation
 * Exporte tous les objets disponibles dans le dossier simulation/objects
 */

export { C_objet } from '../class/C_objet';
export type { C_objetConfig } from '../class/C_objet';
export { Kite, default as KiteDefault } from './Kite';
export type { KiteConfig } from './Kite';

// Alias pour compatibilité avec simulationV8.ts
export { Kite as Kite2 } from './Kite';

export { Pilote3D } from './Pilote';
export { Point } from './components/point';
export type { PointConfig } from './components/point';
// export { Tube } from './tube';
// export type { TubeConfig } from './tube';
export { Frame } from './components/frame';
export type { Frame_Config } from './components/frame';
export { Sail } from './components/sail';
export type { SailConfig } from './components/sail';
export { C_label } from '../class/C_label';
