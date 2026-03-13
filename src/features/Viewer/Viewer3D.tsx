import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WebGPUContext } from '../../core/engine/WebGPUContext';
import { SceneManager } from '../../core/engine/SceneManager';
import { CameraControls } from '../../core/engine/CameraControls';
import { CameraManager } from '../../core/engine/CameraManager';
import { useModelStore } from '../../core/store/useModelStore';

export const Viewer3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<CameraControls | null>(null);

    const models = useModelStore((state) => state.models);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Context
        const context = WebGPUContext.getInstance(canvasRef.current);

        // Initialize Scene
        const sceneManager = new SceneManager();
        sceneManagerRef.current = sceneManager;

        // Get initial dimensions
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Initialize Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height, // Use container aspect ratio
            0.1,
            10000 // Increased far plane for large models
        );
        camera.position.set(20, 20, 20);
        cameraRef.current = camera;

        // Initialize Controls
        const controls = new CameraControls(camera, canvasRef.current);
        controlsRef.current = controls;
        CameraManager.getInstance().setControls(controls);

        // Sets initial size to match container
        context.renderer.setSize(width, height);

        // Animation Loop
        const animate = () => {
            controls.update();
            context.render(sceneManager.scene, camera);
        };

        // Use setAnimationLoop for WebXR/WebGPU compatibility
        context.renderer.setAnimationLoop(animate);

        // Handle Resize with ResizeObserver for responsive layout changes
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (!containerRef.current || !camera) return;
                const { width, height } = entry.contentRect;

                // Avoid 0 size which might happen during transitions or unmount
                if (width === 0 || height === 0) return;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                context.renderer.setSize(width, height);
            }
        });

        resizeObserver.observe(containerRef.current);

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            context.renderer.setAnimationLoop(null);
            // Optional: Dispose resources
        };
    }, []);

    // Sync models with scene
    useEffect(() => {
        if (!sceneManagerRef.current || !cameraRef.current || !controlsRef.current) return;
        const scene = sceneManagerRef.current.scene;

        // Get all current model objects in the scene (excluding helpers/lights)
        const currentSceneModels = scene.children.filter(
            child => child.type === 'Group' && child.name // Models have names set from file.name
        );

        // Remove models that are no longer in the store
        currentSceneModels.forEach(sceneModel => {
            const stillExists = models.some(storeModel => storeModel === sceneModel);
            if (!stillExists) {
                scene.remove(sceneModel);
                console.log("Viewer3D: Removed model from scene", sceneModel.name);
            }
        });

        // Add new models that aren't in the scene yet
        models.forEach(model => {
            if (model.parent !== scene) {
                scene.add(model);
                console.log("Viewer3D: Added model to scene", model);

                // Auto-focus logic
                const box = new THREE.Box3().setFromObject(model);
                if (!box.isEmpty()) {
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = cameraRef.current!.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)); // rough estimate
                    cameraZ *= 2.5; // Zoom out a bit

                    const direction = new THREE.Vector3(1, 1, 1).normalize();
                    const position = center.clone().add(direction.multiplyScalar(cameraZ));

                    cameraRef.current!.position.copy(position);
                    cameraRef.current!.lookAt(center);
                    controlsRef.current!.controls.target.copy(center); // Update controls target to center of model
                    console.log("Viewer3D: Auto-focused camera", { position, center });
                }
            }
        });

        // If no models remain, reset camera to default position
        if (models.length === 0) {
            cameraRef.current!.position.set(20, 20, 20);
            cameraRef.current!.lookAt(0, 0, 0);
            controlsRef.current!.controls.target.set(0, 0, 0);
            console.log("Viewer3D: Reset camera to default position");
        }

    }, [models]);

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black">
            <canvas ref={canvasRef} className="block w-full h-full outline-none" />
        </div>
    );
};
