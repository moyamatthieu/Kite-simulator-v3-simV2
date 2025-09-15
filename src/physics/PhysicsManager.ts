
import * as THREE from 'three';
import { Kite } from '../objects/Kite';
import { Pilote3D } from '../objects/Pilote';
import { WindSimulator } from './WindSimulator';
import { AerodynamicsCalculator } from './AerodynamicsCalculator';
import { LineSystem } from '../objects/components/lines';
import { CONFIG, PhysicsConstants } from '../core/constants';

export class PhysicsManager {
    private windSimulator: WindSimulator;
    private lineSystem: LineSystem;
    private smoothedForce = new THREE.Vector3();
    private smoothedTorque = new THREE.Vector3();
    private readonly FORCE_SMOOTHING = 0.25;

    constructor() {
        this.windSimulator = new WindSimulator();
        this.lineSystem = new LineSystem();
    }

    public update(deltaTime: number, kite: Kite, pilote: Pilote3D, barRotation: number, liftCoefficient: number): void {
        deltaTime = Math.min(deltaTime, CONFIG.physics.deltaTimeMax);

        const kiteState = kite.state;

        const apparentWind = this.windSimulator.getApparentWind(kiteState.velocity, deltaTime);

        const aeroResult = AerodynamicsCalculator.calculateForcesWithNormals(
            apparentWind,
            kite.get_group().quaternion,
            kite
        );
        let { lift, drag, torque } = aeroResult.forces;

        lift.multiplyScalar(liftCoefficient);

        const gravity = new THREE.Vector3(0, -CONFIG.kite.mass * CONFIG.physics.gravity, 0);

        const { leftForce, rightForce, torque: lineTorque } = this.lineSystem.calculateLineTensions(
            kite,
            barRotation,
            pilote.getControlBarWorldPosition()
        );

        const totalForce = new THREE.Vector3()
            .add(lift)
            .add(drag)
            .add(gravity)
            .add(leftForce)
            .add(rightForce);

        const totalTorque = torque.clone().add(lineTorque);

        this.smoothedForce.lerp(totalForce, 1 - this.FORCE_SMOOTHING);
        this.smoothedTorque.lerp(totalTorque, 1 - this.FORCE_SMOOTHING);

        const validatedForce = this.validateForces(this.smoothedForce.clone());
        const validatedTorque = this.validateTorque(this.smoothedTorque.clone());

        const acceleration = validatedForce.divideScalar(CONFIG.kite.mass);

        if (acceleration.length() > PhysicsConstants.MAX_ACCELERATION) {
            acceleration.normalize().multiplyScalar(PhysicsConstants.MAX_ACCELERATION);
        }

        kiteState.velocity.add(acceleration.multiplyScalar(deltaTime));
        kiteState.velocity.multiplyScalar(CONFIG.physics.linearDamping);

        if (kiteState.velocity.length() > PhysicsConstants.MAX_VELOCITY) {
            kiteState.velocity.normalize().multiplyScalar(PhysicsConstants.MAX_VELOCITY);
        }

        const newPosition = kite.get_position().clone().add(kiteState.velocity.clone().multiplyScalar(deltaTime));
        kite.set_position(newPosition);

        this.lineSystem.updateAndEnforceConstraints(
            kite,
            barRotation,
            pilote.getControlBarWorldPosition()
        );

        const currentPos = kite.get_position();
        if (currentPos.y < CONFIG.kite.minHeight) {
            const correctedPos = currentPos.clone();
            correctedPos.y = CONFIG.kite.minHeight;
            kite.set_position(correctedPos);
            if (kiteState.velocity.y < 0) {
                kiteState.velocity.y = 0;
            }
        }

        const angularAcceleration = validatedTorque.clone().divideScalar(CONFIG.kite.inertia);

        if (angularAcceleration.length() > PhysicsConstants.MAX_ANGULAR_ACCELERATION) {
            angularAcceleration.normalize().multiplyScalar(PhysicsConstants.MAX_ANGULAR_ACCELERATION);
        }

        kiteState.angularVelocity.add(angularAcceleration.multiplyScalar(deltaTime));
        kiteState.angularVelocity.multiplyScalar(CONFIG.physics.angularDamping);

        if (kiteState.angularVelocity.length() > PhysicsConstants.MAX_ANGULAR_VELOCITY) {
            kiteState.angularVelocity.normalize().multiplyScalar(PhysicsConstants.MAX_ANGULAR_VELOCITY);
        }

        if (kiteState.angularVelocity.length() > PhysicsConstants.EPSILON) {
            const deltaRotation = new THREE.Quaternion();
            const axis = kiteState.angularVelocity.clone().normalize();
            const angle = kiteState.angularVelocity.length() * deltaTime;
            deltaRotation.setFromAxisAngle(axis, angle);

            const currentRotation = kite.get_group().quaternion.clone();
            currentRotation.multiply(deltaRotation);
            currentRotation.normalize();
            kite.get_group().quaternion.copy(currentRotation);
        }

        this.validatePosition(kite);
    }

    private validateForces(forces: THREE.Vector3): THREE.Vector3 {
        if (!forces || forces.length() > PhysicsConstants.MAX_FORCE || isNaN(forces.length())) {
            console.error(`⚠️ Forces invalides: ${forces ? forces.toArray() : 'undefined'}`);
            return new THREE.Vector3();
        }
        return forces;
    }

    private validateTorque(torque: THREE.Vector3): THREE.Vector3 {
        if (!torque || isNaN(torque.length())) {
            console.error(`⚠️ Couple invalide: ${torque ? torque.toArray() : 'undefined'}`);
            return new THREE.Vector3();
        }
        return torque;
    }

    private validatePosition(kite: Kite): void {
        const currentPos = kite.get_position();
        if (isNaN(currentPos.x) || isNaN(currentPos.y) || isNaN(currentPos.z)) {
            console.error(`⚠️ Position NaN détectée! Reset à la position précédente`);
            kite.set_position(kite.previousPosition);
            kite.state.velocity.set(0, 0, 0);
            kite.state.angularVelocity.set(0, 0, 0);
        }
    }

    public getWindSimulator(): WindSimulator {
        return this.windSimulator;
    }

    public getLineSystem(): LineSystem {
        return this.lineSystem;
    }
}
