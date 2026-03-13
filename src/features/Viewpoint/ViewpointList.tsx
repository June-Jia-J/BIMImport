import { useState } from 'react';
import { Camera, Save, Trash2, Edit, Check, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useViewpointStore } from '../../core/store/useViewpointStore';
import { toast } from 'sonner';

export const ViewpointList = () => {
    const { viewpoints, currentViewpointId, isTransitioning, saveCurrentView, applyViewpoint, deleteViewpoint, renameViewpoint } = useViewpointStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newViewpointName, setNewViewpointName] = useState('');
    const [newViewpointDescription, setNewViewpointDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const handleSaveViewpoint = () => {
        if (!newViewpointName.trim()) {
            toast.error('请输入视点名称');
            return;
        }

        const success = saveCurrentView(newViewpointName.trim(), newViewpointDescription.trim());
        if (success) {
            toast.success('视点已保存', {
                description: `"${newViewpointName}" 已成功保存`,
            });
            setIsDialogOpen(false);
            setNewViewpointName('');
            setNewViewpointDescription('');
        } else {
            toast.error('保存失败', {
                description: '无法获取相机状态',
            });
        }
    };

    const handleApplyViewpoint = async (id: string) => {
        if (isTransitioning) return;
        await applyViewpoint(id);
    };

    const handleDeleteViewpoint = (id: string, name: string) => {
        deleteViewpoint(id);
        toast.info('视点已删除', {
            description: `"${name}" 已删除`,
        });
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEditName = (id: string) => {
        if (!editName.trim()) {
            toast.error('名称不能为空');
            return;
        }
        renameViewpoint(id, editName.trim());
        setEditingId(null);
        setEditName('');
        toast.success('名称已更新');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-lg">视点</h2>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <Save className="h-4 w-4" />
                                <span className="hidden sm:inline">保存</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>保存当前视点</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">视点名称 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newViewpointName}
                                        onChange={(e) => setNewViewpointName(e.target.value)}
                                        placeholder="输入视点名称..."
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">备注（可选）</label>
                                    <textarea
                                        value={newViewpointDescription}
                                        onChange={(e) => setNewViewpointDescription(e.target.value)}
                                        placeholder="添加备注..."
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-20"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>取消</Button>
                                    <Button onClick={handleSaveViewpoint}>保存</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {viewpoints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <Camera className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">暂无视点</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">点击右上角按钮保存当前视图</p>
                        </div>
                    ) : (
                        viewpoints.map((viewpoint) => (
                            <div
                                key={viewpoint.id}
                                className={`rounded-lg border border-border/50 p-3 transition-all duration-200 overflow-hidden ${
                                    currentViewpointId === viewpoint.id
                                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                                        : 'hover:bg-accent/50'
                                }`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Camera className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {editingId === viewpoint.id ? (
                                            <div className="flex items-center gap-1 min-w-0">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-input bg-background"
                                                    autoFocus
                                                />
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEditName(viewpoint.id)}>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditing}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <h3 className="font-medium text-sm truncate">{viewpoint.name}</h3>
                                        )}

                                        {viewpoint.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {viewpoint.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                            <span>{formatDate(viewpoint.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleApplyViewpoint(viewpoint.id)}
                                            disabled={isTransitioning}
                                        >
                                            <Play className={`h-4 w-4 ${isTransitioning && currentViewpointId === viewpoint.id ? 'animate-pulse' : ''}`} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => startEditing(viewpoint.id, viewpoint.name)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteViewpoint(viewpoint.id, viewpoint.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
