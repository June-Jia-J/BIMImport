/// <reference types="vite/client" />

declare module 'three/webgpu' {
    export * from 'three';
    export class WebGPURenderer extends THREE.Renderer {
        constructor(parameters?: any);
        setSize(width: number, height: number, updateStyle?: boolean): void;
        setPixelRatio(value: number): void;
        render(scene: THREE.Scene, camera: THREE.Camera): void;
        renderAsync(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
        setAnimationLoop(callback: Function | null): void;
        shadowMap: { enabled: boolean; type: any };
    }
    // Add other exports if needed
}
