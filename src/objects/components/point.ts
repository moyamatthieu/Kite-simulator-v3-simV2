/**
 * `point.ts` - Objet point visuel pour la simulation
 *
 * Représente un point dans l'espace 3D avec une sphère visible.
 * Utile pour le debug, les marqueurs de position, ou les indicateurs visuels.
 */

import * as THREE from 'three';
import { z } from 'zod';
import { C_objet } from '@class/C_objet';
import type { C_objetConfig } from '../types';

export interface PointConfig extends C_objetConfig {
    radius?: number;
    color?: number;
    position?: THREE.Vector3;
    name?: string;
}

/**
 * Schéma Zod pour la validation de PointConfig
 */
    radius: z.number().min(0.001).max(10).optional(),
    color: z.number().int().optional(),
    position: z.any().optional(), // Vector3, validation custom possible
    name: z.string().optional(),
});

/**
 * Classe Point - Représente un point visuel 3D avec validation Zod et gestion stricte des ressources Three.js.
 */
export class Point extends C_objet {
    private sphere!: THREE.Mesh;
    private radius: number;
    private color: number;

    /**
     * Constructeur du point 3D avec validation Zod du config.
     * @param config Configuration du point (validée par Zod)
     */
    constructor(config: PointConfig = {}) {
        // Validation Zod
        const parseResult = PointConfigSchema.safeParse(config);
        if (!parseResult.success) {
            console.error('❌ PointConfig invalide :', parseResult.error);
            throw new Error('PointConfig invalide');
        }
        super(config);

        this.radius = config.radius || 0.05;
        this.color = config.color || 0xff0000; // Rouge par défaut

        this.group.name = config.name || 'Point';
    }

    /**
     * Phase d'initialisation personnalisée (Godot _init)
     * Appelée automatiquement dans le constructeur de C_objet
     */
    protected _init(): void {
        super._init();
        console.log(`🔴 Point ${this.name} initialisé`);
    }

    /**
     * Phase d'entrée dans le scene tree (Godot _enter_tree)
     * Création de la géométrie sphérique
     */
    protected _enter_tree(): void {
        super._enter_tree();
        this.createPointGeometry();
        console.log(`🔴 Point ${this.name} ajouté au scene tree (rayon: ${this.radius})`);
    }

    /**
     * Phase de préparation finale (Godot _ready)
     * Configuration finale après que tous les enfants soient prêts
     */
    protected _ready(): void {
        super._ready();
        // Configuration des propriétés de debug si nécessaire
        this.setupDebugProperties();
        console.log(`🔴 Point ${this.name} prêt`);
    }

    /**
     * Phase de sortie du scene tree (Godot _exit_tree)
     * Nettoyage des ressources spécifiques
     */
    protected _exit_tree(): void {
        super._exit_tree();
        this.clearPointGeometry();
        console.log(`🔴 Point ${this.name} retiré du scene tree`);
    }

    /**
     * Création de la géométrie du point
     */
    private createPointGeometry(): void {
        // Création de la géométrie sphérique
        const geometry = new THREE.SphereGeometry(this.radius, 16, 12);

        // Matériau avec couleur et propriétés
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.4,
            metalness: 0.1,
            transparent: false
        });

        // Création du mesh
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.castShadow = true;
        this.sphere.receiveShadow = true;
        this.sphere.name = 'PointSphere';

        this.group.add(this.sphere);
        console.log(`✅ Point ${this.name} géométrie créée avec succès (rayon: ${this.radius})`);
    }

    /**
     * Configuration des propriétés de debug du point
     */
    private setupDebugProperties(): void {
        // Ajouter les informations de debug aux userData
        if (this.sphere) {
            this.sphere.userData.debug = {
                type: 'point',
                radius: this.radius,
                color: this.color
            };
        }
    }

    /**
     * Nettoyage de la géométrie du point
     */
    private clearPointGeometry(): void {
        if (this.sphere) {
            this.group.remove(this.sphere);
            if (this.sphere.geometry) {
                this.sphere.geometry.dispose();
            }
            if (this.sphere.material) {
                if (Array.isArray(this.sphere.material)) {
                    this.sphere.material.forEach(material => material.dispose());
                } else {
                    this.sphere.material.dispose();
                }
            }
        }
    }

    /**
     * Définit la couleur du point
     */
    public setColor(color: number): void {
        this.color = color;
        if (this.sphere.material instanceof THREE.MeshStandardMaterial) {
            this.sphere.material.color.setHex(color);
        }
    }

    /**
     * Obtient la couleur actuelle du point
     */
    public getColor(): number {
        return this.color;
    }

    /**
     * Définit le rayon du point
     */
    public setRadius(radius: number): void {
        this.radius = radius;

        // Recréer la géométrie avec le nouveau rayon
        if (this.sphere.geometry) {
            this.sphere.geometry.dispose();
        }

        const newGeometry = new THREE.SphereGeometry(radius, 16, 12);
        this.sphere.geometry = newGeometry;
    }

    /**
     * Obtient le rayon actuel du point
     */
    public getRadius(): number {
        return this.radius;
    }


    /**
     * Obtient le mesh de la sphère
     */
    public getSphere(): THREE.Mesh {
        return this.sphere;
    }

    /**
     * Définit l'opacité du point (0 = transparent, 1 = opaque)
     */
    public setOpacity(opacity: number): void {
        if (this.sphere.material instanceof THREE.MeshStandardMaterial) {
            this.sphere.material.transparent = opacity < 1;
            this.sphere.material.opacity = opacity;
        }
    }

    /**
     * Obtient l'opacité actuelle du point
     */
    public getOpacity(): number {
        if (this.sphere.material instanceof THREE.MeshStandardMaterial) {
            return this.sphere.material.opacity;
        }
        return 1;
    }

    /**
     * Anime le point avec une pulsation
     */
    public startPulsing(intensity: number = 0.3, speed: number = 2): void {
        const originalScale = this.get_scale().clone();
        const targetScale = originalScale.clone().multiplyScalar(1 + intensity);

        const animate = () => {
            const time = Date.now() * 0.001 * speed;
            const pulse = Math.sin(time) * 0.5 + 0.5; // 0 à 1

            const currentScale = originalScale.clone().lerp(targetScale, pulse);
            this.set_scale(currentScale);

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Arrête l'animation de pulsation
     */
    public stopPulsing(): void {
        // Remettre à l'échelle originale
        this.set_scale(new THREE.Vector3(1, 1, 1));
    }

    /**
     * Crée un point temporaire qui se détruit automatiquement
     */
    public static createTemporary(
        position: THREE.Vector3,
        duration: number = 2000,
        config: PointConfig = {}
    ): Point {
        const point = new Point({
            ...config,
            position: position
        });

        // Animation d'apparition
        point.setOpacity(0);
        point.setOpacity(1);

        // Destruction automatique après la durée
        setTimeout(() => {
            point.queue_free();
        }, duration);

        return point;
    }


    /**
     * Clone ce point (compatibilité avec l'interface Point du types.ts)
     */
    public clone(): Point {
        return new Point({
            radius: this.radius,
            color: this.color,
            position: this.get_position().clone(),
            name: this.name + '_clone'
        });
    }

    /**
     * Applique une quaternion à la position du point (compatibilité debug)
     */
    public applyQuaternion(quaternion: THREE.Quaternion): Point {
        const pos = this.get_position();
        pos.applyQuaternion(quaternion);
        this.set_position(pos);
        return this;
    }

    /**
     * Ajoute une position à ce point (compatibilité debug)
     */
    public add(vector: THREE.Vector3): Point {
        const pos = this.get_position();
        pos.add(vector);
        this.set_position(pos);
        return this;
    }

    /**
     * Informations de debug pour le point (style Godot)
     */
    public get_debug_info(): object {
        return {
            ...super.get_debug_info(),
            radius: this.radius,
            color: this.color.toString(16),
            opacity: this.getOpacity()
        };
    }
}
