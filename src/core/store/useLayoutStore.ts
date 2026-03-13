import { create } from 'zustand';

interface LayoutState {
    isModelTreeOpen: boolean;
    isInspectorOpen: boolean;
    isViewpointOpen: boolean;
    toggleModelTree: () => void;
    toggleInspector: () => void;
    toggleViewpoint: () => void;
    closeAll: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isModelTreeOpen: false,
    isInspectorOpen: false,
    isViewpointOpen: false,
    toggleModelTree: () => set((state) => ({ 
        isModelTreeOpen: !state.isModelTreeOpen,
        isInspectorOpen: false,
        isViewpointOpen: false,
    })),
    toggleInspector: () => set((state) => ({ 
        isInspectorOpen: !state.isInspectorOpen,
        isModelTreeOpen: false,
        isViewpointOpen: false,
    })),
    toggleViewpoint: () => set((state) => ({ 
        isViewpointOpen: !state.isViewpointOpen,
        isModelTreeOpen: false,
        isInspectorOpen: false,
    })),
    closeAll: () => set({ isModelTreeOpen: false, isInspectorOpen: false, isViewpointOpen: false }),
}));
