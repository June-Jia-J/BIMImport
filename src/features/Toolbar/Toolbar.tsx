import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen } from "lucide-react";
import { useModelStore } from '../../core/store/useModelStore';
import { LoaderFactory } from '../../core/loaders/LoaderFactory';
import { toast } from "sonner"; // Shadcn hook replaced

export const Toolbar = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addModel, setLoading, reset } = useModelStore();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // const extension = file.name.split('.').pop()?.toLowerCase();

        try {
            setLoading(true, 0);
            const loader = LoaderFactory.getLoader(file.name);

            toast.info("Loading Model", {
                description: `Parsing ${file.name}...`,
            });

            const model = await loader.load(file, (progress) => {
                // Optional: Update granular progress if available
                console.log('Loading progress:', progress);
            });

            if (model) {
                model.name = file.name;
                addModel(model);
                toast.success("Success", {
                    description: `Successfully loaded ${file.name}`,
                });
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Error Loading Model", {
                description: error.message || "Unknown error occurred",
            });
        } finally {
            setLoading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-2 flex gap-2 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:border-t-0 md:border-b">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".ifc,.stp,.step"
                className="hidden"
            />

            <Button
                variant="default"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
            >
                <FolderOpen className="h-4 w-4" />
                Load Model
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="h-4 w-4" />
                Reset Scene
            </Button>
        </div>
    );
};
