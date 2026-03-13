import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { BookmarkPlus, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SaveViewpointDialog } from './SaveViewpointDialog';
import { ViewpointList } from './ViewpointList';
import {
    useViewpointStore,
    serializeCameraState,
    applyViewpointToCamera,
    interpolateCameraState,
    type ViewpointData,
} from '../../core/store/useViewpointStore';
import { useLayoutStore } from '../../core/store/useLayoutStore';
import { toast } from 'sonner';

interface ViewpointPanelProps {
    camera: THREE.PerspectiveCamera | null;
    controls: { target: THREE.Vector3 } | null;
}

export const ViewpointPanel = ({ camera, controls }: ViewpointPanelProps) => {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const { addViewpoint, setTransitioning, isTransitioning } = useViewpointStore();
    const { toggleViewpoint } = useLayoutStore();

    const animationRef = useRef<number | null>(null);
    const startCameraStateRef = useRef<{
        position: THREE.Vector3;
        quaternion: THREE.Quaternion;
        fov: number;
    } | null>(null);

    const handleSaveViewpoint = useCallback(
        (name: string, description?: string) => {
            if (!camera) {
                toast.error('无法保存视点', {
                    description: '相机未初始化',
                });
                return;
            }

            const cameraState = serializeCameraState(
                camera,
                controls || undefined
            );

            const newViewpoint = addViewpoint({
                name,
                description,
                ...cameraState,
            });

            toast.success('视点已保存', {
                description: `"${name}" 已成功保存`,
            });

            console.log('Saved viewpoint:', newViewpoint);
        },
        [camera, controls, addViewpoint]
    );

    const animateToViewpoint = useCallback(
        (viewpoint: ViewpointData) => {
            if (!camera || isTransitioning) return;

            setTransitioning(true);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            startCameraStateRef.current = {
                position: camera.position.clone(),
                quaternion: camera.quaternion.clone(),
                fov: camera.fov,
            };

            const startTime = performance.now();
            const duration = 800;

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const eased = 1 - Math.pow(1 - progress, 3);

                if (startCameraStateRef.current) {
                    const interpolated = interpolateCameraState(
                        startCameraStateRef.current,
                        viewpoint,
                        eased
                    );

                    camera.position.copy(interpolated.position);
                    camera.quaternion.copy(interpolated.quaternion);
                    camera.fov = interpolated.fov;
                    camera.updateProjectionMatrix();

                    if (controls && viewpoint.controls) {
                        const startTarget = controls.target.clone();
                        const endTarget = new THREE.Vector3(
                            viewpoint.controls.target.x,
                            viewpoint.controls.target.y,
                            viewpoint.controls.target.z
                        );
                        controls.target.lerpVectors(startTarget, endTarget, eased);
                    }
                }

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    applyViewpointToCamera(viewpoint, camera, controls || undefined);
                    setTransitioning(false);
                    animationRef.current = null;
                    startCameraStateRef.current = null;

                    toast.success('已切换到视点', {
                        description: `"${viewpoint.name}"`,
                    });
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        },
        [camera, controls, isTransitioning, setTransitioning]
    );

    const handleGoToViewpoint = useCallback(
        (viewpoint: ViewpointData) => {
            animateToViewpoint(viewpoint);
        },
        [animateToViewpoint]
    );

    const canSave = camera !== null && !isTransitioning;

    return (
        <div className="h-full flex flex-col min-h-0 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-border">
            {/* Header */}
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm" style={{ padding: '24px 24px' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-lg tracking-tight">视点管理</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={toggleViewpoint}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 w-full h-full [&>[data-radix-scroll-area-viewport]>div]:!block">
                <div className="space-y-6" style={{ padding: '24px', paddingBottom: '32px' }}>
                    {/* Save Viewpoint Button */}
                    <Button
                        onClick={() => setIsSaveDialogOpen(true)}
                        disabled={!canSave}
                        className="w-full gap-2"
                        size="lg"
                    >
                        <BookmarkPlus className="h-4 w-4" />
                        保存当前视点
                    </Button>

                    <Separator className="bg-border/30" />

                    {/* Viewpoint List */}
                    <ViewpointList onGoToViewpoint={handleGoToViewpoint} />
                </div>
            </ScrollArea>

            <SaveViewpointDialog
                isOpen={isSaveDialogOpen}
                onClose={() => setIsSaveDialogOpen(false)}
                onSave={handleSaveViewpoint}
            />
        </div>
    );
};
