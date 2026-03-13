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
                    "group flex items-start py-2.5 pr-3 hover:bg-accent/60 cursor-pointer text-sm transition-all duration-200 rounded-lg my-0.5 min-w-0 h-auto",
                    isSelected && "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                )}
                style={{ paddingLeft: `${level * 16 + 0}px` }}
                onClick={handleSelect}
            >
                <div
                    className={cn(
                        "mr-2 p-1 rounded-md hover:bg-muted/80 transition-colors mt-0.5",
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
                    "h-3.5 w-3.5 mr-2.5 flex-shrink-0 transition-colors mt-1.5",
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />

                <div className="flex-1 min-w-0 flex flex-col gap-0.5 py-1">
                    <span className="break-words whitespace-pre-wrap leading-tight text-sm font-medium" title={object.name || `对象 ${object.id}`}>
                        {object.name || `对象 ${object.id}`}
                    </span>
                    <span className={cn(
                        "text-[10px] w-fit px-1.5 py-0.5 rounded transition-colors",
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                    )}>
                        {object.type}
                    </span>
                </div>
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
        <div className="h-full flex flex-col min-h-0 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-border">
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm" style={{ padding: '24px 24px' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-semibold text-lg tracking-tight">模型层级</h2>
                </div>
            </div>

            {models.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <Layers className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium text-center">
                        暂无模型
                    </p>
                    <p className="text-xs text-muted-foreground/60 text-center mt-1">
                        点击"加载模型"开始
                    </p>
                </div>
            ) : (
                <ScrollArea className="flex-1 w-full h-full">
                    <div className="w-full">
                        {models.map((model, index) => (
                            <TreeNode key={model.uuid || index} object={model} />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
};
