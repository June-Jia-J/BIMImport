import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';

export interface ViewpointData {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    camera: {
        position: { x: number; y: number; z: number };
        quaternion: { x: number; y: number; z: number; w: number };
        fov: number;
        near: number;
        far: number;
    };
    controls?: {
        target: { x: number; y: number; z: number };
    };
    clipping?: {
        enabled: boolean;
        planes?: Array<{
            normal: { x: number; y: number; z: number };
            constant: number;
        }>;
    };
    visibleLayers?: string[];
}

interface ViewpointState {
    viewpoints: ViewpointData[];
    isTransitioning: boolean;

    addViewpoint: (viewpoint: Omit<ViewpointData, 'id' | 'createdAt'>) => ViewpointData;
    updateViewpoint: (id: string, updates: Partial<Omit<ViewpointData, 'id' | 'createdAt'>>) => void;
    deleteViewpoint: (id: string) => void;
    getViewpointById: (id: string) => ViewpointData | undefined;
    setTransitioning: (transitioning: boolean) => void;
}

const generateId = () => `vp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useViewpointStore = create<ViewpointState>()(
    persist(
        (set, get) => ({
            viewpoints: [],
            isTransitioning: false,

            addViewpoint: (viewpoint) => {
                const newViewpoint: ViewpointData = {
                    ...viewpoint,
                    id: generateId(),
                    createdAt: Date.now(),
                };
                set((state) => ({
                    viewpoints: [...state.viewpoints, newViewpoint],
                }));
                return newViewpoint;
            },

            updateViewpoint: (id, updates) => {
                set((state) => ({
                    viewpoints: state.viewpoints.map((vp) =>
                        vp.id === id ? { ...vp, ...updates } : vp
                    ),
                }));
            },

            deleteViewpoint: (id) => {
                set((state) => ({
                    viewpoints: state.viewpoints.filter((vp) => vp.id !== id),
                }));
            },

            getViewpointById: (id) => {
                return get().viewpoints.find((vp) => vp.id === id);
            },

            setTransitioning: (transitioning) => {
                set({ isTransitioning: transitioning });
            },
        }),
        {
            name: 'bim-viewpoints-storage',
            partialize: (state) => ({ viewpoints: state.viewpoints }),
        }
    )
);

export const serializeCameraState = (
    camera: THREE.PerspectiveCamera,
    controls?: { target: THREE.Vector3 }
): Omit<ViewpointData, 'id' | 'name' | 'createdAt'> => {
    return {
        camera: {
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            },
            quaternion: {
                x: camera.quaternion.x,
                y: camera.quaternion.y,
                z: camera.quaternion.z,
                w: camera.quaternion.w,
            },
            fov: camera.fov,
            near: camera.near,
            far: camera.far,
        },
        controls: controls
            ? {
                  target: {
                      x: controls.target.x,
                      y: controls.target.y,
                      z: controls.target.z,
                  },
              }
            : undefined,
    };
};

export const applyViewpointToCamera = (
    viewpoint: ViewpointData,
    camera: THREE.PerspectiveCamera,
    controls?: { target: THREE.Vector3 }
): void => {
    camera.position.set(
        viewpoint.camera.position.x,
        viewpoint.camera.position.y,
        viewpoint.camera.position.z
    );
    camera.quaternion.set(
        viewpoint.camera.quaternion.x,
        viewpoint.camera.quaternion.y,
        viewpoint.camera.quaternion.z,
        viewpoint.camera.quaternion.w
    );
    camera.fov = viewpoint.camera.fov;
    camera.near = viewpoint.camera.near;
    camera.far = viewpoint.camera.far;
    camera.updateProjectionMatrix();

    if (controls && viewpoint.controls) {
        controls.target.set(
            viewpoint.controls.target.x,
            viewpoint.controls.target.y,
            viewpoint.controls.target.z
        );
    }
};

export const interpolateCameraState = (
    startCamera: {
        position: THREE.Vector3;
        quaternion: THREE.Quaternion;
        fov: number;
    },
    endViewpoint: ViewpointData,
    t: number
): {
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    fov: number;
} => {
    const endPosition = new THREE.Vector3(
        endViewpoint.camera.position.x,
        endViewpoint.camera.position.y,
        endViewpoint.camera.position.z
    );
    const endQuaternion = new THREE.Quaternion(
        endViewpoint.camera.quaternion.x,
        endViewpoint.camera.quaternion.y,
        endViewpoint.camera.quaternion.z,
        endViewpoint.camera.quaternion.w
    );

    const position = new THREE.Vector3().lerpVectors(startCamera.position, endPosition, t);
    const quaternion = new THREE.Quaternion().slerpQuaternions(
        startCamera.quaternion,
        endQuaternion,
        t
    );
    const fov = startCamera.fov + (endViewpoint.camera.fov - startCamera.fov) * t;

    return { position, quaternion, fov };
};
