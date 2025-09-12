/**
 * Types centralisés pour le simulateur de cerf-volant
 */

import * as THREE from 'three';

// Types de base pour la physique
export interface WindParams {
    speed: number;          // km/h
    direction: number;      // degrés
    turbulence: number;     // pourcentage
}

export interface KiteState {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    orientation: THREE.Quaternion;
}

export interface HandlePositions {
    left: THREE.Vector3;
    right: THREE.Vector3;
}

export interface AerodynamicForces {
    lift: THREE.Vector3;
    drag: THREE.Vector3;
    torque: THREE.Vector3;
    leftForce?: THREE.Vector3;
    rightForce?: THREE.Vector3;
}

export interface SimulationMetrics {
    apparentSpeed: number; // Vitesse apparente du vent sur le kite (m/s)
    liftMag: number;       // Intensité de la portance générée (N)
    dragMag: number;       // Intensité de la traînée subie (N)
    lOverD: number;        // Rapport portance/traînée (efficacité aérodynamique)
    aoaDeg: number;        // Angle d'attaque en degrés
}

// Interface pour les objets créables
export interface ICreatable {
    create(): void;
}

// Types pour la géométrie du kite
export interface KiteGeometryPoint {
    name: string;
    position: THREE.Vector3;
}

export interface KiteSurface {
    name: string;
    vertices: string[];
    area: number;
    color: string;
}

export interface FrameElement {
    name: string;
    points: string[];
    thickness: number;
    color: number;
}