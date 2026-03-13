import React, { useState } from 'react';
import { useViewpointStore } from '../../core/store/useViewpointStore';
import type { ViewpointData } from '../../core/store/useViewpointStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, Trash2, Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewpointPanelProps {
    onSaveViewpoint: (name: string, description: string) => void;
    onApplyViewpoint: (viewpoint: ViewpointData) => void;
}

export const ViewpointPanel: React.FC<ViewpointPanelProps> = ({
    onSaveViewpoint,
    onApplyViewpoint,
}) => {
    const { viewpoints, deleteViewpoint, updateViewpoint, activeViewpointId, setActiveViewpoint } = useViewpointStore();
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        onSaveViewpoint(name.trim(), description.trim());
        setName('');
        setDescription('');
        setIsSaveDialogOpen(false);
    };

    const handleEdit = (viewpoint: ViewpointData) => {
        setEditingId(viewpoint.id);
        setName(viewpoint.name);
        setDescription(viewpoint.description || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingId || !name.trim()) return;
        updateViewpoint(editingId, { name: name.trim(), description: description.trim() });
        setName('');
        setDescription('');
        setEditingId(null);
        setIsEditDialogOpen(false);
    };

    const handleApply = (viewpoint: ViewpointData) => {
        setActiveViewpoint(viewpoint.id);
        onApplyViewpoint(viewpoint);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur-xl rounded-xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">视点管理</h2>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsSaveDialogOpen(true)}
                    className="gap-1"
                >
                    <Plus className="h-4 w-4" />
                    保存视点
                </Button>
            </div>

            <ScrollArea className="flex-1">
                {viewpoints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Camera className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">暂无保存的视点</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {viewpoints.map((viewpoint) => (
                            <div
                                key={viewpoint.id}
                                className={cn(
                                    "group p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer",
                                    activeViewpointId === viewpoint.id && "border-primary bg-primary/5"
                                )}
                                onClick={() => handleApply(viewpoint)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{viewpoint.name}</h3>
                                        {viewpoint.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {viewpoint.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground/70 mt-2">
                                            {formatDate(viewpoint.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(viewpoint);
                                            }}
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteViewpoint(viewpoint.id);
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>保存当前视点</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                视点名称 <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="输入视点名称"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">备注（可选）</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="输入备注信息"
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave} disabled={!name.trim()}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>编辑视点</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                视点名称 <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="输入视点名称"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">备注（可选）</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="输入备注信息"
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleUpdate} disabled={!name.trim()}>
                            更新
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
