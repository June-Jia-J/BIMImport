import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WebGPUContext } from '../../core/engine/WebGPUContext';
import { SceneManager } from '../../core/engine/SceneManager';
import { CameraControls } from '../../core/engine/CameraControls';

export const Viewer3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Context
        const context = WebGPUContext.getInstance(canvasRef.current);

        // Initialize Scene
        const sceneManager = new SceneManager();

        // Initialize Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(20, 20, 20);

        // Initialize Controls
        const controls = new CameraControls(camera, canvasRef.current);

        // Animation Loop
        const animate = () => {
            controls.update();
            // Rotate basic animation for visual feedback if nothing loaded
            // sceneManager.scene.rotation.y += 0.001; 

            context.render(sceneManager.scene, camera);
        };

        // Use setAnimationLoop for WebXR/WebGPU compatibility
        context.renderer.setAnimationLoop(animate);

        // Cleanup
        return () => {
            context.renderer.setAnimationLoop(null);
            // Optional: Dispose resources
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black">
            <canvas ref={canvasRef} className="block w-full h-full outline-none" />
        </div>
    );
};
