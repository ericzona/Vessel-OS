/**
 * Character Loot Types
 * Defines trait system for "Gerant the Scholar" style character generation
 */

export type Origin = "Lootopian" | "Martian" | "Earthborn" | "Void-Walker" | "Station-Born";
export type Profession = "Scholar" | "Technician" | "Pilot" | "Merchant" | "Soldier" | "Medic";
export type Obsession = "Knowledge" | "Wealth" | "Power" | "Freedom" | "Justice" | "Survival";
export type Talent = "Engineering" | "Navigation" | "Combat" | "Diplomacy" | "Medicine" | "Hacking";
export type Skill = "Repair" | "Mining" | "Trading" | "Leadership" | "Stealth" | "Analysis";
export type Alignment = "Lawful" | "Neutral" | "Chaotic";

/**
 * Character Loot Interface
 * Defines personality and skill traits that affect gameplay
 */
export interface CharacterLoot {
  origin: Origin;
  profession: Profession;
  obsession: Obsession;
  talent: Talent;
  skill: Skill;
  alignment: Alignment;
}

/**
 * Active Trait Effects
 * Modifies command efficiency based on character traits
 */
export interface ActiveTraitEffect {
  command: string; // Command name affected
  multiplier: number; // Efficiency multiplier (0.5 = 50% less effective, 1.5 = 50% more effective)
  description: string;
}

/**
 * Trait Modifiers
 * Maps traits to gameplay effects
 */
export const TRAIT_MODIFIERS: Record<string, ActiveTraitEffect[]> = {
  // Profession bonuses
  Scholar: [
    { command: "status", multiplier: 1.25, description: "+25% information detail" },
    { command: "look", multiplier: 1.25, description: "Enhanced environmental analysis" },
  ],
  Technician: [
    { command: "repair", multiplier: 1.3, description: "+30% repair efficiency" },
    { command: "status", multiplier: 1.15, description: "Better system diagnostics" },
  ],
  Pilot: [
    { command: "move", multiplier: 1.2, description: "-20% movement time cost" },
  ],
  Merchant: [
    { command: "mine", multiplier: 1.25, description: "+25% $SCRAP yield" },
  ],
  Soldier: [
    { command: "repair", multiplier: 1.15, description: "Field repair training" },
  ],
  Medic: [
    { command: "repair", multiplier: 1.2, description: "+20% life support repairs" },
  ],
  
  // Skill bonuses
  Repair: [
    { command: "repair", multiplier: 1.25, description: "+25% repair effectiveness" },
  ],
  Mining: [
    { command: "mine", multiplier: 1.3, description: "+30% mining yield" },
  ],
  Leadership: [
    { command: "talk", multiplier: 1.2, description: "Better NPC interactions" },
  ],
  Analysis: [
    { command: "status", multiplier: 1.3, description: "Deep system insights" },
    { command: "look", multiplier: 1.2, description: "Enhanced perception" },
  ],
};

/**
 * Generate random CharacterLoot
 */
export function generateCharacterLoot(): CharacterLoot {
  const origins: Origin[] = ["Lootopian", "Martian", "Earthborn", "Void-Walker", "Station-Born"];
  const professions: Profession[] = ["Scholar", "Technician", "Pilot", "Merchant", "Soldier", "Medic"];
  const obsessions: Obsession[] = ["Knowledge", "Wealth", "Power", "Freedom", "Justice", "Survival"];
  const talents: Talent[] = ["Engineering", "Navigation", "Combat", "Diplomacy", "Medicine", "Hacking"];
  const skills: Skill[] = ["Repair", "Mining", "Trading", "Leadership", "Stealth", "Analysis"];
  const alignments: Alignment[] = ["Lawful", "Neutral", "Chaotic"];
  
  const random = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  
  return {
    origin: random(origins),
    profession: random(professions),
    obsession: random(obsessions),
    talent: random(talents),
    skill: random(skills),
    alignment: random(alignments),
  };
}

/**
 * Get active trait effects for a character
 */
export function getActiveTraits(loot: CharacterLoot): ActiveTraitEffect[] {
  const effects: ActiveTraitEffect[] = [];
  
  // Add profession bonuses
  if (TRAIT_MODIFIERS[loot.profession]) {
    effects.push(...TRAIT_MODIFIERS[loot.profession]);
  }
  
  // Add skill bonuses
  if (TRAIT_MODIFIERS[loot.skill]) {
    effects.push(...TRAIT_MODIFIERS[loot.skill]);
  }
  
  return effects;
}

/**
 * Get trait multiplier for a specific command
 */
export function getTraitMultiplier(loot: CharacterLoot, command: string): number {
  const traits = getActiveTraits(loot);
  const effect = traits.find(t => t.command === command);
  return effect ? effect.multiplier : 1.0;
}

/**
 * Format CharacterLoot for display
 */
export function formatCharacterLoot(loot: CharacterLoot): string {
  return `
╔════════════════════════════════════════════════════════════╗
║                    CHARACTER LOOT                         ║
╚════════════════════════════════════════════════════════════╝

Origin: ${loot.origin}
Profession: ${loot.profession}
Obsession: ${loot.obsession}
Talent: ${loot.talent}
Skill: ${loot.skill}
Alignment: ${loot.alignment}

ACTIVE TRAIT EFFECTS:
${getActiveTraits(loot).map(t => `  • ${t.command}: ${t.description}`).join('\n') || '  • No active bonuses'}

[Traits affect command efficiency and NPC interactions]
  `.trim();
}
