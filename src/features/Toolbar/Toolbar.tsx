import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FolderOpen, RotateCcw, Sparkles, Menu, Info, Camera } from "lucide-react";
import { useModelStore } from '../../core/store/useModelStore';
import { useLayoutStore } from '../../core/store/useLayoutStore';
import { LoaderFactory } from '../../core/loaders/LoaderFactory';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

export const Toolbar = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addModel, setLoading, reset } = useModelStore();
    const { toggleModelTree, toggleInspector, toggleViewpoint, rightPanelMode, isModelTreeOpen } = useLayoutStore();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true, 0);
            const loader = LoaderFactory.getLoader(file.name);

            toast.info("加载模型", {
                description: `正在解析 ${file.name}...`,
            });

            const model = await loader.load(file, (progress) => {
                console.log('Loading progress:', progress);
            });

            if (model) {
                model.name = file.name;
                addModel(model);
                toast.success("成功", {
                    description: `成功加载 ${file.name}`,
                });
            }

        } catch (error: any) {
            console.error(error);
            toast.error("加载模型失败", {
                description: error.message || "发生未知错误",
            });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-background/95 backdrop-blur-md border-b border-border/50">
            <div className="flex gap-4 items-center max-w-[2000px] mx-auto" style={{ padding: '20px 32px' }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".ifc,.stp,.step"
                    className="hidden"
                />

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("lg:hidden", isModelTreeOpen && "bg-primary/20")}
                    onClick={toggleModelTree}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 mr-auto">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h2 className="font-semibold text-2xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent hidden sm:block">
                        BIM 查看器
                    </h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="default"
                        size="default"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2 px-6"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.55 0.22 264) 0%, oklch(0.50 0.20 280) 100%)'
                        }}
                    >
                        <FolderOpen className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">加载模型</span>
                    </Button>

                    <div className="w-px h-8 bg-border/50 hidden sm:block" />

                    <Button
                        variant="secondary"
                        size="default"
                        onClick={reset}
                        className="shadow-lg hover:shadow-xl transition-all duration-300 gap-2 px-6"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">重置场景</span>
                    </Button>

                    <Button
                        variant={rightPanelMode === 'viewpoint' ? 'default' : 'secondary'}
                        size="default"
                        onClick={toggleViewpoint}
                        className={cn(
                            "shadow-lg hover:shadow-xl transition-all duration-300 gap-2 px-6",
                            rightPanelMode === 'viewpoint' && "text-primary-foreground"
                        )}
                    >
                        <Camera className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">视点</span>
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("lg:hidden", rightPanelMode === 'inspector' && "bg-primary/20")}
                        onClick={toggleInspector}
                    >
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
