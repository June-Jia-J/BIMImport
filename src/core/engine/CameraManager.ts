import { CameraControls } from './CameraControls';

export class CameraManager {
    private static instance: CameraManager | null = null;
    private controls: CameraControls | null = null;

    public static getInstance(): CameraManager {
        if (!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }

    public setControls(controls: CameraControls): void {
        this.controls = controls;
    }

    public getControls(): CameraControls | null {
        return this.controls;
    }

    public hasControls(): boolean {
        return this.controls !== null;
    }
}
