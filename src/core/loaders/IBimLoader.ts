import * as THREE from 'three';

export interface IBimLoader {
    load(file: File, onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group>;
}
