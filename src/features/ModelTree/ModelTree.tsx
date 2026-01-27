import React from 'react';
import * as THREE from 'three';
import { useModelStore } from '../../core/store/useModelStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Box, Layers } from 'lucide-react';

interface TreeNodeProps {
    object: THREE.Object3D;
    level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ object, level = 0 }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const { selectedId, selectObject } = useModelStore();
    const hasChildren = object.children.length > 0;
    const isSelected = selectedId === object.uuid;

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectObject(object.uuid);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center py-2.5 px-3 hover:bg-accent/60 cursor-pointer text-sm transition-all duration-200 rounded-lg my-0.5",
                    isSelected && "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={handleSelect}
            >
                <div
                    className={cn(
                        "mr-2 p-1 rounded-md hover:bg-muted/80 transition-colors",
                        !hasChildren && "invisible"
                    )}
                    onClick={handleToggle}
                >
                    {isOpen ?
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> :
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </div>

                <Box className={cn(
                    "h-3.5 w-3.5 mr-2.5 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />

                <span className="truncate flex-1">{object.name || `对象 ${object.id}`}</span>

                <span className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-md transition-colors",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                )}>
                    {object.type}
                </span>
            </div>

            {isOpen && hasChildren && (
                <div className="ml-1">
                    {object.children.map((child) => (
                        <TreeNode key={child.uuid} object={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ModelTree = () => {
    const { models } = useModelStore();

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-semibold text-lg tracking-tight">模型层级</h2>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3">
                    {models.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <Layers className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-center text-muted-foreground text-sm font-medium">
                                暂无模型
                            </p>
                            <p className="text-center text-muted-foreground/60 text-xs mt-1">
                                点击"加载模型"开始
                            </p>
                        </div>
                    ) : (
                        models.map((model, index) => (
                            <TreeNode key={model.uuid || index} object={model} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
