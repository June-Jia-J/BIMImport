import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { WebGPUContext } from '../../core/engine/WebGPUContext';
import { SceneManager } from '../../core/engine/SceneManager';
import { CameraControls } from '../../core/engine/CameraControls';
import { useModelStore } from '../../core/store/useModelStore';

// 辅助函数：根据ID查找对象
const findObjectById = (models: THREE.Group[], id: string | null): THREE.Object3D | null => {
    if (!id) return null;
    for (const model of models) {
        if (model.uuid === id) return model;
        const found = model.getObjectByProperty('uuid', id);
        if (found) return found;
    }
    return null;
};

export const Viewer3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<CameraControls | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);

    const models = useModelStore((state) => state.models);
    const selectedId = useModelStore((state) => state.selectedId);
    const selectObject = useModelStore((state) => state.selectObject);

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

        // Initialize Selection Box
        const selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0x00ff00);
        selectionBox.visible = false;
        sceneManager.scene.add(selectionBox);
        selectionBoxRef.current = selectionBox;

        // Sets initial size to match container
        context.renderer.setSize(width, height);

        // Animation Loop
        const animate = () => {
            controls.update();
            // 更新选中框
            if (selectionBoxRef.current && selectionBoxRef.current.visible) {
                const selectedObj = findObjectById(models, selectedId);
                if (selectedObj) {
                    selectionBoxRef.current.setFromObject(selectedObj);
                    selectionBoxRef.current.update();
                }
            }
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

        // 鼠标点击事件处理
        const handleClick = (event: MouseEvent) => {
            if (!canvasRef.current || !cameraRef.current || !sceneManagerRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

            // 获取所有可选择的对象（模型的所有子对象）
            const selectableObjects: THREE.Object3D[] = [];
            models.forEach(model => {
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        selectableObjects.push(child);
                    }
                });
            });

            const intersects = raycasterRef.current.intersectObjects(selectableObjects, false);

            if (intersects.length > 0) {
                const selected = intersects[0].object;
                selectObject(selected.uuid);
            } else {
                // 点击空白处取消选择
                selectObject(null);
            }
        };

        canvasRef.current.addEventListener('click', handleClick);

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            context.renderer.setAnimationLoop(null);
            canvasRef.current?.removeEventListener('click', handleClick);
            // Optional: Dispose resources
        };
    }, [models, selectObject]);

    // 监听选中状态变化，更新选中框
    useEffect(() => {
        if (!selectionBoxRef.current) return;

        const selectedObj = findObjectById(models, selectedId);
        if (selectedObj) {
            selectionBoxRef.current.setFromObject(selectedObj);
            selectionBoxRef.current.visible = true;
            selectionBoxRef.current.update();
        } else {
            selectionBoxRef.current.visible = false;
        }
    }, [selectedId, models]);

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
