import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { WebGPUContext } from '../../core/engine/WebGPUContext';
import { SceneManager } from '../../core/engine/SceneManager';
import { CameraControls } from '../../core/engine/CameraControls';
import { useModelStore } from '../../core/store/useModelStore';

export const Viewer3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<CameraControls | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const originalMaterialsRef = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());
    const contextRef = useRef<WebGPUContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const models = useModelStore((state) => state.models);
    const selectObject = useModelStore((state) => state.selectObject);
    const selectedId = useModelStore((state) => state.selectedId);

    // Helper: 通过UUID查找mesh
    const findMeshByUUID = useCallback((uuid: string): THREE.Mesh | null => {
        for (const model of models) {
            const findInChildren = (obj: THREE.Object3D): THREE.Mesh | null => {
                if (obj.uuid === uuid && obj instanceof THREE.Mesh) {
                    return obj;
                }
                for (const child of obj.children) {
                    const found = findInChildren(child);
                    if (found) return found;
                }
                return null;
            };
            const found = findInChildren(model);
            if (found) return found;
        }
        return null;
    }, [models]);

    // 恢复之前选中对象的材质
    const restorePreviousSelection = useCallback(() => {
        originalMaterialsRef.current.forEach((originalMat, uuid) => {
            const mesh = findMeshByUUID(uuid);
            if (mesh) {
                mesh.material = originalMat;
            }
        });
        originalMaterialsRef.current.clear();
    }, [findMeshByUUID]);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Context
        const context = WebGPUContext.getInstance(canvasRef.current);
        contextRef.current = context;

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

        // Sets initial size to match container
        context.renderer.setSize(width, height);

        // Animation Loop - 使用WebGPU兼容的渲染方式
        let isAnimating = true;
        const animate = async () => {
            if (!isAnimating) return;
            
            controls.update();
            // WebGPU渲染器需要使用renderAsync
            if (context.renderer.renderAsync) {
                await context.renderer.renderAsync(sceneManager.scene, camera);
            } else {
                context.renderer.render(sceneManager.scene, camera);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // 启动动画循环
        animate();

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
            isAnimating = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            resizeObserver.disconnect();
            // 恢复所有材质
            originalMaterialsRef.current.forEach((mat, uuid) => {
                const mesh = findMeshByUUID(uuid);
                if (mesh) {
                    mesh.material = mat;
                }
            });
            originalMaterialsRef.current.clear();
        };
    }, [findMeshByUUID]);

    // Handle object selection based on selectedId from store - 修改高亮方式为材质颜色变化
    useEffect(() => {
        if (!sceneManagerRef.current) return;

        // 恢复之前选中对象的材质
        restorePreviousSelection();

        // Remove selection if no id
        if (!selectedId) {
            return;
        }

        // Find object by UUID
        const findObjectByUUID = (objects: THREE.Object3D[], uuid: string): THREE.Mesh | null => {
            for (const obj of objects) {
                if (obj.uuid === uuid && obj instanceof THREE.Mesh) return obj;
                if (obj.children.length > 0) {
                    const found = findObjectByUUID(obj.children, uuid);
                    if (found) return found;
                }
            }
            return null;
        };

        const allMeshes: THREE.Mesh[] = [];
        models.forEach(model => {
            const collectMeshes = (obj: THREE.Object3D) => {
                if (obj instanceof THREE.Mesh) allMeshes.push(obj);
                obj.children.forEach(collectMeshes);
            };
            collectMeshes(model);
        });

        const selectedMesh = findObjectByUUID(allMeshes, selectedId);
        if (selectedMesh) {
            // 保存原始材质
            originalMaterialsRef.current.set(selectedMesh.uuid, selectedMesh.material);

            // 创建高亮材质 - 颜色变亮+发光效果
            if (Array.isArray(selectedMesh.material)) {
                selectedMesh.material = selectedMesh.material.map(mat => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                        const newMat = mat.clone();
                        newMat.emissive = new THREE.Color(0xffff00);
                        newMat.emissiveIntensity = 0.5;
                        return newMat;
                    }
                    return mat;
                });
            } else if (selectedMesh.material instanceof THREE.MeshStandardMaterial) {
                const newMat = selectedMesh.material.clone();
                newMat.emissive = new THREE.Color(0xffff00);
                newMat.emissiveIntensity = 0.5;
                selectedMesh.material = newMat;
            }
        }
    }, [selectedId, models, restorePreviousSelection]);

    // Raycaster click handler
    useEffect(() => {
        if (!canvasRef.current || !sceneManagerRef.current || !cameraRef.current) return;

        const handleClick = (event: MouseEvent) => {
            if (!containerRef.current || !cameraRef.current || !sceneManagerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

            // Collect all meshes from all models
            const allMeshes: THREE.Mesh[] = [];
            models.forEach(model => {
                const collectMeshes = (obj: THREE.Object3D) => {
                    if (obj instanceof THREE.Mesh) allMeshes.push(obj);
                    obj.children.forEach(collectMeshes);
                };
                collectMeshes(model);
            });

            const intersects = raycasterRef.current.intersectObjects(allMeshes);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object as THREE.Mesh;
                selectObject(clickedObject.uuid);
            } else {
                selectObject(null);
            }
        };

        canvasRef.current.addEventListener('click', handleClick);
        return () => {
            canvasRef.current?.removeEventListener('click', handleClick);
        };
    }, [models, selectObject]);

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
