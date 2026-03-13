import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    target: { x: number; y: number; z: number };
}

interface ViewpointState {
    viewpoints: ViewpointData[];
    activeViewpointId: string | null;
    
    addViewpoint: (viewpoint: Omit<ViewpointData, 'id' | 'createdAt'>) => string;
    updateViewpoint: (id: string, updates: Partial<Pick<ViewpointData, 'name' | 'description'>>) => void;
    deleteViewpoint: (id: string) => void;
    setActiveViewpoint: (id: string | null) => void;
    getViewpoint: (id: string) => ViewpointData | undefined;
}

const generateId = () => `vp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useViewpointStore = create<ViewpointState>()(
    persist(
        (set, get) => ({
            viewpoints: [],
            activeViewpointId: null,

            addViewpoint: (viewpoint) => {
                const id = generateId();
                const newViewpoint: ViewpointData = {
                    ...viewpoint,
                    id,
                    createdAt: Date.now(),
                };
                set((state) => ({
                    viewpoints: [...state.viewpoints, newViewpoint],
                }));
                return id;
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
                    activeViewpointId: state.activeViewpointId === id ? null : state.activeViewpointId,
                }));
            },

            setActiveViewpoint: (id) => {
                set({ activeViewpointId: id });
            },

            getViewpoint: (id) => {
                return get().viewpoints.find((vp) => vp.id === id);
            },
        }),
        {
            name: 'bim-viewpoints-storage',
        }
    )
);
