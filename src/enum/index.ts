/**
 * index.ts - Point d'entrée central pour tous les enums
 *
 * Exporte tous les enums du projet pour faciliter les imports.
 * Utilisez cette syntaxe : import { KiteGeometryPoint, WarningType } from '@enum';
 */

// Enums existants (migrés vers fichiers séparés avec préfixe E_)
// Ré-exporter les enums avec alias pour compatibilité d'API
export { KiteControlPoint } from './E_KiteControlPoint';
export { E_ObjectLifecycleState as ObjectLifecycleState } from './E_ObjectLifecycleState';

// Nouveaux enums (préfixe E_ ou exportés sous ce nom dans leur fichier)
export { E_KiteGeometryPoint } from './E_KiteGeometryPoint';
export { E_KiteGeometryPoint as KiteGeometryPoint } from './E_KiteGeometryPoint';
export { E_WarningType as WarningType } from './E_WarningType';
export { E_DebugMode as DebugMode } from './E_DebugMode';
export { E_InputType as InputType } from './E_InputType';
export { E_ControlKey as ControlKey } from './E_ControlKey';
export { E_ControlDirection as ControlDirection } from './E_ControlDirection';
export { E_SimulationState as SimulationState } from './E_SimulationState';
