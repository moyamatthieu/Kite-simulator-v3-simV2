/**
 * Kite2.ts - Réexport de Kite pour compatibilité avec simulationV8.ts
 * 
 * Ce fichier permet de maintenir la compatibilité avec l'import 
 * existant dans simulationV8.ts sans casser l'architecture.
 */

export { Kite as Kite2 } from '../Kite';
export type { KiteConfig } from '../Kite';
export { KiteGeometry } from '../Kite';