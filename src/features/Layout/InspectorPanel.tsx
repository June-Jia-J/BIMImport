import * as THREE from 'three';
import { useModelStore } from '../../core/store/useModelStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const InspectorPanel = () => {
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
            <div className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l p-4">
                <h2 className="font-semibold tracking-tight mb-4">属性</h2>
                <div className="text-sm text-muted-foreground text-center mt-10">
                    选择一个元素查看属性
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l">
            <div className="p-4 border-b">
                <h2 className="font-semibold tracking-tight">属性</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">基本信息</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">名称</span>
                            <span className="truncate">{selectedObject.name || '未命名'}</span>

                            <span className="text-muted-foreground">类型</span>
                            <span>{selectedObject.type}</span>

                            <span className="text-muted-foreground">UUID</span>
                            <span className="truncate text-xs font-mono">{selectedObject.uuid}</span>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">变换</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">位置</span>
                            <span className="font-mono text-xs">
                                {selectedObject.position.toArray().map(v => v.toFixed(2)).join(', ')}
                            </span>

                            <span className="text-muted-foreground">旋转</span>
                            <span className="font-mono text-xs">
                                {selectedObject.rotation.toArray().slice(0, 3).map(v => (v as number).toFixed(2)).join(', ')}
                            </span>

                            <span className="text-muted-foreground">缩放</span>
                            <span className="font-mono text-xs">
                                {selectedObject.scale.toArray().map(v => v.toFixed(2)).join(', ')}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Placeholder for IFC/BIM specific data */}
                    {selectedObject.userData && Object.keys(selectedObject.userData).length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">数据</h3>
                            <div className="space-y-1">
                                {Object.entries(selectedObject.userData).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground truncate">{key}</span>
                                        <span className="truncate">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
