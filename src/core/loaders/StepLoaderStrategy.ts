import * as THREE from 'three';
import type { IBimLoader } from './IBimLoader';
// @ts-ignore
import initOCCT from 'occt-import-js';

export class StepLoaderStrategy implements IBimLoader {
    constructor() {
        // OCCT initialization usually handles itself or via a global promise
    }

    async load(file: File, _onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group> {
        const text = await file.text();

        // Initialize OCCT (this loads the WASM and Worker)
        const occt = await initOCCT({
            locateFile: (name: string) => `assets/${name}`
        });

        // Parse the STEP file
        const result = await occt.readStepFile(text);

        // Convert logic (simplified, assuming result needs processing)
        // occt-import-js typically returns a mesh-like structure or raw data that needs to be converted to THREE.BufferGeometry
        // Below is a simplified conversion assuming standard output from occt-import-js examples

        const group = new THREE.Group();

        for (const mesh of result.meshes) {
            const geometry = new THREE.BufferGeometry();

            // Setup attributes
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3));
            if (mesh.attributes.normal) {
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3));
            }

            // Index if available
            if (mesh.index) {
                geometry.setIndex(new THREE.Uint16BufferAttribute(mesh.index.array, 1));
            }

            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(Math.random() * 0xffffff).getHex(),
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8
            });

            const m = new THREE.Mesh(geometry, material);
            group.add(m);
        }

        return group;
    }
}
