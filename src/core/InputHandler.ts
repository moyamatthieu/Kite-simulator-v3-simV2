/**
 * InputHandler.ts - Gestionnaire d'entrées utilisateur optimisé
 * 
 * Responsabilité unique : capturer et traiter les inputs clavier
 * Support AZERTY/QWERTY avec gestion propre des événements
 */

import { PhysicsConstants } from './constants';

/**
 * Configuration des contrôles
 */
interface InputConfig {
  rotationSpeed: number;
  returnSpeed: number;
  maxRotation: number;
  deadzone: number;
}

/**
 * Gestionnaire d'entrées utilisateur avec support multi-layout clavier
 */
export class InputHandler {
    private currentRotation: number = 0;
    private keysPressed = new Set<string>();
    private config: InputConfig;
    private isDisposed = false;
    
    // Gestionnaires d'événements (pour pouvoir les supprimer)
    private keyDownHandler: (event: KeyboardEvent) => void;
    private keyUpHandler: (event: KeyboardEvent) => void;
    
    // Mapping des touches pour compatibilité AZERTY/QWERTY
    private readonly CONTROL_KEYS = {
        left: new Set(['ArrowLeft', 'KeyA', 'KeyQ', 'a', 'q']),
        right: new Set(['ArrowRight', 'KeyD', 'd'])
    };

    constructor(config?: Partial<InputConfig>) {
        this.config = {
            rotationSpeed: 2.5,
            returnSpeed: 3.0,
            maxRotation: Math.PI / 6, // 30 degrés
            deadzone: PhysicsConstants.CONTROL_DEADZONE,
            ...config
        };
        
        this.keyDownHandler = this.onKeyDown.bind(this);
        this.keyUpHandler = this.onKeyUp.bind(this);
        
        this.setupKeyboardControls();
    }

    /**
     * Configuration des contrôles clavier
     */
    private setupKeyboardControls(): void {
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    /**
     * Gestionnaire touche pressée
     */
    private onKeyDown(event: KeyboardEvent): void {
        if (this.isDisposed) return;
        
        const key = this.normalizeKey(event);
        this.keysPressed.add(key);

        // Empêcher le comportement par défaut pour les touches de contrôle
        if (this.isControlKey(key)) {
            event.preventDefault();
        }
    }

    /**
     * Gestionnaire touche relâchée
     */
    private onKeyUp(event: KeyboardEvent): void {
        if (this.isDisposed) return;
        
        const key = this.normalizeKey(event);
        this.keysPressed.delete(key);

        if (this.isControlKey(key)) {
            event.preventDefault();
        }
    }

    /**
     * Normalise les touches pour gérer les différents layouts
     */
    private normalizeKey(event: KeyboardEvent): string {
        // Utiliser event.code pour la position physique (universel)
        // et event.key pour le caractère (layout-dépendant)
        return event.code || event.key;
    }

    /**
     * Vérifie si c'est une touche de contrôle
     */
    private isControlKey(key: string): boolean {
        return this.CONTROL_KEYS.left.has(key) || this.CONTROL_KEYS.right.has(key);
    }

    /**
     * Vérifie si une direction est pressée
     */
    private isDirectionPressed(direction: 'left' | 'right'): boolean {
        return Array.from(this.CONTROL_KEYS[direction]).some(key => this.keysPressed.has(key));
    }

    /**
     * Met à jour la rotation en fonction des inputs
     */
    update(deltaTime: number): void {
        if (this.isDisposed) return;
        
        const left = this.isDirectionPressed('left');
        const right = this.isDirectionPressed('right');
        const inputDirection = (left ? 1 : 0) + (right ? -1 : 0);

        if (inputDirection !== 0) {
            // Application de la rotation demandée
            this.currentRotation += inputDirection * this.config.rotationSpeed * deltaTime;
        } else {
            // Retour automatique au centre
            if (Math.abs(this.currentRotation) > this.config.deadzone) {
                const sign = Math.sign(this.currentRotation);
                this.currentRotation -= sign * this.config.returnSpeed * deltaTime;
                
                // Éviter le dépassement
                if (Math.sign(this.currentRotation) !== sign) {
                    this.currentRotation = 0;
                }
            } else {
                this.currentRotation = 0;
            }
        }

        // Limiter la rotation maximale
        this.currentRotation = Math.max(
            -this.config.maxRotation, 
            Math.min(this.config.maxRotation, this.currentRotation)
        );
    }

    /**
     * Obtient la rotation cible de la barre de contrôle
     */
    getTargetBarRotation(): number {
        return this.currentRotation;
    }

    /**
     * Obtient la rotation normalisée (-1 à 1)
     */
    getNormalizedRotation(): number {
        return this.currentRotation / this.config.maxRotation;
    }

    /**
     * Vérifie si des touches sont actuellement pressées
     */
    isInputActive(): boolean {
        return this.isDirectionPressed('left') || this.isDirectionPressed('right');
    }

    /**
     * Remet à zéro l'état des inputs
     */
    reset(): void {
        this.currentRotation = 0;
        this.keysPressed.clear();
    }

    /**
     * Nettoyage des ressources
     */
    dispose(): void {
        if (this.isDisposed) return;
        
        this.isDisposed = true;
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        this.keysPressed.clear();
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<InputConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}