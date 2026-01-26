
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
            <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
                {/* Top Toolbar */}
                <div className="flex-none z-50">
                    <Toolbar />
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Sidebar - Model Tree */}
                    <div className="w-[300px] flex-none z-10 hidden md:block border-r">
                        <ModelTree />
                    </div>

                    {/* Center - 3D Viewer */}
                    <div className="flex-1 relative bg-black">
                        <Viewer3D />

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                                <div className="text-white font-medium flex flex-col items-center gap-2">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                                    Loading Model...
                                </div>
                            </div>
                        )}

                        {/* Title Overlay */}
                        <div className="absolute top-4 left-4 z-0 pointer-events-none opacity-50">
                            <h1 className="text-white text-xl font-bold drop-shadow-md">BIM WebGPU Viewer</h1>
                        </div>
                    </div>

                    {/* Right Sidebar - Inspector */}
                    <div className="w-[300px] flex-none z-10 hidden lg:block border-l">
                        <InspectorPanel />
                    </div>
                </div>
            </div>
        </WebGPUCheck>
    );
};
