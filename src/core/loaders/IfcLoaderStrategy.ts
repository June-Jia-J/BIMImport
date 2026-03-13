import * as THREE from 'three';
import type { IBimLoader } from './IBimLoader';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

export class IfcLoaderStrategy implements IBimLoader {
    private loader: IFCLoader;

    constructor() {
        this.loader = new IFCLoader();
        // Point to the location where vite-plugin-static-copy put the WASM files
        this.loader.ifcManager.setWasmPath('assets/');
    }

    async load(file: File, onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group> {
        const url = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (ifcModel) => {
                    // Clean up blob URL
                    URL.revokeObjectURL(url);
                    // Return the model (which is a THREE.Mesh/Group)
                    // Ensure it's treated as a group for consistency
                    const group = new THREE.Group();
                    group.add(ifcModel);
                    resolve(group);
                },
                (progress) => {
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            );
        });
    }
}
