import { create } from 'zustand';

interface LayoutState {
    isModelTreeOpen: boolean;
    rightPanelMode: 'inspector' | 'viewpoint' | null;
    toggleModelTree: () => void;
    toggleInspector: () => void;
    toggleViewpoint: () => void;
    closeAll: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isModelTreeOpen: false,
    rightPanelMode: null,
    toggleModelTree: () => set((state) => ({ 
        isModelTreeOpen: !state.isModelTreeOpen,
        rightPanelMode: state.isModelTreeOpen ? state.rightPanelMode : null
    })),
    toggleInspector: () => set((state) => ({ 
        rightPanelMode: state.rightPanelMode === 'inspector' ? null : 'inspector',
        isModelTreeOpen: false
    })),
    toggleViewpoint: () => set((state) => ({ 
        rightPanelMode: state.rightPanelMode === 'viewpoint' ? null : 'viewpoint',
        isModelTreeOpen: false
    })),
    closeAll: () => set({ isModelTreeOpen: false, rightPanelMode: null }),
}));
