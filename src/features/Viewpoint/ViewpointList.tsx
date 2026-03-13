import { useState, useRef } from 'react';
import {
    Camera,
    Trash2,
    Edit2,
    Play,
    Clock,
    MoreVertical,
    X,
    Check,
    Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useViewpointStore,
    type ViewpointData,
} from '../../core/store/useViewpointStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ViewpointListProps {
    onGoToViewpoint: (viewpoint: ViewpointData) => void;
}

export const ViewpointList = ({ onGoToViewpoint }: ViewpointListProps) => {
    const { viewpoints, deleteViewpoint, updateViewpoint, isTransitioning } =
        useViewpointStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStartEdit = (viewpoint: ViewpointData) => {
        setEditingId(viewpoint.id);
        setEditName(viewpoint.name);
        setEditDescription(viewpoint.description || '');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSaveEdit = () => {
        if (editingId && editName.trim()) {
            updateViewpoint(editingId, {
                name: editName.trim(),
                description: editDescription.trim() || undefined,
            });
        }
        setEditingId(null);
        setEditName('');
        setEditDescription('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditDescription('');
    };

    const handleDelete = (id: string) => {
        deleteViewpoint(id);
    };

    if (viewpoints.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        暂无保存的视点
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        点击上方按钮保存当前视角
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        已保存视点 ({viewpoints.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-2 p-4 pt-0">
                        {viewpoints.map((viewpoint) => (
                            <div
                                key={viewpoint.id}
                                className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Camera className="h-4 w-4 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {editingId === viewpoint.id ? (
                                        <div className="space-y-2">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={editName}
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        handleSaveEdit();
                                                    if (e.key === 'Escape')
                                                        handleCancelEdit();
                                                }}
                                                className="w-full px-2 py-1 text-sm rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                            />
                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        handleSaveEdit();
                                                    if (e.key === 'Escape')
                                                        handleCancelEdit();
                                                }}
                                                placeholder="备注（可选）"
                                                className="w-full px-2 py-1 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                            />
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0"
                                                    onClick={handleSaveEdit}
                                                >
                                                    <Check className="h-3 w-3 text-green-600" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0"
                                                    onClick={handleCancelEdit}
                                                >
                                                    <X className="h-3 w-3 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="text-sm font-medium truncate">
                                                {viewpoint.name}
                                            </h4>
                                            {viewpoint.description && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {viewpoint.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDate(
                                                        viewpoint.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {editingId !== viewpoint.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() =>
                                                onGoToViewpoint(viewpoint)
                                            }
                                            disabled={isTransitioning}
                                            title="切换到该视点"
                                        >
                                            <Play className="h-3.5 w-3.5 text-primary" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-32"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleStartEdit(
                                                            viewpoint
                                                        )
                                                    }
                                                    className="text-xs cursor-pointer"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                                                    重命名
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(
                                                            viewpoint.id
                                                        )
                                                    }
                                                    className="text-xs cursor-pointer text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    删除
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
