/**
 * HIDDEN ACCOMPLISHMENTS SYSTEM
 * 
 * Tracks secret achievements that unlock rewards for players.
 * These are not displayed until earned, encouraging exploration and discovery.
 */

export interface Accomplishment {
  id: string;
  name: string;
  description: string;
  secretDescription: string; // Shown before unlock
  reward: AccomplishmentReward;
  progress: number;
  required: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface AccomplishmentReward {
  type: 'item' | 'credits' | 'scrap' | 'title';
  value: string | number;
  description: string;
}

export interface AccomplishmentState {
  accomplishments: Record<string, Accomplishment>;
  totalUnlocked: number;
}

/**
 * Initialize accomplishment tracking system
 */
export function createAccomplishmentState(): AccomplishmentState {
  return {
    accomplishments: {
      chattypioneer: {
        id: 'chattypioneer',
        name: 'The Chatty Pioneer',
        description: 'Had a conversation with Quartermaster Briggs 10 times.',
        secretDescription: '???  Hidden achievement - keep exploring!',
        reward: {
          type: 'item',
          value: 'pity-shirt',
          description: 'Pity Drop: Random shirt from the Pioneer wardrobe',
        },
        progress: 0,
        required: 10,
        unlocked: false,
      },
      // Future accomplishments can be added here
      // Example:
      // voidminer: {
      //   id: 'voidminer',
      //   name: 'Void Miner',
      //   description: 'Mined the void 50 times.',
      //   ...
      // },
    },
    totalUnlocked: 0,
  };
}

/**
 * Increment progress for a specific accomplishment
 * Returns true if the accomplishment was just unlocked
 */
export function incrementAccomplishment(
  state: AccomplishmentState,
  accomplishmentId: string
): { unlocked: boolean; accomplishment?: Accomplishment } {
  const accomplishment = state.accomplishments[accomplishmentId];
  
  if (!accomplishment || accomplishment.unlocked) {
    return { unlocked: false };
  }

  accomplishment.progress++;

  if (accomplishment.progress >= accomplishment.required) {
    accomplishment.unlocked = true;
    accomplishment.unlockedAt = new Date();
    state.totalUnlocked++;
    
    return { unlocked: true, accomplishment };
  }

  return { unlocked: false };
}

/**
 * Check if an accomplishment is unlocked
 */
export function isAccomplishmentUnlocked(
  state: AccomplishmentState,
  accomplishmentId: string
): boolean {
  return state.accomplishments[accomplishmentId]?.unlocked || false;
}

/**
 * Get progress for an accomplishment
 */
export function getAccomplishmentProgress(
  state: AccomplishmentState,
  accomplishmentId: string
): { progress: number; required: number; percentage: number } {
  const accomplishment = state.accomplishments[accomplishmentId];
  
  if (!accomplishment) {
    return { progress: 0, required: 0, percentage: 0 };
  }

  return {
    progress: accomplishment.progress,
    required: accomplishment.required,
    percentage: Math.min(100, (accomplishment.progress / accomplishment.required) * 100),
  };
}

/**
 * Get all unlocked accomplishments
 */
export function getUnlockedAccomplishments(
  state: AccomplishmentState
): Accomplishment[] {
  return Object.values(state.accomplishments).filter(a => a.unlocked);
}

/**
 * Get accomplishment unlock notification message
 */
export function getUnlockMessage(accomplishment: Accomplishment): string {
  return `
╔════════════════════════════════════════════════════════════╗
║             🏆 HIDDEN ACCOMPLISHMENT UNLOCKED! 🏆          ║
╚════════════════════════════════════════════════════════════╝

   "${accomplishment.name}"
   
   ${accomplishment.description}
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   REWARD: ${accomplishment.reward.description}
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Achievement logged to your Pioneer profile.
   Keep exploring for more hidden accomplishments!
  `;
}

/**
 * Grant the Chatty Pioneer reward (random shirt - symbolic for now)
 * In full implementation, this would add an actual item to player inventory
 */
export function grantChattyPioneerReward(): { success: boolean; item?: string; error?: string } {
  // For now, just return a symbolic reward
  // Future: Actually add item to inventory from /public/assets/pioneer/4-shirt/
  const rewardNames = [
    'Starfarer Tunic',
    'Void Walker Shirt',
    'Pioneer Jacket',
    'Cryo Survivor Vest',
    'Quartermaster\'s Gift'
  ];
  
  const randomItem = rewardNames[Math.floor(Math.random() * rewardNames.length)];
  
  return { success: true, item: randomItem };
}

/**
 * Save accomplishment state to localStorage (browser-side)
 */
export function saveAccomplishmentState(state: AccomplishmentState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accomplishments', JSON.stringify(state));
  }
}

/**
 * Load accomplishment state from localStorage (browser-side)
 */
export function loadAccomplishmentState(): AccomplishmentState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('accomplishments');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return null;
}
