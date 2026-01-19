/**
 * Time Dilatation Manager
 * Handles relativistic time as a player resource/mechanic
 * 
 * CONCEPT: Time is a finite resource. Players can speed up or slow down
 * subjective time to manage ship systems more efficiently, but this
 * drains their "subjective time" reserve.
 */

import { TimeDilatationState } from "@/types/game.types";

export class TimeDilatationManager {
  private state: TimeDilatationState;
  private readonly DECAY_RATE = 0.1; // Subjective time cost per tick at non-normal speed
  private readonly RECHARGE_RATE = 0.05; // Recharge at normal speed

  constructor(initialState?: Partial<TimeDilatationState>) {
    this.state = {
      subjectiveTime: initialState?.subjectiveTime ?? 100,
      timeScale: initialState?.timeScale ?? 1.0,
      maxSubjectiveTime: initialState?.maxSubjectiveTime ?? 100,
    };
  }

  /**
   * Update time dilatation state based on current time scale
   * @param deltaTime - Time elapsed since last tick
   */
  public tick(deltaTime: number = 1): void {
    if (this.state.timeScale !== 1.0) {
      // Drain subjective time when not at normal speed
      const drain = this.DECAY_RATE * Math.abs(this.state.timeScale - 1.0) * deltaTime;
      this.state.subjectiveTime = Math.max(0, this.state.subjectiveTime - drain);

      // Auto-revert to normal speed if depleted
      if (this.state.subjectiveTime <= 0) {
        this.state.timeScale = 1.0;
      }
    } else {
      // Recharge at normal speed
      this.state.subjectiveTime = Math.min(
        this.state.maxSubjectiveTime,
        this.state.subjectiveTime + this.RECHARGE_RATE * deltaTime
      );
    }
  }

  /**
   * Set the time scale (speed of gameplay)
   * @param scale - New time scale (0.5 = slow, 1.0 = normal, 2.0 = fast)
   */
  public setTimeScale(scale: number): boolean {
    // Validate scale
    if (scale < 0.5 || scale > 2.0) {
      return false;
    }

    // Check if we have enough subjective time for non-normal speeds
    if (scale !== 1.0 && this.state.subjectiveTime <= 0) {
      return false;
    }

    this.state.timeScale = scale;
    return true;
  }

  /**
   * Get current time dilatation state
   */
  public getState(): TimeDilatationState {
    return { ...this.state };
  }

  /**
   * Get the effective multiplier for resource consumption/production
   */
  public getEffectiveMultiplier(): number {
    return this.state.timeScale;
  }

  /**
   * Check if time manipulation is available
   */
  public canManipulateTime(): boolean {
    return this.state.subjectiveTime > 0;
  }

  /**
   * Get subjective time as a percentage
   */
  public getSubjectiveTimePercent(): number {
    return (this.state.subjectiveTime / this.state.maxSubjectiveTime) * 100;
  }
}
