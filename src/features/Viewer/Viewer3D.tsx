import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { WebGPUContext } from '../../core/engine/WebGPUContext';
import { SceneManager } from '../../core/engine/SceneManager';
import { CameraControls } from '../../core/engine/CameraControls';
import { useModelStore } from '../../core/store/useModelStore';
import { useViewpointStore } from '../../core/store/useViewpointStore';
import type { ViewpointData } from '../../core/store/useViewpointStore';

export const Viewer3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<CameraControls | null>(null);

    const models = useModelStore((state) => state.models);
    const addViewpoint = useViewpointStore((state) => state.addViewpoint);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const context = WebGPUContext.getInstance(canvasRef.current);
        const sceneManager = new SceneManager();
        sceneManagerRef.current = sceneManager;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            10000
        );
        camera.position.set(20, 20, 20);
        cameraRef.current = camera;

        const controls = new CameraControls(camera, canvasRef.current);
        controlsRef.current = controls;

        context.renderer.setSize(width, height);

        const animate = () => {
            controls.update();
            context.render(sceneManager.scene, camera);
        };

        context.renderer.setAnimationLoop(animate);

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (!containerRef.current || !camera) return;
                const { width, height } = entry.contentRect;

                if (width === 0 || height === 0) return;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                context.renderer.setSize(width, height);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            context.renderer.setAnimationLoop(null);
            controls.dispose();
        };
    }, []);

    useEffect(() => {
        if (!sceneManagerRef.current || !cameraRef.current || !controlsRef.current) return;
        const scene = sceneManagerRef.current.scene;

        const currentSceneModels = scene.children.filter(
            child => child.type === 'Group' && child.name
        );

        currentSceneModels.forEach(sceneModel => {
            const stillExists = models.some(storeModel => storeModel === sceneModel);
            if (!stillExists) {
                scene.remove(sceneModel);
                console.log("Viewer3D: Removed model from scene", sceneModel.name);
            }
        });

        models.forEach(model => {
            if (model.parent !== scene) {
                scene.add(model);
                console.log("Viewer3D: Added model to scene", model);

                const box = new THREE.Box3().setFromObject(model);
                if (!box.isEmpty()) {
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = cameraRef.current!.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
                    cameraZ *= 2.5;

                    const direction = new THREE.Vector3(1, 1, 1).normalize();
                    const position = center.clone().add(direction.multiplyScalar(cameraZ));

                    cameraRef.current!.position.copy(position);
                    cameraRef.current!.lookAt(center);
                    controlsRef.current!.controls.target.copy(center);
                    console.log("Viewer3D: Auto-focused camera", { position, center });
                }
            }
        });

        if (models.length === 0) {
            cameraRef.current!.position.set(20, 20, 20);
            cameraRef.current!.lookAt(0, 0, 0);
            controlsRef.current!.controls.target.set(0, 0, 0);
            console.log("Viewer3D: Reset camera to default position");
        }

    }, [models]);

    const handleSaveViewpoint = useCallback((name: string, description: string) => {
        if (!controlsRef.current) return;
        const currentState = controlsRef.current.getCurrentState();
        addViewpoint({
            ...currentState,
            name,
            description: description || undefined,
        });
    }, [addViewpoint]);

    const handleApplyViewpoint = useCallback((viewpoint: ViewpointData) => {
        if (!controlsRef.current) return;
        controlsRef.current.applyViewpoint(viewpoint, true);
    }, []);

    useEffect(() => {
        const handleSaveViewpointEvent = (e: CustomEvent) => {
            const { name, description } = e.detail;
            handleSaveViewpoint(name, description);
        };

        const handleApplyViewpointEvent = (e: CustomEvent) => {
            handleApplyViewpoint(e.detail);
        };

        window.addEventListener('saveViewpoint', handleSaveViewpointEvent as EventListener);
        window.addEventListener('applyViewpoint', handleApplyViewpointEvent as EventListener);

        return () => {
            window.removeEventListener('saveViewpoint', handleSaveViewpointEvent as EventListener);
            window.removeEventListener('applyViewpoint', handleApplyViewpointEvent as EventListener);
        };
    }, [handleSaveViewpoint, handleApplyViewpoint]);

    (window as any).__viewerControls = {
        saveViewpoint: handleSaveViewpoint,
        applyViewpoint: handleApplyViewpoint,
    };

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black">
            <canvas ref={canvasRef} className="block w-full h-full outline-none" />
        </div>
    );
};
