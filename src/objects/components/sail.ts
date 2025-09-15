/**
 * `sail.ts` - Objet voile/surface portante pour la simulation
 *
 * Représente une voile composée de triangles entre des points.
 * Utile pour les voiles de cerf-volant, parachutes, ailes, ou autres surfaces aérodynamiques.
 */

import * as THREE from 'three';
import { C_objet, C_objetConfig } from '../../class/C_objet';
import { Point, PointConfig } from './point';

export interface SailConfig extends C_objetConfig {
    points?: Point[];
    triangles?: [number, number, number][];
    color?: number;
    opacity?: number;
    position?: THREE.Vector3;
    name?: string;
    doubleSided?: boolean;
    wireframe?: boolean;
    aerodynamic?: boolean;
    liftCoefficient?: number;
    dragCoefficient?: number;
}

export class Sail extends C_objet {
    private surfaces: THREE.Mesh[] = [];
    private wireframeLines: THREE.Line[] = [];
    private points: Point[];
    private triangles: [number, number, number][];
    private color: number;
    private opacity: number;
    private doubleSided: boolean;
    private wireframe: boolean;
    private aerodynamic: boolean;
    private liftCoefficient: number;
    private dragCoefficient: number;

    constructor(config: SailConfig = {}) {
        super(config);

        this.points = config.points || [];
        this.triangles = config.triangles || this.generateDefaultTriangles();
        this.color = config.color || 0xffffff;
        this.opacity = config.opacity || 0.8;
        this.doubleSided = config.doubleSided || true;
        this.wireframe = config.wireframe || false;
        this.aerodynamic = config.aerodynamic || false;
        this.liftCoefficient = config.liftCoefficient || 1.0;
        this.dragCoefficient = config.dragCoefficient || 0.1;

        this.group.name = config.name || 'Sail';
    }

    /**
     * Génère les triangles par défaut (triangulation simple)
     */
    private generateDefaultTriangles(): [number, number, number][] {
        const triangles: [number, number, number][] = [];

        // Triangulation simple : pour chaque groupe de 3 points consécutifs
        for (let i = 0; i <= this.points.length - 3; i++) {
            triangles.push([i, i + 1, i + 2]);
        }

        return triangles;
    }

    /**
     * Phase d'initialisation personnalisée (Godot _init)
     * Appelée automatiquement dans le constructeur de C_objet
     */
    protected _init(): void {
        super._init();
        // Configuration spécifique à Sail peut être ajoutée ici
        console.log(`🪁 Voile ${this.name} initialisée`);
    }

    /**
     * Phase d'entrée dans le scene tree (Godot _enter_tree)
     * Création des surfaces triangulaires
     */
    protected _enter_tree(): void {
        super._enter_tree();
        this.createSurfaces();

        if (this.wireframe) {
            this.createWireframe();
        }

        console.log(`🪁 Voile ${this.name} ajoutée au scene tree (${this.surfaces.length} triangles)`);
    }

    /**
     * Phase de préparation finale (Godot _ready)
     * Configuration finale après que tous les enfants soient prêts
     */
    protected _ready(): void {
        super._ready();
        // Configuration finale de la physique aérodynamique
        if (this.aerodynamic) {
            this.setupAerodynamics();
        }
        console.log(`🪁 Voile ${this.name} prête (surface: ${this.getArea()}m²)`);
    }

    /**
     * Configuration des propriétés aérodynamiques
     */
    private setupAerodynamics(): void {
        // Configuration spécifique à l'aérodynamique
        // Peut être étendue pour des calculs plus complexes
        if (this.surfaces.length > 0) {
            this.surfaces[0].userData.aerodynamic = {
                liftCoefficient: this.liftCoefficient,
                dragCoefficient: this.dragCoefficient,
                area: this.getArea()
            };
        }
    }

    private createSurfaces(): void {
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            transparent: this.opacity < 1,
            opacity: this.opacity,
            side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            roughness: 0.1,
            metalness: 0.0
        });

        this.triangles.forEach((triangle, index) => {
            const [aIdx, bIdx, cIdx] = triangle;

            if (aIdx >= this.points.length || bIdx >= this.points.length || cIdx >= this.points.length) return;

            const surface = this.createTriangleSurface(
                this.points[aIdx].get_position(),
                this.points[bIdx].get_position(),
                this.points[cIdx].get_position(),
                material
            );
            surface.name = `SailTriangle_${index}`;
            this.surfaces.push(surface);
            this.group.add(surface);
        });
    }

    private createTriangleSurface(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, material: THREE.Material): THREE.Mesh {
        // Créer la géométrie triangulaire
        const geometry = new THREE.BufferGeometry();

        // Positions des sommets
        const positions = new Float32Array([
            a.x, a.y, a.z,  // Sommet A
            b.x, b.y, b.z,  // Sommet B
            c.x, c.y, c.z   // Sommet C
        ]);

        // Normales pour l'éclairage (calculées automatiquement)
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        // Indices des triangles (un seul triangle)
        geometry.setIndex([0, 1, 2]);

        const surface = new THREE.Mesh(geometry, material);
        surface.castShadow = true;
        surface.receiveShadow = true;

        return surface;
    }

    /**
     * Phase de sortie du scene tree (Godot _exit_tree)
     * Nettoyage des ressources spécifiques
     */
    protected _exit_tree(): void {
        super._exit_tree();
        this.clearGeometry();
        console.log(`🪁 Voile ${this.name} retirée du scene tree`);
    }

    private createWireframe(): void {
        // Créer des lignes pour le wireframe entre les points des triangles
        this.triangles.forEach(triangle => {
            const [aIdx, bIdx, cIdx] = triangle;

            if (aIdx >= this.points.length || bIdx >= this.points.length || cIdx >= this.points.length) return;

            // Ligne A-B
            this.createWireframeLine(this.points[aIdx].get_position(), this.points[bIdx].get_position());
            // Ligne B-C
            this.createWireframeLine(this.points[bIdx].get_position(), this.points[cIdx].get_position());
            // Ligne C-A
            this.createWireframeLine(this.points[cIdx].get_position(), this.points[aIdx].get_position());
        });
    }

    private createWireframeLine(start: THREE.Vector3, end: THREE.Vector3): void {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        this.wireframeLines.push(line);
        this.group.add(line);
    }

    /**
     * Définit les points de la voile
     */
    public setPoints(points: Point[]): void {
        this.points = points;
        this.triangles = this.generateDefaultTriangles();

        // Recréer la géométrie
        this.clearGeometry();
        this.createSurfaces();
        if (this.wireframe) {
            this.createWireframe();
        }
    }

    /**
     * Définit les triangles de la voile
     */
    public setTriangles(triangles: [number, number, number][]): void {
        this.triangles = triangles;

        // Recréer la géométrie
        this.clearGeometry();
        this.createSurfaces();
        if (this.wireframe) {
            this.createWireframe();
        }
    }

    /**
     * Définit la couleur de la voile
     */
    public setColor(color: number): void {
        this.color = color;
        this.surfaces.forEach(surface => {
            if (surface.material instanceof THREE.MeshStandardMaterial) {
                surface.material.color.setHex(color);
            }
        });
    }

    /**
     * Obtient la couleur actuelle de la voile
     */
    public getColor(): number {
        return this.color;
    }

    /**
     * Définit l'opacité de la voile
     */
    public setOpacity(opacity: number): void {
        this.opacity = opacity;
        this.surfaces.forEach(surface => {
            if (surface.material instanceof THREE.MeshStandardMaterial) {
                surface.material.transparent = opacity < 1;
                surface.material.opacity = opacity;
            }
        });
    }

    /**
     * Obtient l'opacité actuelle de la voile
     */
    public getOpacity(): number {
        return this.opacity;
    }

    /**
     * Définit si la voile est visible des deux côtés
     */
    public setDoubleSided(doubleSided: boolean): void {
        this.doubleSided = doubleSided;
        this.surfaces.forEach(surface => {
            if (surface.material instanceof THREE.MeshStandardMaterial) {
                surface.material.side = doubleSided ? THREE.DoubleSide : THREE.FrontSide;
            }
        });
    }

    /**
     * Active/désactive le wireframe
     */
    public setWireframe(wireframe: boolean): void {
        if (this.wireframe === wireframe) return;

        this.wireframe = wireframe;

        if (wireframe && this.wireframeLines.length === 0) {
            this.createWireframe();
        } else if (!wireframe && this.wireframeLines.length > 0) {
            this.wireframeLines.forEach(line => {
                this.group.remove(line);
                line.geometry.dispose();
                if (line.material instanceof THREE.Material) {
                    line.material.dispose();
                }
            });
            this.wireframeLines.length = 0;
        }
    }

    /**
     * Obtient les points de la voile
     */
    public getPoints(): Point[] {
        return this.points;
    }

    /**
     * Obtient les triangles de la voile
     */
    public getTriangles(): [number, number, number][] {
        return this.triangles;
    }

    /**
     * Calcule l'aire totale de la voile
     */
    public getArea(): number {
        let totalArea = 0;

        this.triangles.forEach(triangle => {
            const [aIdx, bIdx, cIdx] = triangle;
            if (aIdx >= this.points.length || bIdx >= this.points.length || cIdx >= this.points.length) return;

            const a = this.points[aIdx].get_position();
            const b = this.points[bIdx].get_position();
            const c = this.points[cIdx].get_position();

            // Calcul de l'aire d'un triangle avec la formule du produit vectoriel
            const ab = b.clone().sub(a);
            const ac = c.clone().sub(a);
            const cross = ab.cross(ac);
            totalArea += cross.length() / 2;
        });

        return totalArea;
    }

    /**
     * Active/désactive les propriétés aérodynamiques
     */
    public setAerodynamic(aerodynamic: boolean): void {
        this.aerodynamic = aerodynamic;
        if (aerodynamic) {
            this.setupAerodynamics();
        }
    }

    /**
     * Définit les coefficients aérodynamiques
     */
    public setAerodynamicCoefficients(lift: number, drag: number): void {
        this.liftCoefficient = lift;
        this.dragCoefficient = drag;

        if (this.aerodynamic) {
            this.setupAerodynamics();
        }
    }

    /**
     * Obtient les coefficients aérodynamiques
     */
    public getAerodynamicCoefficients(): { lift: number; drag: number } {
        return {
            lift: this.liftCoefficient,
            drag: this.dragCoefficient
        };
    }

    /**
     * Anime la voile avec une pulsation
     */
    public startPulsing(intensity: number = 0.2, speed: number = 1): void {
        const originalScale = this.get_scale().clone();
        const targetScale = originalScale.clone().multiplyScalar(1 + intensity);

        const animate = () => {
            const time = Date.now() * 0.001 * speed;
            const pulse = Math.sin(time) * 0.5 + 0.5;

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
        this.set_scale(new THREE.Vector3(1, 1, 1));
    }

    /**
     * Crée une voile temporaire qui se détruit automatiquement
     */
    public static createTemporary(
        points: Point[],
        triangles: [number, number, number][],
        duration: number = 3000,
        config: SailConfig = {}
    ): Sail {
        const sail = new Sail({
            ...config,
            points: points,
            triangles: triangles
        });

        setTimeout(() => {
            sail.queue_free();
        }, duration);

        return sail;
    }

    /**
     * Crée une voile de cerf-volant triangulaire simple
     */
    public static createKiteSail(
        span: number = 2,
        height: number = 1.5,
        config: SailConfig = {}
    ): Sail {
        const points: Point[] = [
            new Point({ position: new THREE.Vector3(0, 0, 0), radius: 0.01, color: 0x666666 }),           // 0: base avant
            new Point({ position: new THREE.Vector3(span/2, 0, 0), radius: 0.01, color: 0x666666 }),      // 1: base droite
            new Point({ position: new THREE.Vector3(-span/2, 0, 0), radius: 0.01, color: 0x666666 }),     // 2: base gauche
            new Point({ position: new THREE.Vector3(0, height, 0), radius: 0.01, color: 0x666666 }),      // 3: sommet
        ];

        const triangles: [number, number, number][] = [
            [0, 1, 3], // Triangle avant-droite-sommet
            [0, 3, 2]  // Triangle avant-sommet-gauche
        ];

        return new Sail({
            ...config,
            points: points,
            triangles: triangles,
            color: 0x87CEEB, // Bleu ciel
            opacity: 0.8,
            doubleSided: true,
            aerodynamic: true
        });
    }

    private clearGeometry(): void {
        // Nettoyer les surfaces existantes
        this.surfaces.forEach(surface => {
            this.group.remove(surface);
            surface.geometry.dispose();
            if (surface.material instanceof THREE.Material) {
                surface.material.dispose();
            }
        });
        this.surfaces.length = 0;

        // Nettoyer les lignes de wireframe
        this.wireframeLines.forEach(line => {
            this.group.remove(line);
            line.geometry.dispose();
            if (line.material instanceof THREE.Material) {
                line.material.dispose();
            }
        });
        this.wireframeLines.length = 0;
    }

    /**
     * Informations de debug pour la voile (style Godot)
     */
    public get_debug_info(): object {
        return {
            ...super.get_debug_info(),
            pointCount: this.points.length,
            triangleCount: this.surfaces.length,
            totalArea: this.getArea(),
            color: this.color.toString(16),
            opacity: this.opacity,
            doubleSided: this.doubleSided,
            wireframe: this.wireframe,
            aerodynamic: this.aerodynamic,
            liftCoefficient: this.liftCoefficient,
            dragCoefficient: this.dragCoefficient
        };
    }

    public getFaceInfo(): { normal: THREE.Vector3, center: THREE.Vector3, area: number } {
        if (this.triangles.length === 0 || this.points.length < 3) {
            return {
                normal: new THREE.Vector3(0, 1, 0),
                center: this.get_position(),
                area: 0
            };
        }

        // For simplicity, we take the first triangle to represent the face
        const [aIdx, bIdx, cIdx] = this.triangles[0];
        const a = this.points[aIdx].get_position();
        const b = this.points[bIdx].get_position();
        const c = this.points[cIdx].get_position();

        const ab = b.clone().sub(a);
        const ac = c.clone().sub(a);

        const normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
        const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
        const area = this.getArea(); // This calculates the area of all triangles, which is fine if a sail represents one face.

        return { normal, center, area };
    }
}
