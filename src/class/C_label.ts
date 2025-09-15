/**
 * C_label.ts - Système de labels 3D pour identifier les objets
 *
 * Version simplifiée utilisant des Sprites THREE.js pour commencer
 * Compatible avec le cycle de vie C_objet et configurable
 */

import * as THREE from 'three';
import { C_objet, C_objetConfig } from './C_objet';

export interface C_labelConfig extends C_objetConfig {
    text?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    target?: THREE.Object3D | C_objet;
    offset?: THREE.Vector3;
    alwaysOnTop?: boolean;
    fadeDistance?: number;
    maxDistance?: number;
    // Nouvelles options pour le dimensionnement adaptatif
    scaleMode?: 'fixed' | 'adaptive' | 'distance';
    baseScale?: number;
    minScale?: number;
    maxScale?: number;
    distanceScaling?: boolean;
}

/**
 * Classe de label 3D pour identifier visuellement les objets
 * Version simplifiée avec Sprite THREE.js
 */
export class C_label extends C_objet {
    private sprite!: THREE.Sprite;
    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;
    private text: string;
    private target?: THREE.Object3D | C_objet;
    private offset: THREE.Vector3;
    private labelConfig: C_labelConfig;

    // État d'animation
    private isVisible: boolean = true;
    private fadeDistance: number;
    private maxDistance: number;

    // Configuration de dimensionnement
    private scaleMode: 'fixed' | 'adaptive' | 'distance';
    private baseScale: number;
    private minScale: number;
    private maxScale: number;
    private distanceScaling: boolean;
    private currentScale: number = 1;
    
    // Configuration pour le rendu haute qualité
    private static readonly HIGH_DPI_FACTOR = 2; // Facteur pour rendu haute résolution
    private static readonly FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    private canvasScaleFactor: number;

    constructor(config: C_labelConfig = {}) {
        super(config);

        this.text = config.text || 'Label';
        this.target = config.target;
        this.offset = config.offset || new THREE.Vector3(0, 0.2, 0);
        this.fadeDistance = config.fadeDistance || 10;
        this.maxDistance = config.maxDistance || 20;
        
        // Configuration de dimensionnement avec valeurs par défaut adaptées au mode CAO
        this.scaleMode = config.scaleMode || 'adaptive';
        this.baseScale = config.baseScale || 0.15; // Plus petit par défaut pour le mode CAO
        this.minScale = config.minScale || 0.08;
        this.maxScale = config.maxScale || 0.3;
        this.distanceScaling = config.distanceScaling !== false; // Activé par défaut
        this.currentScale = this.baseScale;
        
        // Configuration pour rendu haute qualité
        this.canvasScaleFactor = window.devicePixelRatio * C_label.HIGH_DPI_FACTOR;
        
        this.labelConfig = {
            fontSize: 12,
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            alwaysOnTop: true,
            ...config
        };
    }

    /**
     * Phase d'initialisation personnalisée (Godot _init)
     */
    protected _init(): void {
        super._init();
        console.log(`🏷️ Label ${this.name} initialisé`);
    }

    /**
     * Phase d'entrée dans le scene tree (Godot _enter_tree)
     */
    protected _enter_tree(): void {
        super._enter_tree();
        this.createLabelSprite();
        console.log(`🏷️ Label ${this.name} ajouté au scene tree`);
    }

    /**
     * Phase de préparation finale (Godot _ready)
     */
    protected _ready(): void {
        super._ready();
        this.setupLabelBehavior();
        console.log(`🏷️ Label ${this.name} prêt`);
    }

    /**
     * Phase de sortie du scene tree (Godot _exit_tree)
     */
    protected _exit_tree(): void {
        super._exit_tree();
        this.cleanup();
        console.log(`🏷️ Label ${this.name} retiré du scene tree`);
    }

    /**
     * Crée un sprite avec canvas pour le texte
     */
    private createLabelSprite(): void {
        // Créer un canvas pour dessiner le texte
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;

        // Dessiner le texte sur le canvas avec rendu haute qualité
        this.drawTextOnCanvas();

        // Créer une texture à partir du canvas avec configuration optimale
        const texture = this.createOptimizedTexture();

        // Créer le matériau sprite avec configuration anti-aliasing
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.001, // Éliminer les artefacts de transparence
        });

        // Créer le sprite
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.position.copy(this.offset);
        
        // Appliquer le dimensionnement adaptatif
        this.updateSpriteScale();
        
        this.sprite.name = `Label_${this.name}`;

        // Ajouter au groupe
        this.group.add(this.sprite);

        console.log(`✅ Sprite label haute qualité créé pour "${this.text}" avec échelle ${this.currentScale}`);
    }

    /**
     * Crée une texture optimisée pour le rendu net
     */
    private createOptimizedTexture(): THREE.CanvasTexture {
        const texture = new THREE.CanvasTexture(this.canvas);
        
        // Configuration pour rendu net et anti-aliasing optimal
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.flipY = false; // Important pour éviter les inversions
        
        // Forcer la mise à jour
        texture.needsUpdate = true;
        
        return texture;
    }

    /**
     * Met à jour l'échelle du sprite selon le mode configuré
     */
    private updateSpriteScale(distance?: number): void {
        if (!this.sprite) return;

        let scale = this.baseScale;

        switch (this.scaleMode) {
            case 'fixed':
                scale = this.baseScale;
                break;
                
            case 'adaptive':
                // Mode adaptatif : plus petit pour les labels nombreux/denses
                scale = this.baseScale;
                break;
                
            case 'distance':
                if (distance && this.distanceScaling) {
                    // Échelle inversement proportionnelle à la distance
                    const normalizedDistance = Math.max(0.1, Math.min(1, distance / this.maxDistance));
                    scale = this.baseScale * (1 / normalizedDistance);
                    scale = Math.max(this.minScale, Math.min(this.maxScale, scale));
                } else {
                    scale = this.baseScale;
                }
                break;
        }

        // Appliquer l'échelle en gardant le ratio approprié
        const aspectRatio = 0.5; // Largeur / Hauteur
        this.sprite.scale.set(scale, scale * aspectRatio, 1);
        this.currentScale = scale;
    }

    /**
     * Dessine le texte sur le canvas avec rendu haute qualité
     * Implémentation complète pour éliminer le flou du texte
     */
    private drawTextOnCanvas(): void {
        const config = this.labelConfig;
        const fontSize = config.fontSize || 12;
        const padding = this.calculateOptimalPadding(fontSize);
        
        // Phase 1: Mesure précise du texte avec facteur d'échelle
        const textMetrics = this.measureTextPrecisely(fontSize);
        
        // Phase 2: Configuration du canvas haute résolution
        this.configureHighResolutionCanvas(textMetrics, padding);
        
        // Phase 3: Rendu du texte avec anti-aliasing optimal
        this.renderHighQualityText(textMetrics, padding, fontSize);
    }

    /**
     * Calcule le padding optimal selon la taille de police
     */
    private calculateOptimalPadding(fontSize: number): number {
        // Padding proportionnel à la taille de police pour maintenir l'esthétique
        return Math.max(4, Math.ceil(fontSize * 0.4));
    }

    /**
     * Mesure précise du texte pour dimensionnement optimal
     */
    private measureTextPrecisely(fontSize: number): TextMetrics {
        // Contexte temporaire pour mesure précise
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d')!;
        
        // Configuration de police optimale pour mesure
        tempContext.font = this.buildOptimalFontString(fontSize);
        tempContext.textAlign = 'center';
        tempContext.textBaseline = 'middle';
        
        return tempContext.measureText(this.text);
    }

    /**
     * Configure le canvas pour rendu haute résolution
     */
    private configureHighResolutionCanvas(textMetrics: TextMetrics, padding: number): void {
        const scaledFontSize = (this.labelConfig.fontSize || 12) * this.canvasScaleFactor;
        const scaledPadding = padding * this.canvasScaleFactor;
        
        // Dimensions logiques
        const logicalWidth = Math.ceil(textMetrics.width) + padding * 2;
        const logicalHeight = Math.ceil(textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) + padding * 2;
        
        // Dimensions physiques haute résolution
        const physicalWidth = Math.ceil(logicalWidth * this.canvasScaleFactor);
        const physicalHeight = Math.ceil(logicalHeight * this.canvasScaleFactor);
        
        // Configuration du canvas
        this.canvas.width = physicalWidth;
        this.canvas.height = physicalHeight;
        this.canvas.style.width = `${logicalWidth}px`;
        this.canvas.style.height = `${logicalHeight}px`;
        
        // Configuration du contexte pour rendu optimisé
        this.configureRenderingContext(scaledFontSize);
    }

    /**
     * Configure le contexte de rendu pour qualité optimale
     */
    private configureRenderingContext(scaledFontSize: number): void {
        // Échelle pour haute résolution
        this.context.scale(this.canvasScaleFactor, this.canvasScaleFactor);
        
        // Configuration anti-aliasing et rendu optimisé
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
        
        // Configuration de la police avec rendu optimisé
        this.context.font = this.buildOptimalFontString(this.labelConfig.fontSize || 12);
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        // Configuration pour contours nets
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
    }

    /**
     * Construit une chaîne de police optimisée pour le rendu
     */
    private buildOptimalFontString(fontSize: number): string {
        return `600 ${fontSize}px ${C_label.FONT_FAMILY}`;
    }

    /**
     * Rendu final du texte avec qualité maximale
     */
    private renderHighQualityText(textMetrics: TextMetrics, padding: number, fontSize: number): void {
        const centerX = (this.canvas.width / this.canvasScaleFactor) / 2;
        const centerY = (this.canvas.height / this.canvasScaleFactor) / 2;
        
        // Phase 1: Arrière-plan avec coins arrondis
        this.renderBackground(centerX, centerY, textMetrics, padding);
        
        // Phase 2: Bordure subtile
        this.renderBorder(centerX, centerY, textMetrics, padding);
        
        // Phase 3: Texte avec rendu optimal
        this.renderTextWithShadow(centerX, centerY);
    }

    /**
     * Rendu de l'arrière-plan avec coins arrondis
     */
    private renderBackground(centerX: number, centerY: number, textMetrics: TextMetrics, padding: number): void {
        const width = textMetrics.width + padding * 2;
        const height = (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) + padding * 2;
        const radius = Math.min(4, padding / 2);
        
        this.context.fillStyle = this.labelConfig.backgroundColor || 'rgba(0, 0, 0, 0.8)';
        
        this.context.beginPath();
        this.drawRoundedRect(
            centerX - width / 2,
            centerY - height / 2,
            width,
            height,
            radius
        );
        this.context.fill();
    }

    /**
     * Rendu de la bordure subtile
     */
    private renderBorder(centerX: number, centerY: number, textMetrics: TextMetrics, padding: number): void {
        const width = textMetrics.width + padding * 2;
        const height = (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) + padding * 2;
        const radius = Math.min(4, padding / 2);
        
        this.context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.context.lineWidth = 0.5;
        
        this.context.beginPath();
        this.drawRoundedRect(
            centerX - width / 2,
            centerY - height / 2,
            width,
            height,
            radius
        );
        this.context.stroke();
    }

    /**
     * Dessine un rectangle aux coins arrondis (compatible tous navigateurs)
     */
    private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
        if (typeof (this.context as any).roundRect === 'function') {
            // Utiliser l'API native si disponible
            (this.context as any).roundRect(x, y, width, height, radius);
        } else {
            // Implémentation manuelle pour compatibilité
            this.context.moveTo(x + radius, y);
            this.context.lineTo(x + width - radius, y);
            this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.context.lineTo(x + width, y + height - radius);
            this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.context.lineTo(x + radius, y + height);
            this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.context.lineTo(x, y + radius);
            this.context.quadraticCurveTo(x, y, x + radius, y);
        }
    }

    /**
     * Rendu du texte avec ombre subtile pour améliorer la lisibilité
     */
    private renderTextWithShadow(centerX: number, centerY: number): void {
        // Ombre légère pour contraste
        this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.context.fillText(this.text, centerX + 0.5, centerY + 0.5);
        
        // Texte principal
        this.context.fillStyle = this.labelConfig.color || '#ffffff';
        this.context.fillText(this.text, centerX, centerY);
    }

    /**
     * Configure le comportement du label
     */
    private setupLabelBehavior(): void {
        // Si un target est défini, attacher le label à cet objet
        if (this.target) {
            this.attachToTarget();
        }

        // Configuration des userData pour le debug
        if (this.sprite) {
            this.sprite.userData = {
                type: 'label',
                text: this.text,
                target: this.target ? (this.target instanceof C_objet ? this.target.name : this.target.name) : null
            };
        }
    }

    /**
     * Attache le label à un objet target
     */
    private attachToTarget(): void {
        if (!this.target) return;

        // Déterminer le groupe Three.js du target
        let targetGroup: THREE.Object3D;

        if (this.target instanceof C_objet) {
            targetGroup = this.target.get_group();
        } else {
            targetGroup = this.target;
        }

        // Retirer le label de son groupe actuel
        this.group.remove(this.sprite);

        // Ajouter au groupe du target
        targetGroup.add(this.sprite);
    }

    /**
     * Met à jour le label à chaque frame (distance, fade, etc.)
     */
    public update(deltaTime: number, cameraPosition?: THREE.Vector3): void {
        super.update(deltaTime);

        if (!this.sprite || !cameraPosition) return;

        // Calculer la distance à la caméra
        const worldPosition = new THREE.Vector3();
        this.sprite.getWorldPosition(worldPosition);
        const distance = cameraPosition.distanceTo(worldPosition);

        // Gestion de la visibilité selon la distance
        if (distance > this.maxDistance) {
            this.setVisible(false);
        } else {
            this.setVisible(true);

            // Effet de fade selon la distance
            if (distance > this.fadeDistance) {
                const fadeRatio = 1 - ((distance - this.fadeDistance) / (this.maxDistance - this.fadeDistance));
                this.setOpacity(fadeRatio);
            } else {
                this.setOpacity(1);
            }

            // Mise à jour de l'échelle selon la distance (si activé)
            if (this.scaleMode === 'distance' && this.distanceScaling) {
                this.updateSpriteScale(distance);
            }
        }
    }

    /**
     * Définit le texte du label et régénère la texture
     */
    public setText(text: string): void {
        this.text = text;
        if (this.sprite) {
            // Redessiner le canvas avec le nouveau texte haute qualité
            this.drawTextOnCanvas();
            
            // Régénérer la texture optimisée
            const newTexture = this.createOptimizedTexture();
            const material = this.sprite.material as THREE.SpriteMaterial;
            
            // Nettoyer l'ancienne texture
            if (material.map) {
                material.map.dispose();
            }
            
            // Appliquer la nouvelle texture
            material.map = newTexture;
            material.needsUpdate = true;
            
            console.log(`🔄 Texture régénérée pour le label "${text}"`);
        }
    }

    /**
     * Obtient le texte du label
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Définit la visibilité du label
     */
    public setVisible(visible: boolean): void {
        this.isVisible = visible;
        if (this.sprite) {
            this.sprite.visible = visible;
        }
    }

    /**
     * Obtient la visibilité du label
     */
    public getVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Définit l'opacité du label
     */
    public setOpacity(opacity: number): void {
        if (this.sprite && this.sprite.material) {
            (this.sprite.material as THREE.SpriteMaterial).opacity = opacity;
        }
    }

    /**
     * Définit le mode de dimensionnement
     */
    public setScaleMode(mode: 'fixed' | 'adaptive' | 'distance'): void {
        this.scaleMode = mode;
        this.updateSpriteScale();
    }

    /**
     * Définit l'échelle de base
     */
    public setBaseScale(scale: number): void {
        this.baseScale = scale;
        this.updateSpriteScale();
    }

    /**
     * Définit les limites d'échelle pour le mode distance
     */
    public setScaleLimits(minScale: number, maxScale: number): void {
        this.minScale = minScale;
        this.maxScale = maxScale;
        this.updateSpriteScale();
    }

    /**
     * Active/désactive le dimensionnement selon la distance
     */
    public setDistanceScaling(enabled: boolean): void {
        this.distanceScaling = enabled;
        this.updateSpriteScale();
    }

    /**
     * Définit la couleur du label avec régénération haute qualité
     */
    public setColor(color: string): void {
        this.labelConfig.color = color;
        this.regenerateTextureWithQuality();
    }

    /**
     * Définit la couleur de fond du label avec régénération haute qualité
     */
    public setBackgroundColor(backgroundColor: string): void {
        this.labelConfig.backgroundColor = backgroundColor;
        this.regenerateTextureWithQuality();
    }

    /**
     * Régénère la texture avec qualité optimale (méthode centralisée)
     */
    private regenerateTextureWithQuality(): void {
        if (!this.sprite) return;
        
        // Redessiner avec la nouvelle configuration
        this.drawTextOnCanvas();
        
        // Régénérer la texture optimisée
        const newTexture = this.createOptimizedTexture();
        const material = this.sprite.material as THREE.SpriteMaterial;
        
        // Nettoyer l'ancienne texture
        if (material.map) {
            material.map.dispose();
        }
        
        // Appliquer la nouvelle texture
        material.map = newTexture;
        material.needsUpdate = true;
    }

    /**
     * Définit la taille de police du label
     */
    public setFontSize(fontSize: number): void {
        this.labelConfig.fontSize = fontSize;
        // Redessiner avec la nouvelle taille
        if (this.sprite) {
            this.drawTextOnCanvas();
            const texture = new THREE.CanvasTexture(this.canvas);
            texture.needsUpdate = true;
            (this.sprite.material as THREE.SpriteMaterial).map = texture;
        }
    }

    /**
     * Définit l'offset par rapport à l'objet parent
     */
    public setOffset(offset: THREE.Vector3): void {
        this.offset.copy(offset);
        if (this.sprite) {
            this.sprite.position.copy(offset);
        }
    }

    /**
     * Obtient l'objet Sprite
     */
    public getSprite(): THREE.Sprite {
        return this.sprite;
    }

    /**
     * Anime le label avec une pulsation
     */
    public startPulsing(intensity: number = 0.1, speed: number = 2): void {
        const originalFontSize = this.labelConfig.fontSize || 12;
        const targetFontSize = originalFontSize * (1 + intensity);

        const animate = () => {
            if (!this.sprite || !this.isVisible) return;

            const time = Date.now() * 0.001 * speed;
            const pulse = Math.sin(time) * 0.5 + 0.5; // 0 à 1

            const scale = 1 + (intensity * pulse);
            this.sprite.scale.setScalar(scale * 0.5); // Base scale 0.5

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Arrête l'animation de pulsation
     */
    public stopPulsing(): void {
        if (this.sprite) {
            this.updateSpriteScale(); // Remettre à l'échelle configurée
        }
    }

    /**
     * Crée un label standard avec des paramètres par défaut
     */
    public static create(
        text: string,
        target: THREE.Object3D | C_objet,
        config: Partial<C_labelConfig> = {}
    ): C_label {
        return new C_label({
            ...config,
            text,
            target,
            fontSize: 10,
            backgroundColor: 'rgba(45, 55, 72, 0.9)',
            color: '#e2e8f0',
            padding: '2px 6px',
            borderRadius: '3px',
            offset: new THREE.Vector3(0, 0.1, 0),
            fadeDistance: 5,
            maxDistance: 15,
            scaleMode: 'adaptive',
            baseScale: 0.15
        });
    }

    /**
     * Crée un label optimisé pour le mode CAO avec rendu haute qualité
     */
    public static createCaoLabel(
        text: string,
        target: THREE.Object3D | C_objet,
        config: Partial<C_labelConfig> = {}
    ): C_label {
        return new C_label({
            ...config,
            text,
            target,
            fontSize: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.85)', // Contraste amélioré
            color: '#ffffff',
            padding: '2px 4px',
            borderRadius: '2px',
            offset: new THREE.Vector3(0, 0.08, 0),
            fadeDistance: 8,
            maxDistance: 12,
            scaleMode: 'distance',
            baseScale: 0.1,
            minScale: 0.05,
            maxScale: 0.2,
            distanceScaling: true
        });
    }

    /**
     * Crée un label haute qualité avec rendu optimisé
     */
    public static createHighQualityLabel(
        text: string,
        target: THREE.Object3D | C_objet,
        config: Partial<C_labelConfig> = {}
    ): C_label {
        return new C_label({
            ...config,
            text,
            target,
            fontSize: 10,
            backgroundColor: 'rgba(26, 32, 44, 0.95)', // Couleur professionnelle
            color: '#f7fafc',
            padding: '3px 6px',
            borderRadius: '3px',
            offset: new THREE.Vector3(0, 0.1, 0),
            fadeDistance: 10,
            maxDistance: 20,
            scaleMode: 'adaptive',
            baseScale: 0.12,
            minScale: 0.08,
            maxScale: 0.25,
            distanceScaling: true
        });
    }

    /**
     * Crée un label temporaire
     */
    public static createTemporary(
        text: string,
        target: THREE.Object3D | C_objet,
        duration: number = 3000,
        config: Partial<C_labelConfig> = {}
    ): C_label {
        const label = new C_label({
            ...config,
            text,
            target
        });

        // Auto-destruction après délai
        setTimeout(() => {
            label.queue_free();
        }, duration);

        return label;
    }

    /**
     * Crée un label d'information (style tooltip)
     */
    public static createTooltip(
        text: string,
        target: THREE.Object3D | C_objet,
        config: Partial<C_labelConfig> = {}
    ): C_label {
        return new C_label({
            ...config,
            text,
            target,
            fontSize: 10,
            backgroundColor: 'rgba(45, 55, 72, 0.9)',
            color: '#e2e8f0',
            padding: '2px 6px',
            borderRadius: '3px',
            offset: new THREE.Vector3(0, 0.1, 0),
            fadeDistance: 5,
            maxDistance: 15
        });
    }


    /**
     * Nettoyage des ressources
     */
    private cleanup(): void {
        if (this.sprite) {
            // Retirer de la hiérarchie
            if (this.sprite.parent) {
                this.sprite.parent.remove(this.sprite);
            }

            // Nettoyer les ressources
            if (this.sprite.material) {
                const material = this.sprite.material as THREE.SpriteMaterial;
                if (material.map) {
                    material.map.dispose();
                }
                material.dispose();
            }
        }
    }

    /**
     * Informations de debug détaillées
     */
    public get_debug_info(): object {
        return {
            ...super.get_debug_info(),
            text: this.text,
            isVisible: this.isVisible,
            fontSize: this.labelConfig.fontSize,
            color: this.labelConfig.color,
            backgroundColor: this.labelConfig.backgroundColor,
            target: this.target ? (this.target instanceof C_objet ? this.target.name : this.target.name) : null,
            offset: this.offset,
            fadeDistance: this.fadeDistance,
            maxDistance: this.maxDistance
        };
    }
}

export default C_label;