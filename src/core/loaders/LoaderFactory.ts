import type { IBimLoader } from './IBimLoader';
import { IfcLoaderStrategy } from './IfcLoaderStrategy';
import { StepLoaderStrategy } from './StepLoaderStrategy';

export class LoaderFactory {
    static getLoader(filename: string): IBimLoader {
        const extension = filename.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'ifc':
                return new IfcLoaderStrategy();
            case 'stp':
            case 'step':
                return new StepLoaderStrategy();
            default:
                throw new Error(`Unsupported file extension: .${extension}`);
        }
    }
}
