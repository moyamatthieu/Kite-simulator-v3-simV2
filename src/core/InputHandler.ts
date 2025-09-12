/**
 * InputHandler.ts - Gestionnaire d'entrées utilisateur
 * Responsabilité unique : capturer et traiter les inputs clavier
 */

import { PhysicsConstants } from './constants';

export class InputHandler {
    private currentRotation: number = 0;
    private keysPressed = new Set<string>();
    private rotationSpeed: number = 2.5;
    private returnSpeed: number = 3.0;
    private maxRotation: number = Math.PI / 6;

    constructor() {
        this.setupKeyboardControls();
    }

    private setupKeyboardControls(): void {
        window.addEventListener('keydown', (event) => {
            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            this.keysPressed.add(key);

            if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'q' || key === 'a' || key === 'd') {
                event.preventDefault();
            }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            this.keysPressed.delete(key);

            if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'q' || key === 'a' || key === 'd') {
                event.preventDefault();
            }
        });
    }

    update(deltaTime: number): void {
        const left = this.keysPressed.has('ArrowLeft') || this.keysPressed.has('q') || this.keysPressed.has('a');
        const right = this.keysPressed.has('ArrowRight') || this.keysPressed.has('d');
        const dir = (left ? 1 : 0) + (right ? -1 : 0);

        if (dir !== 0) {
            this.currentRotation += dir * this.rotationSpeed * deltaTime;
        } else {
            if (Math.abs(this.currentRotation) > PhysicsConstants.EPSILON) {
                const sign = Math.sign(this.currentRotation);
                this.currentRotation -= sign * this.returnSpeed * deltaTime;
                if (Math.sign(this.currentRotation) !== sign) {
                    this.currentRotation = 0;
                }
            } else {
                this.currentRotation = 0;
            }
        }

        this.currentRotation = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.currentRotation));
    }

    getTargetBarRotation(): number {
        return this.currentRotation;
    }
}