/**
 * Ship-Heartbeat Engine
 * Core simulation loop that monitors and updates ship systems
 * 
 * This is the "pulse" of the game - a tick-based simulation that runs
 * in the background, degrading systems and triggering events.
 */

import { ShipSystems, GameState } from "@/types/game.types";

export class ShipHeartbeat {
  private systems: ShipSystems;
  private isActive: boolean = false;
  private tickInterval: NodeJS.Timeout | null = null;
  private readonly TICK_RATE = 1000; // 1 second per tick
  
  // Degradation rates per tick (affected by time scale)
  private readonly DEGRADATION = {
    power: 0.05,
    oxygen: 0.03,
    hull: 0.02,
    cryo: 0.01,
  };

  // Critical thresholds
  private readonly CRITICAL_THRESHOLD = 20;
  private readonly DANGER_THRESHOLD = 50;

  constructor(initialSystems?: Partial<ShipSystems>) {
    this.systems = {
      power: initialSystems?.power ?? 100,
      oxygen: initialSystems?.oxygen ?? 100,
      hull: initialSystems?.hull ?? 100,
      cryo: initialSystems?.cryo ?? 100,
    };
  }

  /**
   * Start the heartbeat simulation
   * @param onTick - Callback called on each tick with updated state
   */
  public start(onTick: (systems: ShipSystems, alerts: string[]) => void): void {
    if (this.isActive) return;

    this.isActive = true;
    this.tickInterval = setInterval(() => {
      this.tick();
      const alerts = this.checkAlerts();
      onTick(this.getSystems(), alerts);
    }, this.TICK_RATE);
  }

  /**
   * Stop the heartbeat simulation
   */
  public stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Execute a single simulation tick
   * @param timeMultiplier - Speed multiplier from time dilatation
   */
  public tick(timeMultiplier: number = 1.0): void {
    // Apply degradation with time multiplier
    this.systems.power = Math.max(0, this.systems.power - this.DEGRADATION.power * timeMultiplier);
    this.systems.oxygen = Math.max(0, this.systems.oxygen - this.DEGRADATION.oxygen * timeMultiplier);
    this.systems.hull = Math.max(0, this.systems.hull - this.DEGRADATION.hull * timeMultiplier);
    this.systems.cryo = Math.max(0, this.systems.cryo - this.DEGRADATION.cryo * timeMultiplier);

    // Systems interdependencies
    if (this.systems.power < this.CRITICAL_THRESHOLD) {
      // Low power accelerates oxygen loss
      this.systems.oxygen = Math.max(0, this.systems.oxygen - 0.1 * timeMultiplier);
    }

    if (this.systems.hull < this.CRITICAL_THRESHOLD) {
      // Hull breaches drain oxygen faster
      this.systems.oxygen = Math.max(0, this.systems.oxygen - 0.15 * timeMultiplier);
    }
  }

  /**
   * Repair a specific system
   * @param system - System to repair
   * @param amount - Amount to repair (default 10)
   */
  public repair(system: keyof ShipSystems, amount: number = 10): boolean {
    if (!this.systems.hasOwnProperty(system)) {
      return false;
    }

    this.systems[system] = Math.min(100, this.systems[system] + amount);
    return true;
  }

  /**
   * Check for system alerts and warnings
   */
  private checkAlerts(): string[] {
    const alerts: string[] = [];

    Object.entries(this.systems).forEach(([system, value]) => {
      if (value <= 0) {
        alerts.push(`CRITICAL: ${system.toUpperCase()} FAILURE!`);
      } else if (value < this.CRITICAL_THRESHOLD) {
        alerts.push(`CRITICAL: ${system.toUpperCase()} at ${value.toFixed(1)}%`);
      } else if (value < this.DANGER_THRESHOLD) {
        alerts.push(`WARNING: ${system.toUpperCase()} at ${value.toFixed(1)}%`);
      }
    });

    return alerts;
  }

  /**
   * Get current ship systems state
   */
  public getSystems(): ShipSystems {
    return { ...this.systems };
  }

  /**
   * Get system status as formatted string
   */
  public getStatusReport(): string {
    const status = Object.entries(this.systems)
      .map(([system, value]) => {
        const bar = this.createBar(value);
        const color = this.getStatusColor(value);
        return `${system.toUpperCase().padEnd(8)}: ${bar} ${value.toFixed(1)}%`;
      })
      .join("\n");

    return status;
  }

  /**
   * Create a visual bar for system health
   */
  private createBar(value: number, length: number = 20): string {
    const filled = Math.floor((value / 100) * length);
    const empty = length - filled;
    return `[${"█".repeat(filled)}${" ".repeat(empty)}]`;
  }

  /**
   * Get status color indicator
   */
  private getStatusColor(value: number): "good" | "warning" | "critical" {
    if (value < this.CRITICAL_THRESHOLD) return "critical";
    if (value < this.DANGER_THRESHOLD) return "warning";
    return "good";
  }

  /**
   * Check if ship is in critical state (any system at 0)
   */
  public isCritical(): boolean {
    return Object.values(this.systems).some((value) => value <= 0);
  }

  /**
   * Get overall ship health percentage
   */
  public getOverallHealth(): number {
    const total = Object.values(this.systems).reduce((sum, val) => sum + val, 0);
    return total / Object.keys(this.systems).length;
  }
}
