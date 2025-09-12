/**
 * ControlBarManager.ts - Gestionnaire de la barre de contrôle
 * Responsabilité unique : gestion des positions et rotations de la barre
 */

import * as THREE from 'three';
import { CONFIG, PhysicsConstants, HandlePositions } from './constants';
import { Kite } from '@objects/Kite';

export class ControlBarManager {
    private position: THREE.Vector3;
    private rotation: number = 0;

    constructor(position: THREE.Vector3 = CONFIG.controlBar.position) {
        this.position = position.clone();
    }

    /**
     * Calcule le quaternion de rotation de la barre
     */
    private computeRotationQuaternion(toKiteVector: THREE.Vector3): THREE.Quaternion {
        const barDirection = new THREE.Vector3(1, 0, 0);
        const rotationAxis = new THREE.Vector3().crossVectors(barDirection, toKiteVector).normalize();

        if (rotationAxis.length() < PhysicsConstants.CONTROL_DEADZONE) {
            rotationAxis.set(0, 1, 0);
        }

        return new THREE.Quaternion().setFromAxisAngle(rotationAxis, this.rotation);
    }

    /**
     * Obtient les positions des poignées (méthode unique centralisée)
     */
    getHandlePositions(kitePosition: THREE.Vector3): HandlePositions {
        const toKiteVector = kitePosition.clone().sub(this.position).normalize();
        const rotationQuaternion = this.computeRotationQuaternion(toKiteVector);

        const halfWidth = CONFIG.controlBar.width / 2;
        const handleLeftLocal = new THREE.Vector3(-halfWidth, 0, 0);
        const handleRightLocal = new THREE.Vector3(halfWidth, 0, 0);

        handleLeftLocal.applyQuaternion(rotationQuaternion);
        handleRightLocal.applyQuaternion(rotationQuaternion);

        return {
            left: handleLeftLocal.clone().add(this.position),
            right: handleRightLocal.clone().add(this.position)
        };
    }

    /**
     * Met à jour la rotation de la barre
     */
    setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    getRotation(): number {
        return this.rotation;
    }

    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    /**
     * Met à jour l'objet 3D visuel de la barre
     */
    updateVisual(bar: THREE.Group, kite: Kite): void {
        if (!bar) return;

        const ctrlLeft = kite.getPoint('CTRL_GAUCHE');
        const ctrlRight = kite.getPoint('CTRL_DROIT');

        if (ctrlLeft && ctrlRight) {
            const kiteLeftWorld = ctrlLeft.clone();
            const kiteRightWorld = ctrlRight.clone();
            kite.localToWorld(kiteLeftWorld);
            kite.localToWorld(kiteRightWorld);

            const centerKite = kiteLeftWorld.clone().add(kiteRightWorld).multiplyScalar(0.5);
            const toKiteVector = centerKite.clone().sub(this.position).normalize();

            bar.quaternion.copy(this.computeRotationQuaternion(toKiteVector));
        }
    }
}