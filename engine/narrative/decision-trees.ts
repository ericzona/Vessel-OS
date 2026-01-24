/**
 * Decision Trees - Quiet Depth Narrative System
 * Subtle thought experiments triggered by inspect commands
 * Silently tracks alignment through abstract questions
 */

import { BinaryChoice } from "@/types/game.types";

export interface DecisionNode {
  id: string;
  question: string;
  optionA: {
    text: string;
    lawChaos: number;
    goodEvil: number;
    nextNode?: string; // ID of next node
    reward?: string; // Description of unlock
  };
  optionB: {
    text: string;
    lawChaos: number;
    goodEvil: number;
    nextNode?: string;
    reward?: string;
  };
}

export interface DecisionTree {
  id: string;
  name: string;
  trigger: string; // Command that triggers this tree (e.g., "inspect console")
  rootNode: string; // Starting node ID
  nodes: Record<string, DecisionNode>;
}

/**
 * The Console Decision Tree
 * Triggered by: "inspect console" on bridge
 * Unlocks: Hidden sector coordinates
 */
export const ConsoleTree: DecisionTree = {
  id: "bridge-console",
  name: "The Captain's Legacy",
  trigger: "inspect console",
  rootNode: "console-01",
  nodes: {
    "console-01": {
      id: "console-01",
      question: `The console flickers. A corrupted log entry appears:

"TO THOSE WHO FOLLOW: The path forward is unclear. Do you
trust the algorithms that brought us here, or do you trust
your instincts in the void?"

What resonates with you?`,
      optionA: {
        text: "Trust the algorithms. Data over intuition.",
        lawChaos: 5,
        goodEvil: 0,
        nextNode: "console-02-law",
      },
      optionB: {
        text: "Trust your instincts. The void speaks to those who listen.",
        lawChaos: -5,
        goodEvil: 0,
        nextNode: "console-02-chaos",
      },
    },
    "console-02-law": {
      id: "console-02-law",
      question: `The console responds to your logic. A second entry unfolds:

"If you met a stranger in the void, would you share your
coordinates freely, or protect them until trust is earned?"`,
      optionA: {
        text: "Share freely. Openness builds community.",
        lawChaos: 0,
        goodEvil: 7,
        reward: "You've unlocked: HIDDEN SECTOR ALPHA coordinates.",
      },
      optionB: {
        text: "Protect them. Survival demands caution.",
        lawChaos: 3,
        goodEvil: -3,
        reward: "You've unlocked: HIDDEN SECTOR BETA coordinates.",
      },
    },
    "console-02-chaos": {
      id: "console-02-chaos",
      question: `The console pulses with energy. A vision appears:

"Would you rather be remembered as someone who followed
the rules perfectly, or someone who broke them to save a life?"`,
      optionA: {
        text: "Followed the rules. Order sustains civilizations.",
        lawChaos: 7,
        goodEvil: 0,
        reward: "You've unlocked: LEGACY PROTOCOLS access.",
      },
      optionB: {
        text: "Broke them to save. Compassion trumps law.",
        lawChaos: -5,
        goodEvil: 8,
        reward: "You've unlocked: MEDIC'S OVERRIDE codes.",
      },
    },
  },
};

/**
 * The Pod Decision Tree
 * Triggered by: "inspect pod" in cryo bay
 * Unlocks: Cryo bay secret compartment
 */
export const PodTree: DecisionTree = {
  id: "cryo-pod",
  name: "The Sleeper's Dilemma",
  trigger: "inspect pod",
  rootNode: "pod-01",
  nodes: {
    "pod-01": {
      id: "pod-01",
      question: `You notice a handwritten note taped to a damaged pod:

"If you wake me, I'll consume resources. If you let me sleep,
I may never wake. What defines a life worth saving?"`,
      optionA: {
        text: "Contribution to the collective.",
        lawChaos: 5,
        goodEvil: -3,
        nextNode: "pod-02-util",
      },
      optionB: {
        text: "Existence itself is sacred.",
        lawChaos: 0,
        goodEvil: 8,
        nextNode: "pod-02-sacred",
      },
    },
    "pod-02-util": {
      id: "pod-02-util",
      question: `The note continues on the back:

"Would you sacrifice one Pioneer to save ten, or refuse
to make the choice at all?"`,
      optionA: {
        text: "Sacrifice one. The math is clear.",
        lawChaos: 3,
        goodEvil: -5,
        reward: "You've unlocked: TACTICAL PROTOCOLS access.",
      },
      optionB: {
        text: "Refuse the choice. Some decisions corrupt the soul.",
        lawChaos: -3,
        goodEvil: 5,
        reward: "You've unlocked: CRYO SECRET COMPARTMENT.",
      },
    },
    "pod-02-sacred": {
      id: "pod-02-sacred",
      question: `The pod hums softly. A memory surfaces:

"In the void, is it lonelier to be awake and alone,
or asleep and dreaming of home?"`,
      optionA: {
        text: "Awake and alone. Reality, however harsh, is truth.",
        lawChaos: 0,
        goodEvil: -2,
        reward: "You've unlocked: VOID MEDITATION techniques.",
      },
      optionB: {
        text: "Asleep and dreaming. Hope sustains us.",
        lawChaos: 0,
        goodEvil: 6,
        reward: "You've unlocked: DREAM ARCHIVE access.",
      },
    },
  },
};

/**
 * All available decision trees
 */
export const DECISION_TREES: Record<string, DecisionTree> = {
  "bridge-console": ConsoleTree,
  "cryo-pod": PodTree,
};

/**
 * Get decision tree by trigger command
 */
export function getTreeByTrigger(trigger: string): DecisionTree | null {
  for (const tree of Object.values(DECISION_TREES)) {
    if (tree.trigger === trigger) {
      return tree;
    }
  }
  return null;
}

/**
 * Convert DecisionNode to BinaryChoice format for game state
 */
export function nodeToBinaryChoice(
  tree: DecisionTree,
  node: DecisionNode,
  location: any
): BinaryChoice {
  return {
    id: `${tree.id}-${node.id}`,
    frameText: node.question,
    optionA: {
      letter: "A" as const,
      text: node.optionA.text,
      alignmentImpact: {
        lawChaos: node.optionA.lawChaos,
        goodEvil: node.optionA.goodEvil,
      },
      resultText: node.optionA.reward || "The thought settles into your consciousness.",
    },
    optionB: {
      letter: "B" as const,
      text: node.optionB.text,
      alignmentImpact: {
        lawChaos: node.optionB.lawChaos,
        goodEvil: node.optionB.goodEvil,
      },
      resultText: node.optionB.reward || "The thought settles into your consciousness.",
    },
    location,
  };
}
