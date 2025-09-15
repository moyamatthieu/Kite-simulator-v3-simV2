
import * as THREE from 'three';
import { z } from 'zod';
import { C_objet, C_objetConfig } from '../class/C_objet';
import { Point, PointConfig } from './components/point';
import { Frame, Frame_Config } from './components/frame';
import { Sail, SailConfig } from './components/sail';
import { C_label } from '../class/C_label';
import { KiteControlPoint } from '../enum';
import { KiteState } from '../core/constants';

export class KiteGeometry {
    static readonly POINTS = new Map<string, [number, number, number]>([
        ["NEZ", [0, 0.65, 0]],
        ['SPINE_BAS', [0, 0, 0]],
        ['CENTRE', [0, 0.1625, 0]],
        ['BORD_GAUCHE', [-0.825, 0, 0]],
        ['BORD_DROIT', [0.825, 0, 0]],
        ['INTER_GAUCHE', [-0.4125, 0.1625, 0]],
        ['INTER_DROIT', [0.4125, 0.1625, 0]],
        ['FIX_GAUCHE', [-0.275, 0.1625, 0]],
        ['FIX_DROIT', [0.275, 0.1625, 0]],
        ['WHISKER_GAUCHE', [-0.4125, 0.1, -0.15]],
        ['WHISKER_DROIT', [0.4125, 0.1, -0.15]],
        [KiteControlPoint.CTRL_GAUCHE, [-0.15, 0.3, 0.4]],
        [KiteControlPoint.CTRL_DROIT, [0.15, 0.3, 0.4]]
    ]);

    static readonly FRAME_ELEMENTS = [
        {
            name: 'bord_attaque_gauche',
            points: [KiteControlPoint.NEZ, 'BORD_GAUCHE'] as [string, string],
            radius: 0.003,
            color: 0x2a2a2a
        },
        {
            name: 'bord_attaque_droit',
            points: [KiteControlPoint.NEZ, 'BORD_DROIT'] as [string, string],
            radius: 0.003,
            color: 0x2a2a2a
        },
        {
            name: 'spine_centrale',
            points: [KiteControlPoint.NEZ, 'SPINE_BAS'] as [string, string],
            radius: 0.003,
            color: 0x2a2a2a
        },
        {
            name: 'spreader',
            points: ['INTER_GAUCHE', 'INTER_DROIT'] as [string, string],
            radius: 0.0025,
            color: 0x333333
        },
        {
            name: 'whisker_gauche',
            points: ['FIX_GAUCHE', 'WHISKER_GAUCHE'] as [string, string],
            radius: 0.002,
            color: 0x444444
        },
        {
            name: 'whisker_droit',
            points: ['FIX_DROIT', 'WHISKER_DROIT'] as [string, string],
            radius: 0.002,
            color: 0x444444
        }
    ];

    static readonly SURFACES = [
        {
            name: 'surface_gauche_haute',
            vertices: [KiteControlPoint.NEZ, 'INTER_GAUCHE', 'BORD_GAUCHE'] as [string, string, string],
            color: 0xff3333
        },
        {
            name: 'surface_gauche_basse',
            vertices: ['INTER_GAUCHE', 'CENTRE', 'SPINE_BAS'] as [string, string, string],
            color: 0xff6666
        },
        {
            name: 'surface_droite_haute',
            vertices: [KiteControlPoint.NEZ, 'BORD_DROIT', 'INTER_DROIT'] as [string, string, string],
            color: 0xff3333
        },
        {
            name: 'surface_droite_basse',
            vertices: ['INTER_DROIT', 'SPINE_BAS', 'CENTRE'] as [string, string, string],
            color: 0xff6666
        }
    ];

    static readonly TOTAL_AREA = 0.68;
}

export interface KiteConfig extends C_objetConfig {
    showPoints?: boolean;
    showFrame?: boolean;
    showSails?: boolean;
    showLabels?: boolean;
    sailColor?: number;
    frameColor?: number;
    pointSize?: number;
    aerodynamic?: boolean;
}

const DefaultKiteConfig: KiteConfig = {
    name: 'Kite',
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
    visible: true,
    showPoints: true,
    showFrame: true,
    showSails: true,
    showLabels: false,
    sailColor: 0xff3333,
    frameColor: 0x444444,
    pointSize: 0.015,
    aerodynamic: true
};

export class Kite extends C_objet {
    private points: Map<string, Point> = new Map();
    private frames: Frame[] = [];
    private sails: Sail[] = [];
    private labels: Map<string, C_label> = new Map();
    private bridleLines: THREE.Group | null = null;

    public kiteConfig: KiteConfig;
    public state: KiteState;
    public previousPosition: THREE.Vector3;

    constructor(config: Partial<KiteConfig> = {}) {
        const fullConfig = { ...DefaultKiteConfig, ...config };
        super(fullConfig);
        this.kiteConfig = fullConfig;

        this.state = {
            position: this.get_position().clone(),
            velocity: new THREE.Vector3(),
            angularVelocity: new THREE.Vector3(),
            orientation: this.get_group().quaternion.clone()
        };

        this.previousPosition = this.get_position().clone();
    }

    protected _init(): void {
        super._init();
        console.log(`🪁 Kite ${this.name} initialisé`);
    }

    protected _enter_tree(): void {
        super._enter_tree();
        this.createPoints();
        this.createFrame();
        this.createSails();
        this.createBridleLines();
        this.createLabels();
        console.log(`🪁 Kite ${this.name} ajouté au scene tree`);
    }

    protected _ready(): void {
        super._ready();
        console.log(`🪁 Kite ${this.name} prêt (surface: ${KiteGeometry.TOTAL_AREA}m²)`);
    }

    protected _exit_tree(): void {
        super._exit_tree();
        this.cleanup();
        console.log(`🪁 Kite ${this.name} retiré du scene tree`);
    }

    private createPoints(): void {
        if (!this.kiteConfig.showPoints) return;

        KiteGeometry.POINTS.forEach(([x, y, z], name) => {
            const pointConfig: PointConfig = {
                position: new THREE.Vector3(x, y, z),
                radius: this.kiteConfig.pointSize || 0.015,
                name: `Point_${name}`
            };

            if (name === KiteControlPoint.NEZ) {
                pointConfig.color = 0xff0000;
            } else if (name.includes('CTRL')) {
                pointConfig.color = 0xdc143c;
            } else if (name.includes('WHISKER')) {
                pointConfig.color = 0x8a2be2;
            } else {
                pointConfig.color = 0x00ff00;
            }

            const point = new Point(pointConfig);
            this.points.set(name, point);
            this.add_child(point);
        });
    }

    private createFrame(): void {
        if (!this.kiteConfig.showFrame) return;

        KiteGeometry.FRAME_ELEMENTS.forEach(element => {
            const pointA = this.points.get(element.points[0]);
            const pointB = this.points.get(element.points[1]);

            if (pointA && pointB) {
                const frameConfig: Frame_Config = {
                    pointA: pointA,
                    pointB: pointB,
                    radius: element.radius,
                    color: element.color,
                    name: element.name,
                    material: 'standard',
                    metalness: 0.1,
                    roughness: 0.8
                };

                const frameElement = new Frame(frameConfig);
                this.frames.push(frameElement);
                this.add_child(frameElement);
            }
        });
    }

    /**
     * Crée les voiles du cerf-volant en validant la configuration avec Zod et en gérant explicitement les ressources Three.js.
     * Utilise un typage strict et documente les erreurs potentielles.
     */
    private createSails(): void {
        if (!this.kiteConfig.showSails) {
            console.log('🚫 Voiles désactivées dans la config');
            return;
        }

        console.log(`🌟 Création de ${KiteGeometry.SURFACES.length} voiles...`);

        KiteGeometry.SURFACES.forEach(surface => {
            // Validation Zod du schéma de surface
            const surfaceSchema = z.object({
                name: z.string(),
                color: z.string(),
                vertices: z.array(z.string()),
            });
            const parseResult = surfaceSchema.safeParse(surface);
            if (!parseResult.success) {
                console.error(`❌ Surface ${surface.name} invalide :`, parseResult.error);
                return;
            }

            const surfacePoints: Point[] = [];
            surface.vertices.forEach(vertexName => {
                const existingPoint = this.points.get(vertexName);
                if (existingPoint) {
                    surfacePoints.push(existingPoint);
                } else {
                    console.warn(`⚠️ Point ${vertexName} non trouvé pour la surface ${surface.name}`);
                }
            });

            if (surfacePoints.length >= 3) {
                // Validation Zod du SailConfig
                const sailConfigSchema = z.object({
                    points: z.array(z.any()),
                    triangles: z.array(z.tuple([z.number(), z.number(), z.number()])),
                    color: z.string(),
                    opacity: z.number().min(0).max(1),
                    doubleSided: z.boolean(),
                    aerodynamic: z.boolean(),
                    name: z.string(),
                });
                const sailConfig: SailConfig = {
                    points: surfacePoints,
                    triangles: [[0, 1, 2]],
                    color: surface.color,
                    opacity: 0.8,
                    doubleSided: true,
                    aerodynamic: this.kiteConfig.aerodynamic,
                    name: surface.name
                };
                const sailConfigResult = sailConfigSchema.safeParse(sailConfig);
                if (!sailConfigResult.success) {
                    console.error(`❌ SailConfig invalide pour ${surface.name} :`, sailConfigResult.error);
                    return;
                }

                const sail = new Sail(sailConfig);
                this.sails.push(sail);
                this.add_child(sail);
                console.log(`⛵ Voile ${surface.name} créée et ajoutée avec ${surfacePoints.length} points`);
            } else {
                console.warn(`⚠️ Surface ${surface.name} n'a que ${surfacePoints.length} points`);
            }
        });

        console.log(`✅ ${this.sails.length} voiles créées au total`);
    }

    private createBridleLines(): void {
        if (this.bridleLines) {
            this.group.remove(this.bridleLines);
        }

        this.bridleLines = new THREE.Group();
        this.bridleLines.name = 'BridleLines';

        const nezCoords = KiteGeometry.POINTS.get(KiteControlPoint.NEZ);
        const ctrlGaucheCoords = KiteGeometry.POINTS.get(KiteControlPoint.CTRL_GAUCHE);
        const ctrlDroitCoords = KiteGeometry.POINTS.get(KiteControlPoint.CTRL_DROIT);

        if (nezCoords && ctrlGaucheCoords && ctrlDroitCoords) {
            const nez = new THREE.Vector3(...nezCoords);
            const ctrlGauche = new THREE.Vector3(...ctrlGaucheCoords);
            const ctrlDroit = new THREE.Vector3(...ctrlDroitCoords);

            const leftGeometry = new THREE.BufferGeometry().setFromPoints([nez, ctrlGauche]);
            const leftLine = new THREE.Line(
                leftGeometry,
                new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 })
            );
            leftLine.name = 'BridleLeft';
            this.bridleLines.add(leftLine);

            const rightGeometry = new THREE.BufferGeometry().setFromPoints([nez, ctrlDroit]);
            const rightLine = new THREE.Line(
                rightGeometry,
                new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 })
            );
            rightLine.name = 'BridleRight';
            this.bridleLines.add(rightLine);

            this.group.add(this.bridleLines);
        }
    }

    private createLabels(): void {
        console.log(`🏷️ createLabels() appelé, showLabels=${this.kiteConfig.showLabels}`);
        if (!this.kiteConfig.showLabels) {
            console.log('🚫 Labels désactivés dans la config');
            return;
        }

        console.log(`🏷️ Création des labels...`);

        const importantPoints = [KiteControlPoint.NEZ, 'CENTRE', 'SPINE_BAS', KiteControlPoint.CTRL_GAUCHE, KiteControlPoint.CTRL_DROIT, 'BORD_GAUCHE', 'BORD_DROIT'];

        importantPoints.forEach(pointName => {
            const point = this.points.get(pointName);
            if (point) {
                const label = new C_label({
                    text: pointName.replace('_', ' '),
                    target: point,
                    fontSize: 8,
                    color: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    offset: new THREE.Vector3(0, 0.08, 0),
                    fadeDistance: 8,
                    maxDistance: 12,
                    scaleMode: 'distance',
                    baseScale: 0.1,
                    minScale: 0.05,
                    maxScale: 0.2,
                    distanceScaling: true,
                    name: `Label_${pointName}`
                });

                this.add_child(label);
                this.labels.set(pointName, label);
                console.log(`🏷️ Label CAO créé pour ${pointName}`);
            }
        });

        this.sails.forEach((sail, index) => {
            const sailName = KiteGeometry.SURFACES[index]?.name || `Voile_${index}`;
            const label = new C_label({
                text: sailName.replace('_', ' ').replace('surface ', ''),
                target: sail,
                fontSize: 7,
                color: '#e2e8f0',
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                offset: new THREE.Vector3(0, 0.04, 0),
                fadeDistance: 6,
                maxDistance: 10,
                scaleMode: 'distance',
                baseScale: 0.08,
                minScale: 0.04,
                maxScale: 0.15,
                distanceScaling: true,
                name: `Label_${sailName}`
            });

            this.add_child(label);
            this.labels.set(sailName, label);
        });

        console.log(`✅ ${this.labels.size} labels créés au total`);
    }

    public getPoint(name: string): Point | null {
        return this.points.get(name) || null;
    }

    public getPointPosition(name: string): THREE.Vector3 | null {
        const coords = KiteGeometry.POINTS.get(name);
        return coords ? new THREE.Vector3(...coords) : null;
    }

    public setPointPosition(name: string, position: THREE.Vector3): void {
        const point = this.points.get(name);
        if (point) {
            point.set_position(position);
        }
    }

    public getPoints(): Map<string, Point> {
        return this.points;
    }

    public setShowPoints(show: boolean): void {
        this.kiteConfig.showPoints = show;
        this.points.forEach(point => {
            point.group.visible = show;
        });
    }

    public setShowFrame(show: boolean): void {
        this.kiteConfig.showFrame = show;
        this.frames.forEach(frame => {
            frame.group.visible = show;
        });
    }

    public setShowSails(show: boolean): void {
        this.kiteConfig.showSails = show;
        this.sails.forEach(sail => {
            sail.group.visible = show;
        });
    }

    public setShowLabels(show: boolean): void {
        this.kiteConfig.showLabels = show;
        this.labels.forEach(label => {
            label.setVisible(show);
        });
        console.log(`🏷️ Labels ${show ? 'activés' : 'désactivés'}`);
    }

    public getTotalArea(): number {
        return this.sails.reduce((total, sail) => total + sail.getArea(), 0);
    }

    public updateLabels(cameraPosition: THREE.Vector3): void {
        this.labels.forEach(label => {
            label.update(0.016, cameraPosition);
        });
    }

    public setLabelsScaleMode(mode: 'fixed' | 'adaptive' | 'distance'): void {
        this.labels.forEach(label => {
            label.setScaleMode(mode);
        });
        console.log(`🏷️ Mode d'échelle des labels changé vers: ${mode}`);
    }

    public setLabelsBaseScale(scale: number): void {
        this.labels.forEach(label => {
            label.setBaseScale(scale);
        });
        console.log(`🏷️ Échelle de base des labels changée vers: ${scale}`);
    }

    public setLabelsDistanceScaling(enabled: boolean): void {
        this.labels.forEach(label => {
            label.setDistanceScaling(enabled);
        });
        console.log(`🏷️ Dimensionnement selon la distance: ${enabled ? 'activé' : 'désactivé'}`);
    }

    public updateGeometry(): void {
        this.frames.forEach(frame => {
            frame.updateGeometry();
        });
        this.createBridleLines();
    }

    public startPulsing(intensity: number = 0.1, speed: number = 1): void {
        this.sails.forEach(sail => {
            sail.startPulsing(intensity, speed);
        });
    }

    public stopPulsing(): void {
        this.sails.forEach(sail => {
            sail.stopPulsing();
        });
    }

    private cleanup(): void {
        this.points.forEach(point => {
            point.queue_free();
        });
        this.points.clear();

        this.sails.forEach(sail => {
            sail.queue_free();
        });
        this.sails.length = 0;

        this.frames.forEach(frame => {
            frame.queue_free();
        });
        this.frames.length = 0;

        this.labels.forEach(label => {
            label.queue_free();
        });
        this.labels.clear();

        if (this.bridleLines) {
            this.bridleLines.traverse((child) => {
                if (child instanceof THREE.Line) {
                    child.geometry.dispose();
                    if (child.material instanceof THREE.Material) {
                        child.material.dispose();
                    }
                }
            });
            this.bridleLines.clear();
            this.bridleLines = null;
        }
    }

    public queue_free(): void {
        this.cleanup();
        super.queue_free();
    }

    public get_debug_info(): object {
        return {
            ...super.get_debug_info(),
            config: this.kiteConfig,
            pointCount: this.points.size,
            frameCount: this.frames.length,
            sailCount: this.sails.length,
            totalArea: this.getTotalArea(),
            components: {
                points: Array.from(this.points.keys()),
                frames: this.frames.map(f => f.name),
                sails: this.sails.map(s => s.name)
            }
        };
    }

    public getFaces(): { normal: THREE.Vector3, center: THREE.Vector3, area: number }[] {
        return this.sails.map(sail => sail.getFaceInfo());
    }

    // Méthodes de compatibilité pour physique et debug
    // getRotation retourne désormais la quaternion courante du groupe (représentation canonique)
    public getRotation(): THREE.Quaternion {
        return this.get_group().quaternion;
    }

    public get position(): THREE.Vector3 {
        return this.get_position();
    }

    public get quaternion(): THREE.Quaternion {
        return this.group.quaternion;
    }

    public get userData(): any {
        return this.group.userData;
    }
}

export default Kite;
