/**
 * Save System
 * Persists game state to browser localStorage
 * Enables progress retention between sessions
 */

import { GameState } from "@/types/game.types";

const SAVE_KEY = "great-transit-save-v1";
const AUTO_SAVE_INTERVAL = 30000; // Auto-save every 30 seconds

export class SaveSystem {
  private autoSaveInterval: NodeJS.Timeout | null = null;

  /**
   * Save current game state to localStorage
   */
  public save(gameState: GameState): boolean {
    try {
      const saveData = {
        version: "1.0",
        timestamp: Date.now(),
        state: {
          ship: gameState.ship,
          timeDilatation: gameState.timeDilatation,
          inventory: gameState.inventory,
          credits: gameState.credits,
          gameTime: gameState.gameTime,
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log("[SaveSystem] Game saved successfully");
      return true;
    } catch (error) {
      console.error("[SaveSystem] Failed to save game:", error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  public load(): Partial<GameState> | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      
      if (!savedData) {
        console.log("[SaveSystem] No save data found");
        return null;
      }

      const parsed = JSON.parse(savedData);
      
      // Validate save data version
      if (parsed.version !== "1.0") {
        console.warn("[SaveSystem] Save data version mismatch");
        return null;
      }

      console.log("[SaveSystem] Game loaded successfully");
      return parsed.state;
    } catch (error) {
      console.error("[SaveSystem] Failed to load game:", error);
      return null;
    }
  }

  /**
   * Delete saved game data
   */
  public deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log("[SaveSystem] Save data deleted");
      return true;
    } catch (error) {
      console.error("[SaveSystem] Failed to delete save:", error);
      return false;
    }
  }

  /**
   * Check if save data exists
   */
  public hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Get save metadata without loading full state
   */
  public getSaveMetadata(): { timestamp: number; version: string } | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return null;

      const parsed = JSON.parse(savedData);
      return {
        timestamp: parsed.timestamp,
        version: parsed.version,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Start auto-save loop
   */
  public startAutoSave(getGameState: () => GameState): void {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = setInterval(() => {
      const state = getGameState();
      this.save(state);
    }, AUTO_SAVE_INTERVAL);

    console.log("[SaveSystem] Auto-save enabled (every 30s)");
  }

  /**
   * Stop auto-save loop
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log("[SaveSystem] Auto-save disabled");
    }
  }

  /**
   * Export save data as JSON string (for manual backup)
   */
  public exportSave(): string | null {
    const savedData = localStorage.getItem(SAVE_KEY);
    return savedData;
  }

  /**
   * Import save data from JSON string (for manual restore)
   */
  public importSave(saveDataJson: string): boolean {
    try {
      const parsed = JSON.parse(saveDataJson);
      
      // Validate structure
      if (!parsed.version || !parsed.state) {
        throw new Error("Invalid save data format");
      }

      localStorage.setItem(SAVE_KEY, saveDataJson);
      console.log("[SaveSystem] Save data imported successfully");
      return true;
    } catch (error) {
      console.error("[SaveSystem] Failed to import save:", error);
      return false;
    }
  }
}

// Singleton instance
export const saveSystem = new SaveSystem();
