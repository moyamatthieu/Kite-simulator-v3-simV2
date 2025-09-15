/**
 * ServiceKeys.ts - Clés des services pour le container DI
 */

export const ServiceKeys = {
    SCENE_MANAGER: 'sceneManager',
    PHYSICS_ENGINE: 'physicsEngine',
    INPUT_HANDLER: 'inputHandler',
    ENTITY_MANAGER: 'entityManager',
    UI_MANAGER: 'uiManager'
} as const;

export type ServiceKey = typeof ServiceKeys[keyof typeof ServiceKeys];