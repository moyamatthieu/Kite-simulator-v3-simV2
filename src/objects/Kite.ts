/**
 * Kite.ts - Cerf-volant modulaire utilisant les composants Point, Frame et Sail
 *
 * Architecture modulaire avec composition d'objets :
 * - Point : Points anatomiques du cerf-volant
 * - Frame : Structure rigide (cadre)
 * - Sail : Surfaces portantes (voiles)
 *
 * Compatible avec simulationV8.ts
 */

import * as THREE from 'three';
import { C_objet, C_objetConfig } from './C_objet';
import { Point, PointConfig } from './point';
import { Frame, FrameConfig } from './frame';
import { Sail, SailConfig } from './sail';

/**
 * Géométrie du cerf-volant - Définition des points et surfaces
 */
export class KiteGeometry {
    // Points anatomiques du cerf-volant (coordonnées relatives)
    static readonly POINTS = {
        NEZ: new THREE.Vector3(0, 0.65, 0),                      // Bout pointu en haut
        SPINE_BAS: new THREE.Vector3(0, 0, 0),                   // Centre en bas
        BORD_GAUCHE: new THREE.Vector3(-0.825, 0, 0),            // Extrémité aile gauche
        BORD_DROIT: new THREE.Vector3(0.825, 0, 0),              // Extrémité aile droite
        WHISKER_GAUCHE: new THREE.Vector3(-0.4125, 0.1, -0.15),  // Stabilisateur gauche
        WHISKER_DROIT: new THREE.Vector3(0.4125, 0.1, -0.15),    // Stabilisateur droit
        CTRL_GAUCHE: new THREE.Vector3(-0.15, 0.3, 0.4),         // Attache ligne gauche
        CTRL_DROIT: new THREE.Vector3(0.15, 0.3, 0.4)            // Attache ligne droite
    };

    // Définition des surfaces triangulaires
    static readonly SURFACES = [
        {
            name: 'surface_gauche_haute',
            vertices: ['NEZ', 'BORD_GAUCHE', 'WHISKER_GAUCHE'],
            area: 0.23,
            color: '#ff3333'
        },
        {
            name: 'surface_gauche_basse',
            vertices: ['NEZ', 'WHISKER_GAUCHE', 'SPINE_BAS'],
            area: 0.11,
            color: '#ff6666'
        },
        {
            name: 'surface_droite_haute',
            vertices: ['NEZ', 'BORD_DROIT', 'WHISKER_DROIT'],
            area: 0.23,
            color: '#ff3333'
        },
        {
            name: 'surface_droite_basse',
            vertices: ['NEZ', 'WHISKER_DROIT', 'SPINE_BAS'],
            area: 0.11,
            color: '#ff6666'
        }
    ];

    // Définition des éléments de structure
    static readonly FRAME_ELEMENTS = [
        {
            name: 'bord_attaque_gauche',
            points: ['NEZ', 'BORD_GAUCHE'],
            thickness: 0.03,
            color: 0x2a2a2a
        },
        {
            name: 'bord_attaque_droit',
            points: ['NEZ', 'BORD_DROIT'],
            thickness: 0.03,
            color: 0x2a2a2a
        },
        {
            name: 'spine_centrale',
            points: ['NEZ', 'SPINE_BAS'],
            thickness: 0.03,
            color: 0x2a2a2a
        },
        {
            name: 'whisker_gauche',
            points: ['BORD_GAUCHE', 'WHISKER_GAUCHE'],
            thickness: 0.02,
            color: 0x444444
        },
        {
            name: 'whisker_droit',
            points: ['BORD_DROIT', 'WHISKER_DROIT'],
            thickness: 0.02,
            color: 0x444444
        }
    ];

    static readonly TOTAL_AREA = 0.68; // Surface totale en m²
}

export interface KiteConfig extends C_objetConfig {
    width?: number;
    height?: number;
    depth?: number;
    showPoints?: boolean;
    showFrame?: boolean;
    showSails?: boolean;
    sailColor?: number;
    frameColor?: number;
    pointSize?: number;
    aerodynamic?: boolean;
    mass?: number;
}

/**
 * Configuration par défaut du cerf-volant
 */
const DefaultKiteConfig: KiteConfig = {
    // Héritées de C_objetConfig
    name: 'Kite',
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
    visible: true,
    
    // Spécifiques au Kite
    width: 1.65,
    height: 0.65,
    depth: 0.3,
    showPoints: true,
    showFrame: true,
    showSails: true,
    sailColor: 0xff3333,
    frameColor: 0x444444,
    pointSize: 0.02,
    aerodynamic: true,
    mass: 1.5
};

/**
 * Cerf-volant modulaire composé d'objets Point, Frame et Sail
 */
export class Kite extends C_objet {
    // Composants modulaires
    private points: Map<string, Point> = new Map();
    private frames: Frame[] = [];
    private sails: Sail[] = [];
    private bridleLines: THREE.Group | null = null;
    private bridleLengthFactor: number = 1.0;

    // Configuration typée
    public kiteConfig: KiteConfig;

    constructor(config: Partial<KiteConfig> = {}) {
        const fullConfig = { ...DefaultKiteConfig, ...config };
        super(fullConfig);
        this.kiteConfig = fullConfig;
        
        // Initialiser le cerf-volant
        this.initialize();
    }

    /**
     * Initialise le cerf-volant (création des points, cadre, voiles, etc.)
     */
    private initialize(): void {
        this.createPoints();
        this.createFrame();
        this.createSails();
        this.createBridleLines();
    }

    /**
     * Crée les points anatomiques du cerf-volant
     */
    private createPoints(): void {
        if (!this.kiteConfig.showPoints) return;

        Object.entries(KiteGeometry.POINTS).forEach(([name, position]) => {
            const pointConfig: PointConfig = {
                position: position,
                radius: this.kiteConfig.pointSize,
                name: `Point_${name}`
            };

            // Couleurs spécifiques pour différents types de points
            if (name === 'NEZ') {
                pointConfig.color = 0xff0000; // Rouge pour le nez
            } else if (name.includes('CTRL')) {
                pointConfig.color = 0xdc143c; // Rouge foncé pour les points de contrôle
            } else if (name.includes('WHISKER')) {
                pointConfig.color = 0x8a2be2; // Violet pour les whiskers
            } else {
                pointConfig.color = 0x00ff00; // Vert pour les autres points
            }

            const point = new Point(pointConfig);
            this.points.set(name, point);
            this.group.add(point.group); // Utiliser point.group au lieu de getGroup()
        });
    }

    /**
     * Crée la structure rigide du cerf-volant
     */
    private createFrame(): void {
        if (!this.kiteConfig.showFrame) return;

        // Créer un cadre composite pour chaque élément de structure
        KiteGeometry.FRAME_ELEMENTS.forEach(element => {
            const startPoint = KiteGeometry.POINTS[element.points[0] as keyof typeof KiteGeometry.POINTS];
            const endPoint = KiteGeometry.POINTS[element.points[1] as keyof typeof KiteGeometry.POINTS];

            if (startPoint && endPoint) {
                const center = startPoint.clone().add(endPoint).multiplyScalar(0.5);
                const length = startPoint.distanceTo(endPoint);
                
                const frameConfig: FrameConfig = {
                    width: length,
                    height: element.thickness,
                    depth: element.thickness,
                    color: element.color,
                    name: element.name,
                    filled: false,
                    position: center
                };

                const frameElement = new Frame(frameConfig);

                // Orienter vers la direction de l'élément
                const direction = endPoint.clone().sub(startPoint).normalize();
                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
                frameElement.group.setRotationFromQuaternion(quaternion);

                this.frames.push(frameElement);
                this.group.add(frameElement.group);
            }
        });
    }

    /**
     * Crée les surfaces portantes (voiles) avec géométrie personnalisée
     */
    private createSails(): void {
        if (!this.kiteConfig.showSails) return;

        KiteGeometry.SURFACES.forEach((surface, index) => {
            // Récupérer les positions réelles des sommets
            const vertices = surface.vertices.map(vertexName => {
                const point = KiteGeometry.POINTS[vertexName as keyof typeof KiteGeometry.POINTS];
                return point || new THREE.Vector3();
            });

            if (vertices.length >= 3) {
                // Créer une géométrie triangulaire personnalisée
                const geometry = new THREE.BufferGeometry();
                
                // Positions des vertices (dans l'ordre correct pour Three.js)
                const positions = new Float32Array([
                    vertices[0].x, vertices[0].y, vertices[0].z,
                    vertices[1].x, vertices[1].y, vertices[1].z,
                    vertices[2].x, vertices[2].y, vertices[2].z
                ]);

                // UVs pour la texture
                const uvs = new Float32Array([
                    0, 0,   // vertex 0
                    1, 0,   // vertex 1
                    0.5, 1  // vertex 2
                ]);

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
                geometry.computeVertexNormals();

                // Matériau
                const material = new THREE.MeshStandardMaterial({
                    color: parseInt(surface.color.replace('#', ''), 16),
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide,
                    roughness: 0.1,
                    metalness: 0.0
                });

                // Créer le mesh
                const sailMesh = new THREE.Mesh(geometry, material);
                sailMesh.name = surface.name;
                sailMesh.castShadow = true;
                sailMesh.receiveShadow = true;

                // Créer un groupe pour cette voile (compatible avec Sail)
                const sailGroup = new THREE.Group();
                sailGroup.name = surface.name;
                sailGroup.add(sailMesh);

                // Simuler un objet Sail pour compatibilité
                const sailObject = {
                    group: sailGroup,
                    name: surface.name,
                    dispose: () => {
                        geometry.dispose();
                        material.dispose();
                    }
                };

                this.sails.push(sailObject as any);
                this.group.add(sailGroup);
            }
        });
    }

    /**
     * Crée les lignes de bridage
     */
    private createBridleLines(): void {
        if (this.bridleLines) {
            this.group.remove(this.bridleLines);
        }

        this.bridleLines = new THREE.Group();
        this.bridleLines.name = 'BridleLines';

        const nez = KiteGeometry.POINTS.NEZ;
        const ctrlGauche = KiteGeometry.POINTS.CTRL_GAUCHE;
        const ctrlDroit = KiteGeometry.POINTS.CTRL_DROIT;

        // Bride gauche
        const leftGeometry = new THREE.BufferGeometry().setFromPoints([nez, ctrlGauche]);
        const leftLine = new THREE.Line(
            leftGeometry,
            new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 })
        );
        leftLine.name = 'BridleLeft';
        this.bridleLines.add(leftLine);

        // Bride droite
        const rightGeometry = new THREE.BufferGeometry().setFromPoints([nez, ctrlDroit]);
        const rightLine = new THREE.Line(
            rightGeometry,
            new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 })
        );
        rightLine.name = 'BridleRight';
        this.bridleLines.add(rightLine);

        this.group.add(this.bridleLines);
    }

    /**
     * Obtient un point par son nom (compatible avec simulationV8)
     */
    public getPoint(name: string): THREE.Vector3 | null {
        const staticPoint = KiteGeometry.POINTS[name as keyof typeof KiteGeometry.POINTS];
        return staticPoint ? staticPoint.clone() : null;
    }

    /**
     * Définit un point (met à jour la position du point visuel)
     */
    public setPoint(name: string, position: THREE.Vector3): void {
        const point = this.points.get(name);
        if (point) {
            point.group.position.copy(position);
        }
    }

    /**
     * Obtient tous les points (compatible avec simulationV8)
     */
    public getPoints(): Map<string, THREE.Vector3> {
        const pointsMap = new Map<string, THREE.Vector3>();
        Object.entries(KiteGeometry.POINTS).forEach(([name, position]) => {
            pointsMap.set(name, position.clone());
        });
        return pointsMap;
    }

    /**
     * Obtient la map des points pour la simulation physique (format [x,y,z])
     */
    public getPointsMap(): Map<string, [number, number, number]> {
        const pointsMap = new Map<string, [number, number, number]>();
        Object.entries(KiteGeometry.POINTS).forEach(([name, position]) => {
            pointsMap.set(name, [position.x, position.y, position.z]);
        });
        return pointsMap;
    }

    /**
     * Active/désactive l'affichage des points
     */
    public setShowPoints(show: boolean): void {
        this.kiteConfig.showPoints = show;
        this.points.forEach(point => {
            point.group.visible = show;
        });
    }

    /**
     * Active/désactive l'affichage du cadre
     */
    public setShowFrame(show: boolean): void {
        this.kiteConfig.showFrame = show;
        this.frames.forEach(frame => {
            frame.group.visible = show;
        });
    }

    /**
     * Active/désactive l'affichage des voiles
     */
    public setShowSails(show: boolean): void {
        this.kiteConfig.showSails = show;
        this.sails.forEach(sail => {
            sail.group.visible = show;
        });
    }

    /**
     * Met à jour les lignes de brides
     */
    public updateBridleLines(): void {
        if (this.bridleLines) {
            this.createBridleLines();
        }
    }

    /**
     * Ajuste la longueur des brides
     */
    public adjustBridleLength(factor: number): void {
        this.bridleLengthFactor = Math.max(0.5, Math.min(1.5, factor));
    }

    /**
     * Obtient la longueur de repos d'une bride
     */
    public getBridleRestLength(bridleName: 'left' | 'right'): number | undefined {
        const nez = this.getPoint('NEZ');
        const ctrl = this.getPoint(bridleName === 'left' ? 'CTRL_GAUCHE' : 'CTRL_DROIT');
        if (!nez || !ctrl) return undefined;
        return nez.distanceTo(ctrl) * this.bridleLengthFactor;
    }

    /**
     * Obtient le facteur de longueur des brides
     */
    public getBridleLengthFactor(): number {
        return this.bridleLengthFactor;
    }

    /**
     * Calcule la surface totale du cerf-volant
     */
    public getTotalArea(): number {
        return this.sails.reduce((total, sail) => total + sail.getArea(), 0);
    }

    /**
     * Applique les forces aérodynamiques à toutes les voiles
     */
    public applyAerodynamicForces(windVector: THREE.Vector3, airDensity: number = 1.225): {
        totalLift: THREE.Vector3;
        totalDrag: THREE.Vector3;
        totalForce: THREE.Vector3;
    } {
        let totalLift = new THREE.Vector3();
        let totalDrag = new THREE.Vector3();

        this.sails.forEach(sail => {
            const forces = sail.applyWindForce(windVector, airDensity);
            totalLift.add(forces.lift);
            totalDrag.add(forces.drag);
        });

        const totalForce = totalLift.clone().add(totalDrag);

        return { totalLift, totalDrag, totalForce };
    }

    /**
     * Démarre l'animation de gonflement pour toutes les voiles
     */
    public startBillowing(intensity: number = 0.1, speed: number = 1): void {
        this.sails.forEach(sail => {
            sail.startBillowing(intensity, speed);
        });
    }

    /**
     * Arrête l'animation de gonflement
     */
    public stopBillowing(): void {
        this.sails.forEach(sail => {
            sail.stopBillowing();
        });
    }

    /**
     * Convertit les coordonnées locales en coordonnées mondiales
     */
    public localToWorld(vector: THREE.Vector3): THREE.Vector3 {
        const worldVector = vector.clone();
        this.group.updateMatrixWorld();
        return worldVector.applyMatrix4(this.group.matrixWorld);
    }

    /**
     * Convertit les coordonnées mondiales en coordonnées locales
     */
    public worldToLocal(vector: THREE.Vector3): THREE.Vector3 {
        const localVector = vector.clone();
        this.group.updateMatrixWorld();
        return localVector.applyMatrix4(new THREE.Matrix4().copy(this.group.matrixWorld).invert());
    }

    // Méthodes de compatibilité pour maintenir l'interface existante

    public create(): this {
        return this;
    }

    public getName(): string {
        return 'Cerf-volant Delta Modulaire';
    }

    public getDescription(): string {
        return 'Cerf-volant construit avec les composants Point, Frame et Sail';
    }

    public getPrimitiveCount(): number {
        return this.points.size + this.sails.length + this.frames.length;
    }

    public addPrimitiveAt(primitive: any, position: [number, number, number]): void {
        // Pour compatibilité - non implémenté dans cette version
    }

    // Méthodes de transformation pour compatibilité
    public localToWorldPoint(localPoint: THREE.Vector3): THREE.Vector3 {
        return this.localToWorld(localPoint);
    }

    public worldToLocalPoint(worldPoint: THREE.Vector3): THREE.Vector3 {
        return this.worldToLocal(worldPoint);
    }

    /**
     * Nettoie toutes les ressources
     */
    public dispose(): void {
        // Nettoyer les points
        this.points.forEach(point => {
            // Les C_objet ont leur propre méthode dispose si elle existe
            if (typeof point.dispose === 'function') {
                point.dispose();
            }
        });
        this.points.clear();

        // Nettoyer les voiles
        this.sails.forEach(sail => {
            if (typeof sail.dispose === 'function') {
                sail.dispose();
            }
        });
        this.sails.length = 0;

        // Nettoyer les frames
        this.frames.forEach(frame => {
            if (typeof frame.dispose === 'function') {
                frame.dispose();
            }
        });
        this.frames.length = 0;

        // Nettoyer les lignes de brides
        if (this.bridleLines) {
            this.bridleLines.clear();
            this.bridleLines = null;
        }

        // Appeler dispose de la classe parente si elle existe
        if (super.dispose) {
            super.dispose();
        }
    }

    /**
     * Informations de debug détaillées
     */
    public getDebugInfo(): object {
        return {
            id: this.id,
            name: this.name,
            config: this.kiteConfig,
            pointCount: this.points.size,
            frameCount: this.frames.length,
            sailCount: this.sails.length,
            totalArea: KiteGeometry.TOTAL_AREA,
            bridleLengthFactor: this.bridleLengthFactor,
            components: {
                points: Array.from(this.points.keys()),
                frames: this.frames.map(f => f.name),
                sails: this.sails.map(s => s.name)
            }
        };
    }

    /**
     * Propriétés additionnelles pour compatibilité avec simulationV8
     */
    public userData: any = {};
    
    // Propriétés héritées de THREE.Object3D pour la compatibilité
    public get position(): THREE.Vector3 { return this.group.position; }
    public get rotation(): THREE.Euler { return this.group.rotation; }
    public get quaternion(): THREE.Quaternion { return this.group.quaternion; }
    public get scale(): THREE.Vector3 { return this.group.scale; }
}

export default Kite;
