import * as THREE from 'three';
// @ts-ignore
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class GeometryMerger {
    static mergeModel(model: THREE.Group): THREE.Group {
        const materialGeometries = new Map<THREE.Material, THREE.BufferGeometry[]>();
        const originalMaterials = new Map<string, THREE.Material>();

        // 1. Traverse and collect geometries by material
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                    // Clone geometry to avoid mutating original if needed, 
                    // but here we want to replace, so apply transform
                    const geom = child.geometry.clone();
                    geom.applyMatrix4(child.matrixWorld);

                    const material = child.material;
                    // Handle array of materials if necessary (skipping for simplicity in this optimization)
                    if (!Array.isArray(material)) {
                        if (!materialGeometries.has(material)) {
                            materialGeometries.set(material, []);
                            originalMaterials.set(material.uuid, material);
                        }
                        materialGeometries.get(material)?.push(geom);
                    }
                }
            }
        });

        // 2. Merge geometries
        const mergedGroup = new THREE.Group();
        // Keep original name/userData if possible from root
        mergedGroup.name = model.name + " (Merged)";
        mergedGroup.userData = model.userData;

        for (const [material, geometries] of materialGeometries) {
            if (geometries.length > 0) {
                const mergedGeometry = mergeGeometries(geometries);
                const mesh = new THREE.Mesh(mergedGeometry, material);
                mergedGroup.add(mesh);
            }
        }

        return mergedGroup;
    }
}
