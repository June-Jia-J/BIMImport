import { Viewer3D } from '../Viewer/Viewer3D';
import { ModelTree } from '../ModelTree/ModelTree';
import { Toolbar } from '../Toolbar/Toolbar';
import { InspectorPanel } from './InspectorPanel';
import { ViewpointPanel } from '../Viewpoint/ViewpointPanel';
import { WebGPUCheck } from '../../components/WebGPUError';
import { useModelStore } from '../../core/store/useModelStore';
import { useLayoutStore } from '../../core/store/useLayoutStore';
import type { ViewpointData } from '../../core/store/useViewpointStore';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

export const MainLayout = () => {
    const { isLoading } = useModelStore();
    const { isModelTreeOpen, rightPanelMode, closeAll } = useLayoutStore();

    const handleSaveViewpoint = useCallback((name: string, description: string) => {
        const viewerControls = (window as any).__viewerControls;
        if (viewerControls) {
            viewerControls.saveViewpoint(name, description);
        }
    }, []);

    const handleApplyViewpoint = useCallback((viewpoint: ViewpointData) => {
        const viewerControls = (window as any).__viewerControls;
        if (viewerControls) {
            viewerControls.applyViewpoint(viewpoint);
        }
    }, []);

    return (
        <WebGPUCheck>
            <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
                <div className="flex-none z-50">
                    <Toolbar />
                </div>

                <div className="flex-1 flex overflow-hidden relative lg:gap-6 lg:p-6">
                    {(isModelTreeOpen || rightPanelMode) && (
                        <div
                            className="absolute inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                            onClick={closeAll}
                        />
                    )}

                    <div className={cn(
                        "fixed inset-y-0 z-50 w-[85%] sm:w-[320px] bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out border-r border-border/50",
                        isModelTreeOpen ? "left-0" : "-left-full",
                        "lg:static lg:w-[280px] lg:bg-transparent lg:shadow-none lg:border-none lg:flex-none lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:z-10"
                    )}>
                        <div className="h-full pt-20 lg:pt-0 p-4 lg:p-0">
                            <ModelTree />
                        </div>
                    </div>

                    <div className="flex-1 relative w-full h-full lg:rounded-2xl overflow-hidden shadow-2xl border-t border-b lg:border border-border/50 bg-background">
                        <Viewer3D />

                        {isLoading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                                <div className="bg-background/95 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-border">
                                    <div className="relative">
                                        <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full" />
                                        <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-primary/20 rounded-full" style={{ animationDuration: '2s' }} />
                                    </div>
                                    <div className="text-foreground font-medium text-lg">
                                        正在加载模型...
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-10 pointer-events-none hidden sm:block">
                            <div className="bg-background/80 backdrop-blur-md rounded-xl px-4 py-2 lg:px-8 lg:py-4 shadow-lg border border-border/50">
                                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 text-lg lg:text-2xl font-bold tracking-tight">
                                    BIM WebGPU 查看器 v1.0
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "fixed inset-y-0 z-50 w-[85%] sm:w-[320px] bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out border-l border-border/50",
                        rightPanelMode ? "right-0" : "-right-full",
                        "lg:static lg:w-[320px] lg:bg-transparent lg:shadow-none lg:border-none lg:flex-none lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:z-10"
                    )}>
                        <div className="h-full pt-20 lg:pt-0 p-4 lg:p-0">
                            {rightPanelMode === 'viewpoint' ? (
                                <ViewpointPanel
                                    onSaveViewpoint={handleSaveViewpoint}
                                    onApplyViewpoint={handleApplyViewpoint}
                                />
                            ) : rightPanelMode === 'inspector' ? (
                                <InspectorPanel />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </WebGPUCheck>
    );
};
