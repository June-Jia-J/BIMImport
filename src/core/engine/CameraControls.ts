import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ViewpointData } from '../store/useViewpointStore';

export class CameraControls {
    public controls: OrbitControls;
    public camera: THREE.PerspectiveCamera;
    private animationId: number | null = null;
    private isAnimating: boolean = false;

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

    public getCurrentState(): Omit<ViewpointData, 'id' | 'name' | 'description' | 'createdAt'> {
        return {
            camera: {
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
                fov: this.camera.fov,
                near: this.camera.near,
                far: this.camera.far,
            },
            target: {
                x: this.controls.target.x,
                y: this.controls.target.y,
                z: this.controls.target.z,
            },
        };
    }

    public applyViewpoint(viewpoint: ViewpointData, animate: boolean = true): Promise<void> {
        return new Promise((resolve) => {
            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            const targetPosition = new THREE.Vector3(
                viewpoint.camera.position.x,
                viewpoint.camera.position.y,
                viewpoint.camera.position.z
            );
            const targetQuaternion = new THREE.Quaternion(
                viewpoint.camera.quaternion.x,
                viewpoint.camera.quaternion.y,
                viewpoint.camera.quaternion.z,
                viewpoint.camera.quaternion.w
            );
            const targetLookAt = new THREE.Vector3(
                viewpoint.target.x,
                viewpoint.target.y,
                viewpoint.target.z
            );

            if (!animate) {
                this.camera.position.copy(targetPosition);
                this.camera.quaternion.copy(targetQuaternion);
                this.camera.fov = viewpoint.camera.fov;
                this.camera.near = viewpoint.camera.near;
                this.camera.far = viewpoint.camera.far;
                this.camera.updateProjectionMatrix();
                this.controls.target.copy(targetLookAt);
                this.controls.update();
                resolve();
                return;
            }

            this.isAnimating = true;
            this.controls.enabled = false;

            const startPosition = this.camera.position.clone();
            const startQuaternion = this.camera.quaternion.clone();
            const startFov = this.camera.fov;
            const startTarget = this.controls.target.clone();

            const duration = 1000;
            const startTime = performance.now();

            const animateStep = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);

                this.camera.position.lerpVectors(startPosition, targetPosition, eased);
                this.camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);
                this.camera.fov = startFov + (viewpoint.camera.fov - startFov) * eased;
                this.controls.target.lerpVectors(startTarget, targetLookAt, eased);

                this.camera.updateProjectionMatrix();
                this.controls.update();

                if (progress < 1) {
                    this.animationId = requestAnimationFrame(animateStep);
                } else {
                    this.animationId = null;
                    this.isAnimating = false;
                    this.controls.enabled = true;
                    resolve();
                }
            };

            this.animationId = requestAnimationFrame(animateStep);
        });
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public getIsAnimating(): boolean {
        return this.isAnimating;
    }

    public dispose() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        this.controls.dispose();
    }
}
