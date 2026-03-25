import * as THREE from 'three';
import type { IBimLoader } from './IBimLoader';
// @ts-ignore
import initOCCT from 'occt-import-js';

const COLOR_PALETTE = [
    0x4a90d9, 0x50c878, 0xf4a460, 0xdda0dd, 0x87ceeb,
    0xf0e68c, 0xe6e6fa, 0xffa07a, 0x98fb98, 0xadd8e6,
    0xffb6c1, 0x90ee90, 0xffd700, 0x40e0d0, 0xee82ee,
    0xf5deb3, 0xdeb887, 0xbc8f8f, 0xa9a9a9, 0xb0c4de
];

export class StepLoaderStrategy implements IBimLoader {
    constructor() {
        // OCCT initialization usually handles itself or via a global promise
    }

    async load(file: File, _onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group> {
        const buffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(buffer);

        // Initialize OCCT (this loads the WASM and Worker)
        const occt = await initOCCT({
            locateFile: (name: string) => `assets/${name}`
        });

        // Parse the STEP file
        const result = occt.ReadStepFile(fileBuffer, null);
        console.log("StepLoaderStrategy: Import result", result);

        if (!result.success) {
            console.error("StepLoaderStrategy: Import failed", result);
            throw new Error("Failed to parse STEP file (occt-import-js returned success=false)");
        }

        console.log(`StepLoaderStrategy: Found ${result.meshes.length} meshes`);

        // Convert logic (simplified, assuming result needs processing)
        // occt-import-js typically returns a mesh-like structure or raw data that needs to be converted to THREE.BufferGeometry
        // Below is a simplified conversion assuming standard output from occt-import-js examples

        const group = new THREE.Group();

        result.meshes.forEach((mesh, index) => {
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

            const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8
            });

            const m = new THREE.Mesh(geometry, material);
            group.add(m);
        });

        if (group.children.length === 0) {
            console.warn("StepLoaderStrategy: Group is empty after processing meshes!");
        }

        // Log Bounding Box
        const box = new THREE.Box3().setFromObject(group);
        console.log("StepLoaderStrategy: Model Bounding Box", {
            min: box.min,
            max: box.max,
            size: box.getSize(new THREE.Vector3()),
            center: box.getCenter(new THREE.Vector3())
        });

        return group;
    }
}
