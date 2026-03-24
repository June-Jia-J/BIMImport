import * as THREE from 'three';
import type { IBimLoader } from './IBimLoader';
// @ts-ignore
import initOCCT from 'occt-import-js';

// 根据字符串生成固定颜色的哈希函数
function stringToColor(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // 使用 HSL 色彩空间生成美观的颜色
    const hue = Math.abs(hash % 360);
    const saturation = 60 + Math.abs((hash >> 8) % 30); // 60-90%
    const lightness = 45 + Math.abs((hash >> 16) % 20); // 45-65%
    return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`).getHex();
}

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

            // 根据mesh名称生成固定颜色，确保相同模型每次导入颜色一致
            // 优先使用mesh名称，如果没有则使用索引生成唯一标识
            const meshName = mesh.name || `mesh_${i}`;
            const colorHex = stringToColor(meshName);
            const material = new THREE.MeshStandardMaterial({
                color: colorHex,
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8
            });

            const m = new THREE.Mesh(geometry, material);
            m.name = meshName;
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
