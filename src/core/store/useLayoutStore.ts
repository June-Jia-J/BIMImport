import { create } from 'zustand';

type RightPanelType = 'inspector' | 'viewpoint' | null;

interface LayoutState {
    isModelTreeOpen: boolean;
    rightPanel: RightPanelType;
    toggleModelTree: () => void;
    openInspector: () => void;
    openViewpoint: () => void;
    toggleViewpoint: () => void;
    closeRightPanel: () => void;
    closeAll: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isModelTreeOpen: false,
    rightPanel: null,
    toggleModelTree: () => set((state) => ({
        isModelTreeOpen: !state.isModelTreeOpen,
    })),
    openInspector: () => set({
        rightPanel: 'inspector',
    }),
    openViewpoint: () => set({
        rightPanel: 'viewpoint',
    }),
    toggleViewpoint: () => set((state) => ({
        rightPanel: state.rightPanel === 'viewpoint' ? null : 'viewpoint',
    })),
    closeRightPanel: () => set({
        rightPanel: null,
    }),
    closeAll: () => set({ isModelTreeOpen: false, rightPanel: null }),
}));
