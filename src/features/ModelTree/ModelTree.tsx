import React from 'react';
import * as THREE from 'three';
import { useModelStore } from '../../core/store/useModelStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Box } from 'lucide-react';

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
                    "flex items-center py-1 px-2 hover:bg-accent/50 cursor-pointer text-sm transition-colors",
                    isSelected && "bg-accent text-accent-foreground font-medium"
                )}
                style={{ paddingLeft: `${level * 12 + 4}px` }}
                onClick={handleSelect}
            >
                <div
                    className={cn("mr-1 p-0.5 rounded-sm hover:bg-muted/80", !hasChildren && "invisible")}
                    onClick={handleToggle}
                >
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </div>

                <Box className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="truncate">{object.name || `Object ${object.id}`}</span>
                <span className="ml-auto text-xs text-muted-foreground opacity-50">{object.type}</span>
            </div>

            {isOpen && hasChildren && (
                <div>
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
        <div className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r">
            <div className="p-4 border-b">
                <h2 className="font-semibold tracking-tight">Model Hierarchy</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {models.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                            No models loaded
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
