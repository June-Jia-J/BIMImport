import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CameraManager } from '../engine/CameraManager';
import type { CameraState } from '../engine/CameraControls';

export type { CameraState as ViewpointCameraState };

export interface Viewpoint {
    id: string;
    name: string;
    description: string;
    cameraState: CameraState;
    createdAt: string;
}

interface ViewpointState {
    viewpoints: Viewpoint[];
    currentViewpointId: string | null;
    isTransitioning: boolean;

    saveCurrentView: (name: string, description?: string) => boolean;
    applyViewpoint: (id: string, animate?: boolean) => Promise<void>;
    deleteViewpoint: (id: string) => void;
    renameViewpoint: (id: string, newName: string) => void;
    setCurrentViewpoint: (id: string | null) => void;
    setIsTransitioning: (value: boolean) => void;
    clearAll: () => void;
}

const STORAGE_KEY = 'bim-viewer-viewpoints';

export const useViewpointStore = create<ViewpointState>()(
    persist(
        (set, get) => ({
            viewpoints: [],
            currentViewpointId: null,
            isTransitioning: false,

            saveCurrentView: (name, description = '') => {
                const cameraManager = CameraManager.getInstance();
                const controls = cameraManager.getControls();
                if (!controls) return false;

                const cameraState = controls.getCameraState();
                const viewpoint: Viewpoint = {
                    id: crypto.randomUUID(),
                    name,
                    description,
                    cameraState,
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    viewpoints: [...state.viewpoints, viewpoint],
                    currentViewpointId: viewpoint.id,
                }));
                return true;
            },

            applyViewpoint: async (id, animate = true) => {
                const viewpoint = get().viewpoints.find(v => v.id === id);
                if (!viewpoint) return;

                const cameraManager = CameraManager.getInstance();
                const controls = cameraManager.getControls();
                if (!controls) return;

                set({ isTransitioning: true, currentViewpointId: id });
                try {
                    await controls.setCameraState(viewpoint.cameraState, animate);
                } finally {
                    set({ isTransitioning: false });
                }
            },

            deleteViewpoint: (id) => {
                set((state) => ({
                    viewpoints: state.viewpoints.filter((v) => v.id !== id),
                    currentViewpointId: state.currentViewpointId === id ? null : state.currentViewpointId,
                }));
            },

            renameViewpoint: (id, newName) => {
                set((state) => ({
                    viewpoints: state.viewpoints.map((v) =>
                        v.id === id ? { ...v, name: newName } : v
                    ),
                }));
            },

            setCurrentViewpoint: (id) => {
                set({ currentViewpointId: id });
            },

            setIsTransitioning: (value) => {
                set({ isTransitioning: value });
            },

            clearAll: () => {
                set({ viewpoints: [], currentViewpointId: null });
            },
        }),
        {
            name: STORAGE_KEY,
        }
    )
);
