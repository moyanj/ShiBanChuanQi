export interface SavePackage {
    version: string;
    updatedAt: number;
    data: any;
}

export class SaveService {
    private static readonly VERSION = "1.0.0";

    static async save(data: any): Promise<boolean> {
        const pkg: SavePackage = {
            version: this.VERSION,
            updatedAt: Date.now(),
            data: data
        };

        if (window.electron && window.electron.saveGame) {
            const result = await window.electron.saveGame(pkg);
            return result.success;
        } else {
            // Fallback for web
            try {
                localStorage.setItem("save_game", JSON.stringify(pkg));
                return true;
            } catch (e) {
                console.error("Local storage save failed:", e);
                return false;
            }
        }
    }

    static async load(): Promise<SavePackage | null> {
        if (window.electron && window.electron.loadGame) {
            const result = await window.electron.loadGame();
            if (result.success) {
                return result.data;
            }
        } else {
            // Fallback for web
            const data = localStorage.getItem("save_game");
            if (data) {
                return JSON.parse(data);
            }
        }
        return null;
    }
}
