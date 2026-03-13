import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Bookmark, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveViewpointDialog } from './SaveViewpointDialog';
import { ViewpointList } from './ViewpointList';
import {
    useViewpointStore,
    serializeCameraState,
    applyViewpointToCamera,
    interpolateCameraState,
    type ViewpointData,
} from '../../core/store/useViewpointStore';
import { toast } from 'sonner';

interface ViewpointManagerProps {
    camera: THREE.PerspectiveCamera | null;
    controls: { target: THREE.Vector3 } | null;
}

export const ViewpointManager = ({ camera, controls }: ViewpointManagerProps) => {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const { addViewpoint, setTransitioning, isTransitioning } = useViewpointStore();

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-primary" />
                    视点管理
                </h3>
                <Button
                    size="sm"
                    onClick={() => setIsSaveDialogOpen(true)}
                    disabled={!canSave}
                    className="h-8 gap-1.5"
                >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    保存视点
                </Button>
            </div>

            <ViewpointList onGoToViewpoint={handleGoToViewpoint} />

            <SaveViewpointDialog
                isOpen={isSaveDialogOpen}
                onClose={() => setIsSaveDialogOpen(false)}
                onSave={handleSaveViewpoint}
            />
        </div>
    );
};
