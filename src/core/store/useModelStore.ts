import { create } from 'zustand';
import * as THREE from 'three';

interface ModelState {
    models: THREE.Group[];
    selectedId: string | null;
    isLoading: boolean;
    progress: number;

    // Actions
    addModel: (model: THREE.Group) => void;
    selectObject: (id: string | null) => void;
    setLoading: (loading: boolean, progress?: number) => void;
    reset: () => void;
}

export const useModelStore = create<ModelState>()((set) => ({
    models: [],
    selectedId: null,
    isLoading: false,
    progress: 0,

    addModel: (model) => set((state) => ({ models: [...state.models, model] })),
    selectObject: (id) => set({ selectedId: id }),
    setLoading: (loading, progress = 0) => set({ isLoading: loading, progress }),
    reset: () => set({ models: [], selectedId: null, isLoading: false, progress: 0 }),
}));
