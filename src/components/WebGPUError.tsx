import { useEffect, useState } from 'react';
// @ts-ignore
import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js';

export const WebGPUCheck = ({ children }: { children: React.ReactNode }) => {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if WebGPU is available
        const check = async () => {
            if (WebGPU && WebGPU.isAvailable()) {
                setIsSupported(true);
            } else {
                setIsSupported(false);
            }
        };
        check();
    }, []);

    if (isSupported === null) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Checking WebGPU Support...</div>;
    }

    if (!isSupported) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500 p-8 text-center">
                <h1 className="text-4xl font-bold mb-4">WebGPU Not Supported</h1>
                <p className="max-w-md text-gray-300">
                    Your browser does not support WebGPU. Please use the latest Chrome, Edge, or a browser with WebGPU enabled.
                </p>
            </div>
        );
    }

    return <>{children}</>;
};
