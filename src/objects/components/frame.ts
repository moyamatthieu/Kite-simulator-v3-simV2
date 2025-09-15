/**
 * `tube.ts` - Objet tube/cylindre structurel pour la simulation
 *
 * Représente un tube/cylindre entre deux points dans l'espace 3D.
 * Utile pour les baguettes, armatures, cadres rigides, ou structures tubulaires.
 */

import * as THREE from 'three';
import { C_objet, C_objetConfig } from '../../class/C_objet';
import { Point } from './point';

export interface Frame_Config extends C_objetConfig {
    pointA?: Point;
    pointB?: Point;
    radius?: number;
    color?: number;
    position?: THREE.Vector3;
    name?: string;
    radialSegments?: number;
    material?: 'standard' | 'basic' | 'phong';
    wireframe?: boolean;
    opacity?: number;
    metalness?: number;
    roughness?: number;
}

export class Frame extends C_objet {
    private cylinder!: THREE.Mesh;
    private pointA: Point | null;
    private pointB: Point | null;
    private radius: number;
    private color: number;
    private radialSegments: number;
    private materialType: 'standard' | 'basic' | 'phong';
    private wireframe: boolean;
    private opacity: number;
    private metalness: number;
    private roughness: number;
    private currentLength: number = 0;

    constructor(config: Frame_Config = {}) {
        super(config);

        this.pointA = config.pointA || null;
        this.pointB = config.pointB || null;
        this.radius = config.radius || 0.02;
        this.color = config.color || 0x8B4513; // Brun baguette
        this.radialSegments = config.radialSegments || 8;
        this.materialType = config.material || 'standard';
        this.wireframe = config.wireframe || false;
        this.opacity = config.opacity || 1.0;
        this.metalness = config.metalness || 0.1;
        this.roughness = config.roughness || 0.7;

        this.group.name = config.name || 'Tube';
    }

    /**
     * Phase d'initialisation personnalisée (Godot _init)
     * Appelée automatiquement dans le constructeur de C_objet
     */
    protected _init(): void {
        super._init();
        console.log(`🔧 Tube ${this.name} initialisé`);
    }

    /**
     * Phase d'entrée dans le scene tree (Godot _enter_tree)
     * Création de la géométrie cylindrique
     */
    protected _enter_tree(): void {
        super._enter_tree();
        if (this.pointA && this.pointB) {
            this.createTubeGeometry();
            console.log(`🔧 Tube ${this.name} ajouté au scene tree (rayon: ${this.radius})`);
        } else {
            console.warn(`🔧 Tube ${this.name} manque de points A ou B`);
        }
    }

    /**
     * Phase de préparation finale (Godot _ready)
     * Configuration finale après que tous les enfants soient prêts
     */
    protected _ready(): void {
        super._ready();
        this.setupPhysicsProperties();
        console.log(`🔧 Tube ${this.name} prêt`);
    }

    /**
     * Phase de sortie du scene tree (Godot _exit_tree)
     * Nettoyage des ressources spécifiques
     */
    protected _exit_tree(): void {
        super._exit_tree();
        this.clearTubeGeometry();
        console.log(`🔧 Tube ${this.name} retiré du scene tree`);
    }

    /**
     * Configuration des propriétés physiques du tube
     */
    private setupPhysicsProperties(): void {
        if (this.cylinder && this.pointA && this.pointB) {
            this.cylinder.userData.physics = {
                type: 'tube',
                pointA: this.pointA,
                pointB: this.pointB,
                radius: this.radius,
                length: this.getLength(),
                rigidity: 1.0, // Tube rigide par défaut
                mass: this.getMass()
            };
        }
    }

    /**
     * Création de la géométrie du tube
     */
    private createTubeGeometry(): void {
        if (!this.pointA || !this.pointB) return;

        const posA = this.pointA.get_position();
        const posB = this.pointB.get_position();
        const length = posA.distanceTo(posB);
        this.currentLength = length;

        // Créer la géométrie cylindrique
        const geometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            length,
            this.radialSegments
        );

        // Créer le matériau selon le type spécifié
        const material = this.createMaterial();

        // Créer le mesh
        this.cylinder = new THREE.Mesh(geometry, material);
        this.cylinder.castShadow = true;
        this.cylinder.receiveShadow = true;
        this.cylinder.name = 'TubeCylinder';

        // Positionner et orienter le cylindre entre les deux points
        this.updateTubeTransform();

        this.group.add(this.cylinder);
    }

    /**
     * Crée le matériau selon le type spécifié
     */
    private createMaterial(): THREE.Material {
        const materialOptions = {
            color: this.color,
            wireframe: this.wireframe,
            transparent: this.opacity < 1,
            opacity: this.opacity
        };

        switch (this.materialType) {
            case 'basic':
                return new THREE.MeshBasicMaterial(materialOptions);
            case 'phong':
                return new THREE.MeshPhongMaterial({
                    ...materialOptions,
                    shininess: 100
                });
            case 'standard':
            default:
                return new THREE.MeshStandardMaterial({
                    ...materialOptions,
                    metalness: this.metalness,
                    roughness: this.roughness
                });
        }
    }

    /**
     * Met à jour la transformation du tube (position, rotation) selon les points
     */
    private updateTubeTransform(): void {
        if (!this.cylinder || !this.pointA || !this.pointB) return;

        const posA = this.pointA.get_position();
        const posB = this.pointB.get_position();

        // Position au centre entre les deux points
        const center = posA.clone().add(posB).multiplyScalar(0.5);
        this.cylinder.position.copy(center);

        // Orientation vers le point B
        const direction = posB.clone().sub(posA).normalize();
        const up = new THREE.Vector3(0, 1, 0);

        // Si la direction est parallèle à Y, utiliser Z comme référence
        if (Math.abs(direction.dot(up)) > 0.99) {
            up.set(0, 0, 1);
        }

        this.cylinder.lookAt(posB);
        this.cylinder.rotateX(Math.PI / 2); // Corriger l'orientation du cylindre
    }

    /**
     * Nettoyage de la géométrie du tube
     */
    private clearTubeGeometry(): void {
        if (this.cylinder) {
            this.group.remove(this.cylinder);
            if (this.cylinder.geometry) {
                this.cylinder.geometry.dispose();
            }
            if (this.cylinder.material) {
                if (Array.isArray(this.cylinder.material)) {
                    this.cylinder.material.forEach(material => material.dispose());
                } else {
                    this.cylinder.material.dispose();
                }
            }
        }
    }

    /**
     * Définit les points de connexion du tube
     */
    public setPoints(pointA: Point, pointB: Point): void {
        this.pointA = pointA;
        this.pointB = pointB;

        // Recréer la géométrie
        this.clearTubeGeometry();
        this.createTubeGeometry();
    }

    /**
     * Définit le point A
     */
    public setPointA(point: Point): void {
        this.pointA = point;
        if (this.pointB) {
            this.updateTubeTransform();
        }
    }

    /**
     * Définit le point B
     */
    public setPointB(point: Point): void {
        this.pointB = point;
        if (this.pointA) {
            this.updateTubeTransform();
        }
    }

    /**
     * Obtient le point A
     */
    public getPointA(): Point | null {
        return this.pointA;
    }

    /**
     * Obtient le point B
     */
    public getPointB(): Point | null {
        return this.pointB;
    }

    /**
     * Définit le rayon du tube
     */
    public setRadius(radius: number): void {
        this.radius = radius;

        // Recréer la géométrie avec le nouveau rayon
        this.clearTubeGeometry();
        this.createTubeGeometry();
    }

    /**
     * Obtient le rayon actuel du tube
     */
    public getRadius(): number {
        return this.radius;
    }

    /**
     * Définit la couleur du tube
     */
    public setColor(color: number): void {
        this.color = color;
        if (this.cylinder && this.cylinder.material instanceof THREE.Material) {
            (this.cylinder.material as any).color?.setHex(color);
        }
    }

    /**
     * Obtient la couleur actuelle du tube
     */
    public getColor(): number {
        return this.color;
    }

    /**
     * Calcule la longueur actuelle du tube
     */
    public getLength(): number {
        if (!this.pointA || !this.pointB) return 0;
        return this.pointA.get_position().distanceTo(this.pointB.get_position());
    }

    /**
     * Calcule le volume du tube
     */
    public getVolume(): number {
        const length = this.getLength();
        return Math.PI * this.radius * this.radius * length;
    }

    /**
     * Calcule la masse du tube (basée sur le volume et une densité)
     */
    public getMass(density: number = 1000): number {
        return this.getVolume() * density;
    }

    /**
     * Obtient le mesh du cylindre
     */
    public getCylinder(): THREE.Mesh {
        return this.cylinder;
    }

    /**
     * Définit l'opacité du tube
     */
    public setOpacity(opacity: number): void {
        this.opacity = opacity;
        if (this.cylinder && this.cylinder.material instanceof THREE.Material) {
            (this.cylinder.material as any).transparent = opacity < 1;
            (this.cylinder.material as any).opacity = opacity;
        }
    }

    /**
     * Active/désactive le wireframe
     */
    public setWireframe(wireframe: boolean): void {
        this.wireframe = wireframe;
        if (this.cylinder && this.cylinder.material instanceof THREE.Material) {
            (this.cylinder.material as any).wireframe = wireframe;
        }
    }

    /**
     * Met à jour la géométrie si les points ont bougé
     * À appeler dans la boucle de rendu si nécessaire
     */
    public updateGeometry(): void {
        if (this.cylinder && this.pointA && this.pointB) {
            const newLength = this.getLength();

            // Si la longueur a changé significativement, recréer la géométrie
            if (Math.abs(newLength - (this.currentLength || 0)) > 0.001) {
                this.clearTubeGeometry();
                this.createTubeGeometry();
            } else {
                // Sinon, juste mettre à jour la transformation
                this.updateTubeTransform();
            }
        }
    }

    /**
     * Crée un tube temporaire qui se détruit automatiquement
     */
    public static createTemporary(
        pointA: Point,
        pointB: Point,
        duration: number = 3000,
        config: Frame_Config = {}
    ): Frame {
        const frame = new Frame({
            ...config,
            pointA: pointA,
            pointB: pointB
        });

        setTimeout(() => {
            frame.queue_free();
        }, duration);

        return frame;
    }

    /**
     * Crée un tube de baguette de cerf-volant
     */
    public static createKiteStrut(
        pointA: Point,
        pointB: Point,
        config: Frame_Config = {}
    ): Frame {
        return new Frame({
            ...config,
            pointA: pointA,
            pointB: pointB,
            radius: 0.003, // 3mm de rayon
            color: 0x8B4513, // Brun baguette
            material: 'standard',
            metalness: 0.1,
            roughness: 0.8
        });
    }

    /**
     * Informations de debug pour le tube (style Godot)
     */
    public get_debug_info(): object {
        return {
            ...super.get_debug_info(),
            pointA: this.pointA?.name || 'null',
            pointB: this.pointB?.name || 'null',
            radius: this.radius,
            length: this.getLength(),
            volume: this.getVolume(),
            color: this.color.toString(16),
            materialType: this.materialType,
            wireframe: this.wireframe,
            opacity: this.opacity
        };
    }
}