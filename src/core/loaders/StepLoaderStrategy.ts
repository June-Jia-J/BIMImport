import * as THREE from 'three';
import type { IBimLoader } from './IBimLoader';
// @ts-ignore
import initOCCT from 'occt-import-js';

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

        // 使用基于mesh索引的固定颜色方案，确保同一模型每次导入颜色一致
        const colors = [
            0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6,
            0x1abc9c, 0xe67e22, 0x34495e, 0x95a5a6, 0xd35400,
            0x16a085, 0x8e44ad, 0x27ae60, 0xc0392b, 0x2980b9
        ];

        for (let i = 0; i < result.meshes.length; i++) {
            const mesh = result.meshes[i];
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

            const colorIndex = i % colors.length;
            const material = new THREE.MeshStandardMaterial({
                color: colors[colorIndex],
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8
            });

            const m = new THREE.Mesh(geometry, material);
            group.add(m);
        }

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
