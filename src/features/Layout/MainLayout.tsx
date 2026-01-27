
import { Viewer3D } from '../Viewer/Viewer3D';
import { ModelTree } from '../ModelTree/ModelTree';
import { Toolbar } from '../Toolbar/Toolbar';
import { InspectorPanel } from './InspectorPanel';
import { WebGPUCheck } from '../../components/WebGPUError';
import { useModelStore } from '../../core/store/useModelStore';

export const MainLayout = () => {
    const { isLoading } = useModelStore();

    return (
        <WebGPUCheck>
            <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
                {/* Top Toolbar */}
                <div className="flex-none z-50">
                    <Toolbar />
                </div>

                <div className="flex-1 flex overflow-hidden relative gap-6 p-6">
                    {/* Left Sidebar - Model Tree - 始终显示 */}
                    <div className="w-[280px] lg:w-[320px] flex-none z-10 flex flex-col h-full min-h-0">
                        <ModelTree />
                    </div>

                    {/* Center - 3D Viewer */}
                    <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                        <Viewer3D />

                        {/* Loading Overlay */}
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

                        {/* Title Overlay with Gradient */}
                        <div className="absolute top-8 left-8 z-10 pointer-events-none">
                            <div className="bg-background/80 backdrop-blur-md rounded-xl px-8 py-4 shadow-lg border border-border/50">
                                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 text-2xl font-bold tracking-tight">
                                    BIM WebGPU 查看器 v2.0
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Inspector - 始终显示 */}
                    <div className="w-[280px] lg:w-[320px] flex-none z-10 flex flex-col h-full min-h-0">
                        <InspectorPanel />
                    </div>
                </div>
            </div>
        </WebGPUCheck>
    );
};
