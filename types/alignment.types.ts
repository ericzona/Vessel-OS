/**
 * 9-Point Alignment System
 * Identity Engine for The Great Transit
 * Tracks Pioneer moral choices across Law/Chaos and Good/Evil axes
 * Will eventually define NFT metadata
 */

export enum AlignmentAxis {
  LAWFUL = "lawful",
  NEUTRAL = "neutral",
  CHAOTIC = "chaotic",
}

export enum MoralAxis {
  GOOD = "good",
  NEUTRAL = "neutral",
  EVIL = "evil",
}

export type AlignmentType = 
  | "Lawful-Good"
  | "Lawful-Neutral" 
  | "Lawful-Evil"
  | "Neutral-Good"
  | "True-Neutral"
  | "Neutral-Evil"
  | "Chaotic-Good"
  | "Chaotic-Neutral"
  | "Chaotic-Evil";

export interface AlignmentScores {
  // Law vs Chaos axis (-100 to +100)
  // -100 = Pure Chaos, 0 = Neutral, +100 = Pure Law
  lawChaos: number;
  
  // Good vs Evil axis (-100 to +100)
  // -100 = Pure Evil, 0 = Neutral, +100 = Pure Good
  goodEvil: number;
}

export interface AlignmentState {
  scores: AlignmentScores;
  currentAlignment: AlignmentType;
  alignmentHistory: AlignmentShift[];
  questLog: QuestEntry[];
}

export interface AlignmentShift {
  timestamp: number;
  choice: string;
  lawChaosShift: number;
  goodEvilShift: number;
  previousAlignment: AlignmentType;
  newAlignment: AlignmentType;
}

export interface QuestEntry {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "failed";
  alignmentImpact?: string;
}

/**
 * Calculates alignment type from scores
 */
export function calculateAlignment(scores: AlignmentScores): AlignmentType {
  const { lawChaos, goodEvil } = scores;
  
  // Determine Law/Chaos axis
  let axisAlignment: AlignmentAxis;
  if (lawChaos > 30) {
    axisAlignment = AlignmentAxis.LAWFUL;
  } else if (lawChaos < -30) {
    axisAlignment = AlignmentAxis.CHAOTIC;
  } else {
    axisAlignment = AlignmentAxis.NEUTRAL;
  }
  
  // Determine Good/Evil axis
  let moralAlignment: MoralAxis;
  if (goodEvil > 30) {
    moralAlignment = MoralAxis.GOOD;
  } else if (goodEvil < -30) {
    moralAlignment = MoralAxis.EVIL;
  } else {
    moralAlignment = MoralAxis.NEUTRAL;
  }
  
  // Combine into alignment type
  if (axisAlignment === AlignmentAxis.NEUTRAL && moralAlignment === MoralAxis.NEUTRAL) {
    return "True-Neutral";
  }
  
  const alignmentString = `${axisAlignment.charAt(0).toUpperCase() + axisAlignment.slice(1)}-${moralAlignment.charAt(0).toUpperCase() + moralAlignment.slice(1)}`;
  return alignmentString as AlignmentType;
}

/**
 * Gets description for alignment type
 */
export function getAlignmentDescription(alignment: AlignmentType): string {
  const descriptions: Record<AlignmentType, string> = {
    "Lawful-Good": "The Paladin - You believe in order and compassion. Justice through structure.",
    "Lawful-Neutral": "The Judge - You follow rules without moral bias. Order is absolute.",
    "Lawful-Evil": "The Tyrant - You use law to dominate. Order through control.",
    "Neutral-Good": "The Benefactor - You help others pragmatically. Compassion without dogma.",
    "True-Neutral": "The Wanderer - You seek balance. Neither chaos nor order defines you.",
    "Neutral-Evil": "The Opportunist - You serve yourself. Morality is a tool for gain.",
    "Chaotic-Good": "The Rebel - You fight tyranny with freedom. Justice without chains.",
    "Chaotic-Neutral": "The Free Spirit - You follow whim and instinct. Freedom is everything.",
    "Chaotic-Evil": "The Destroyer - You thrive on mayhem. Chaos for its own sake.",
  };
  
  return descriptions[alignment];
}

/**
 * Creates initial alignment state (True Neutral)
 */
export function createInitialAlignmentState(): AlignmentState {
  return {
    scores: {
      lawChaos: 0,
      goodEvil: 0,
    },
    currentAlignment: "True-Neutral",
    alignmentHistory: [],
    questLog: [],
  };
}

/**
 * Applies choice impact to alignment scores
 */
export function applyAlignmentShift(
  state: AlignmentState,
  choice: string,
  lawChaosShift: number,
  goodEvilShift: number
): AlignmentState {
  const previousAlignment = state.currentAlignment;
  
  const newScores: AlignmentScores = {
    lawChaos: Math.max(-100, Math.min(100, state.scores.lawChaos + lawChaosShift)),
    goodEvil: Math.max(-100, Math.min(100, state.scores.goodEvil + goodEvilShift)),
  };
  
  const newAlignment = calculateAlignment(newScores);
  
  const shift: AlignmentShift = {
    timestamp: Date.now(),
    choice,
    lawChaosShift,
    goodEvilShift,
    previousAlignment,
    newAlignment,
  };
  
  return {
    ...state,
    scores: newScores,
    currentAlignment: newAlignment,
    alignmentHistory: [...state.alignmentHistory, shift],
  };
}
