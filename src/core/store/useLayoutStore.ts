import { create } from 'zustand';

interface LayoutState {
    isModelTreeOpen: boolean;
    isInspectorOpen: boolean;
    toggleModelTree: () => void;
    toggleInspector: () => void;
    closeAll: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isModelTreeOpen: false,
    isInspectorOpen: false,
    toggleModelTree: () => set((state) => ({ 
        isModelTreeOpen: !state.isModelTreeOpen,
        isInspectorOpen: false // Close other panel
    })),
    toggleInspector: () => set((state) => ({ 
        isInspectorOpen: !state.isInspectorOpen,
        isModelTreeOpen: false // Close other panel
    })),
    closeAll: () => set({ isModelTreeOpen: false, isInspectorOpen: false }),
}));
