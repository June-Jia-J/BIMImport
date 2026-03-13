import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface CameraState {
    position: { x: number; y: number; z: number };
    quaternion: { x: number; y: number; z: number; w: number };
    target: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
}

export class CameraControls {
    public controls: OrbitControls;
    public camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    public update() {
        this.controls.update();
    }

    public getCameraState(): CameraState {
        return {
            position: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z,
            },
            quaternion: {
                x: this.camera.quaternion.x,
                y: this.camera.quaternion.y,
                z: this.camera.quaternion.z,
                w: this.camera.quaternion.w,
            },
            target: {
                x: this.controls.target.x,
                y: this.controls.target.y,
                z: this.controls.target.z,
            },
            fov: this.camera.fov,
            near: this.camera.near,
            far: this.camera.far,
        };
    }

    public setCameraState(state: CameraState, animate: boolean = true): Promise<void> {
        return new Promise((resolve) => {
            const targetPosition = new THREE.Vector3(
                state.position.x,
                state.position.y,
                state.position.z
            );
            const targetQuaternion = new THREE.Quaternion(
                state.quaternion.x,
                state.quaternion.y,
                state.quaternion.z,
                state.quaternion.w
            );
            const targetLookAt = new THREE.Vector3(
                state.target.x,
                state.target.y,
                state.target.z
            );

            if (!animate) {
                this.camera.position.copy(targetPosition);
                this.camera.quaternion.copy(targetQuaternion);
                this.controls.target.copy(targetLookAt);
                this.camera.fov = state.fov;
                this.camera.near = state.near;
                this.camera.far = state.far;
                this.camera.updateProjectionMatrix();
                this.controls.update();
                resolve();
                return;
            }

            const startPosition = this.camera.position.clone();
            const startQuaternion = this.camera.quaternion.clone();
            const startTarget = this.controls.target.clone();
            const startFov = this.camera.fov;
            const duration = 1000;
            const startTime = performance.now();

            const animateFrame = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const t = 1 - Math.pow(1 - progress, 3);

                this.camera.position.lerpVectors(startPosition, targetPosition, t);
                this.camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, t);
                this.controls.target.lerpVectors(startTarget, targetLookAt, t);
                this.camera.fov = startFov + (state.fov - startFov) * t;
                this.camera.updateProjectionMatrix();
                this.controls.update();

                if (progress < 1) {
                    requestAnimationFrame(animateFrame);
                } else {
                    this.camera.position.copy(targetPosition);
                    this.camera.quaternion.copy(targetQuaternion);
                    this.controls.target.copy(targetLookAt);
                    this.camera.fov = state.fov;
                    this.camera.near = state.near;
                    this.camera.far = state.far;
                    this.camera.updateProjectionMatrix();
                    this.controls.update();
                    resolve();
                }
            };

            requestAnimationFrame(animateFrame);
        });
    }
}
