import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

export class WebGPUContext {
    private static instance: WebGPUContext;
    public renderer: any; // WebGPURenderer type is experimental
    public domElement: HTMLCanvasElement;

    private constructor(canvas: HTMLCanvasElement) {
        this.domElement = canvas;
        this.renderer = new WebGPURenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Enable shadow map
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        window.addEventListener('resize', this.onResize.bind(this));
    }

    public static getInstance(canvas?: HTMLCanvasElement): WebGPUContext {
        if (!WebGPUContext.instance) {
            if (!canvas) {
                throw new Error("WebGPUContext needs to be initialized with a canvas first.");
            }
            WebGPUContext.instance = new WebGPUContext(canvas);
        }
        return WebGPUContext.instance;
    }

    private onResize() {
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }

    public render(scene: THREE.Scene, camera: THREE.Camera) {
        // For WebGPURenderer, we might need to use renderAsync in some versions,
        // but standard render() often delegates. In 0.182 it is renderAsync or proper render loop.
        // WebGPURenderer usually requires an animation loop via setAnimationLoop 
        // or manual calls.
        this.renderer.render(scene, camera);
    }
}
