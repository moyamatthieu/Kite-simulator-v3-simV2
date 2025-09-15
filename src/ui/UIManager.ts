
import { ServiceContainer } from '@/core/di/ServiceContainer';
import { ServiceKeys } from '@/core/di/ServiceKeys';
import { SimulationApp } from '../SimulationApp';
import { CompactUI } from './CompactUI';
import { Kite } from '@/objects/Kite';
import { Pilote3D } from '@/objects/Pilote';
import { AerodynamicsCalculator } from '@/physics/AerodynamicsCalculator';
import { PhysicsEngine } from '@/physics/PhysicsEngine';
import * as THREE from 'three';

export class UIManager {
    private ui: CompactUI;
    private debugLegend: HTMLElement | null = null;

    constructor(app: SimulationApp, ui: CompactUI) {
        this.ui = ui;
        this.createDebugLegend();
    }

    public updateUIWithMetrics(frameCount: number, kite: Kite, pilote: Pilote3D, isPlaying: boolean, debugMode: boolean): void {
        const container = ServiceContainer.getInstance();
        let physicsEngine: PhysicsEngine | null = null;
        try {
            physicsEngine = container.get<PhysicsEngine>(ServiceKeys.PHYSICS_ENGINE);
        } catch (e) {
            console.warn('PhysicsEngine service not found in container');
        }
        const windSim = physicsEngine ? physicsEngine.getWindSimulator() : null;
        const lineSystem = physicsEngine ? physicsEngine.getLineSystem() : null;

        const kitePos = kite.get_position().clone();
        const pilotPos = pilote.getControlBarWorldPosition();
        const distance = kitePos.distanceTo(pilotPos);
    const wind = windSim ? windSim.getWindAt(kitePos) : new THREE.Vector3();
        const apparent = wind.clone().sub(kite.state.velocity);

        const aeroMetrics = windSim ?
            AerodynamicsCalculator.computeMetrics(apparent, kite.get_group().quaternion) :
            { apparentSpeed: apparent.length(), liftMag: 0, dragMag: 0, lOverD: 0, aoaDeg: 0 };

        const lineTensions = lineSystem ? lineSystem.getLineTensions() : { leftDistance: 0, rightDistance: 0, leftTaut: false, rightTaut: false, leftTension: 0, rightTension: 0 };

        const deltaX = kitePos.x - pilotPos.x;
        const deltaY = kitePos.y - pilotPos.y;
        const deltaZ = kitePos.z - pilotPos.z;

        const angleX = Math.atan2(deltaX, -deltaZ) * 180 / Math.PI;
        const angleY = Math.atan2(deltaY, Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)) * 180 / Math.PI;

    const kiteController = physicsEngine ? physicsEngine.getKiteController() : null;
    const barRotationRaw = kiteController ? ( (kiteController as any).getCurrentBarRotation ? (kiteController as any).getCurrentBarRotation() : 0 ) : 0;
    const barRotationDeg = Math.round(barRotationRaw * 180 / Math.PI);
    const barDirection = barRotationRaw > 0.01 ? '←' : (barRotationRaw < -0.01 ? '→' : '─');

        this.ui.updateUI(
            frameCount,
            kite.get_position(),
            kite.state.velocity.length(),
            isPlaying,
            debugMode
        );

        if (debugMode) {
            const metricsInfo = {
                frame: frameCount,
                window: `X:${angleX.toFixed(0)}° Y:${angleY.toFixed(0)}°`,
                position: `[${kitePos.x.toFixed(1)}, ${kitePos.y.toFixed(1)}, ${kitePos.z.toFixed(1)}]`,
                velocity: `${kite.state.velocity.length().toFixed(1)}m/s`,
                wind: `${wind.length().toFixed(1)}m/s (${(wind.length() * 3.6).toFixed(0)}km/h)`,
                apparent: `${aeroMetrics.apparentSpeed.toFixed(1)}m/s`,
                aoa: `${aeroMetrics.aoaDeg.toFixed(0)}°`,
                bar: `${barDirection}${Math.abs(barRotationDeg)}°`,
                lines: `L:${lineTensions.leftDistance.toFixed(1)}m D:${lineTensions.rightDistance.toFixed(1)}m`,
                tensions: `G:${lineTensions.leftTaut ? 'T' : 'S'} D:${lineTensions.rightTaut ? 'T' : 'S'}`,
            };

            if (frameCount % 60 === 0) {
                console.log('🔍 Métriques:', metricsInfo);
            }
        }
    }

    private createDebugLegend(): void {
        this.debugLegend = document.createElement('div');
        this.debugLegend.id = 'debug-legend';
        this.debugLegend.innerHTML = `
            <h3>🔍 Vecteurs de Debug Complet</h3>

            <div class="legend-section">
                <h4>🌪️ VENTS</h4>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff00;"></span>
                    <span class="legend-text">🟢 Vitesse du kite</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #0088ff;"></span>
                    <span class="legend-text">🔵 Vent réel</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #88ff88;"></span>
                    <span class="legend-text">🟢 Vent apparent</span>
                </div>
            </div>

            <div class="legend-section">
                <h4>🪁 FORCES PAR FACE</h4>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ffff;"></span>
                    <span class="legend-text">🔵 Portance face 0</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff00ff;"></span>
                    <span class="legend-text">🟣 Portance face 1</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ffff00;"></span>
                    <span class="legend-text">🟡 Portance face 2</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff00;"></span>
                    <span class="legend-text">🟢 Portance face 3</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff0000;"></span>
                    <span class="legend-text">🔴 Traînée par face</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ffaa00;"></span>
                    <span class="legend-text">🟠 Gravité par face</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff00;"></span>
                    <span class="legend-text">🟢 Force aéro totale/face</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff88;"></span>
                    <span class="legend-text">🟢 Effet d'extrados</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ffffff;"></span>
                    <span class="legend-text">⚪ Force résultante/face</span>
                </div>
            </div>

            <div class="legend-section">
                <h4>🔗 CONTRAINTES</h4>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ffaa00;"></span>
                    <span class="legend-text">🟠 Gravité globale</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff0088;"></span>
                    <span class="legend-text">🩷 Tension ligne G</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff88aa;"></span>
                    <span class="legend-text">🩷 Tension ligne D</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #8800ff;"></span>
                    <span class="legend-text">🟣 Couple/rotation</span>
                </div>
            </div>

            <div class="legend-note">
                <small>💡 Analyse physique complète par face</small>
            </div>
        `;

        Object.assign(this.debugLegend.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            padding: '15px 18px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: '1.5',
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)',
            zIndex: '1000',
            display: 'none'
        });

        document.body.appendChild(this.debugLegend);
    }

    public updateDebugLegendVisibility(debugMode: boolean): void {
        if (this.debugLegend) {
            this.debugLegend.style.display = debugMode ? 'block' : 'none';
        }
    }
}
