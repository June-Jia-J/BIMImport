import React from 'react';
import * as THREE from 'three';
import { useModelStore } from '../../core/store/useModelStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Info, Move, RotateCw, Maximize2, Database } from 'lucide-react';

interface InspectorPanelProps {
    camera?: THREE.PerspectiveCamera | null;
    controls?: { target: THREE.Vector3 } | null;
}

export const InspectorPanel = ({}: InspectorPanelProps) => {
    const { selectedId, models } = useModelStore();

    // Helper to find object by ID in the model tree
    const findObject = (objects: THREE.Object3D[], id: string): THREE.Object3D | null => {
        for (const obj of objects) {
            if (obj.uuid === id) return obj;
            if (obj.children.length > 0) {
                const found = findObject(obj.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedObject = selectedId
        ? findObject(models, selectedId)
        : null;

    if (!selectedObject) {
        return (
            <div className="h-full flex flex-col min-h-0 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-border">
                <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm" style={{ padding: '24px 24px' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-lg tracking-tight">属性</h2>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <Info className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium text-center">
                        选择一个元素查看属性
                    </p>
                    <p className="text-xs text-muted-foreground/60 text-center mt-1">
                        在模型树中点击对象
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col min-h-0 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-border">
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm" style={{ padding: '24px 24px' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-semibold text-lg tracking-tight">属性</h2>
                </div>
            </div>

            <ScrollArea className="flex-1 w-full h-full [&>[data-radix-scroll-area-viewport]>div]:!block">
                <div className="space-y-8" style={{ padding: '24px', paddingBottom: '32px' }}>
                    {/* General Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Info className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">基本信息</h3>
                        </div>

                        <div className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 p-4 space-y-2">
                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">名称</span>
                                <div className="text-sm font-medium text-foreground bg-muted/50 p-3 rounded-md break-all">
                                    {selectedObject.name || `对象 ${selectedObject.id}`}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="flex justify-between items-start gap-4">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">类型</span>
                                <span className="text-sm px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                    {selectedObject.type}
                                </span>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">UUID</span>
                                <div className="font-mono text-xs bg-muted/50 p-3 rounded-md text-foreground break-all select-all hover:bg-muted transition-colors cursor-text group relative">
                                    {selectedObject.uuid}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/30" />

                    {/* Transform */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Move className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">变换</h3>
                        </div>

                        <div className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 p-4 space-y-2">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Move className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">位置</span>
                                </div>
                                <div className="font-mono text-xs bg-muted/50 px-3 py-2 rounded-lg text-foreground">
                                    {selectedObject.position.toArray().map(v => v.toFixed(2)).join(', ')}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <RotateCw className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">旋转</span>
                                </div>
                                <div className="font-mono text-xs bg-muted/50 px-3 py-2 rounded-lg text-foreground">
                                    {selectedObject.rotation.toArray().slice(0, 3).map(v => (v as number).toFixed(2)).join(', ')}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Maximize2 className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">缩放</span>
                                </div>
                                <div className="font-mono text-xs bg-muted/50 px-3 py-2 rounded-lg text-foreground">
                                    {selectedObject.scale.toArray().map(v => v.toFixed(2)).join(', ')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Data */}
                    {selectedObject.userData && Object.keys(selectedObject.userData).length > 0 && (
                        <>
                            <Separator className="bg-border/30" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Database className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">数据</h3>
                                </div>

                                <div className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 p-6 space-y-6">
                                    {Object.entries(selectedObject.userData).map(([key, value], index, arr) => (
                                        <React.Fragment key={key}>
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide break-all max-w-[40%] text-left mt-0.5">
                                                    {key}
                                                </span>
                                                <span className="text-sm text-foreground text-right flex-1 break-words whitespace-pre-wrap">
                                                    {String(value)}
                                                </span>
                                            </div>
                                            {index < arr.length - 1 && <Separator className="bg-border/50" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
