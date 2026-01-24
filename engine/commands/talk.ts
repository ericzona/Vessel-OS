/**
 * TALK Command
 * Interact with NPCs on the ship
 * First NPC: Quartermaster Briggs (Cargo Hold) - The "Sayer of Sayings"
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { getRandomBriggsSaying, getBriggsGreeting } from "@/engine/npc/briggs-sayings";
import {
  createAccomplishmentState,
  incrementAccomplishment,
  getUnlockMessage,
  grantChattyPioneerReward,
} from "@/engine/hidden-accomplishments";

const QUARTERMASTER_DIALOGUES = {
  initial: `
╔════════════════════════════════════════════════════════════╗
║                     QUARTERMASTER BRIGGS                  ║
╚════════════════════════════════════════════════════════════╝

[A grizzled man in a stained jumpsuit looks up from his inventory tablet]

BRIGGS: "Well, well, well... Another cryo-princess finally decides to grace us with their presence. What's it been, fifty years? A hundred? Time gets funny when you're actually LIVING it instead of napping through it."

[He spits something into a cup that you hope is coffee]

"Name's Briggs. Quartermaster. Been awake this whole damn time keeping YOUR ship from turning into a floating coffin. While you lot were having sweet dreams about your 'New Galaxy Paradise,' I was here. Eating freeze-dried EVERYTHING. My taste buds committed suicide around year 30."

[He squints at your Pioneer badge]

"Pre-Crash stock, eh? One of the OG nappers. Fancy. You know what we call you sleepers? 'Popsicles.' You know what popsicles don't do? HELP WITH THE DAMN SHIP REPAIRS."

[He leans in conspiratorially]

"But I'll tell you something strange, Popsicle. About three cycles ago, we picked up a signal. Called it 'The Aether-Station Signal.' Coordinates don't match NOTHING in the star charts. Just... broadcasting out there. In the black. Some of the crew think it's a nav beacon. Others think it's a tomb. Me? I think it's Tuesday, because weird sh-- stuff happens on Tuesdays."

[He crosses his arms]

"Anyway, you want something from my hold, you better have $SCRAP. Or get good at repairs. Or both. This ain't the Lootopian welfare state anymore. Out here, you work or you float. And floating don't pay my salary."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BRIGGS' ODDBALL SAYINGS:
• "That's about as useful as a screen door on a spaceship."
• "You're dumber than a bag of hammers in zero-G."
• "I've seen smarter decisions from a malfunctioning vending machine."

[Type 'talk briggs' again to hear more of his charming personality]
  `,

  repeat: [
    `BRIGGS: "Back again? You must love punishment. Or my sparkling personality. It's the personality, isn't it? Don't answer that."

[He adjusts his tool belt]

"Let me tell you about Year 47. That's when the coffee machine broke. FORTY-SEVEN YEARS without real coffee. I had to drink this synthetic sludge that tasted like battery acid mixed with regret. You know what kept me sane? Spite. Pure, unfiltered spite for every single Popsicle dreaming of breakfast burritos while I'm here choking down nutrient paste."

"But hey, at least you're up now. Maybe you'll actually be useful. Or maybe you'll just break something. Usually it's the latter. Please don't touch anything."`,

    `BRIGGS: "You again? What, the void not entertaining enough for ya?"

[He gestures at his supplies]

"See this? This is 200 years worth of inventory management. Every bolt, every wire, every packet of that god-awful freeze-dried ice cream that tastes like sadness. I've cataloged it all. While awake. You know how many times I've reorganized this cargo hold out of sheer boredom? Forty-three. FORTY-THREE TIMES."

"And you want to know the kicker? The ship's AI could've done it automatically. But NOOO, someone—not naming names—disabled the cargo automation before we left. Said it was 'unreliable.' You know what's unreliable? HUMANS. Present company included."

"That Aether-Station Signal though... it's been getting stronger. Makes the hull hum sometimes. Gives me the creeps. But hey, what's one more creepy thing in the endless void, right?"`,

    `BRIGGS: "Oh good, my favorite Popsicle. Come to hear more of my delightful stories about existential dread and resource scarcity?"

[He picks up a wrench, examines it like it owes him money]

"You see this wrench? I've had this wrench longer than some marriages. We've been through THINGS together. Things a wrench shouldn't see. But it never complains. Unlike certain cryo-crew who wake up and immediately start whining about 'where's the coffee machine' and 'why does everything smell like feet.'"

"Pro tip: Everything smells like feet because we've been recycling the same air for a hundred and fifty years. It's called atmospheric conservation. Also called 'consequences.'"

"Word of advice from someone who's been awake this whole time: The ship talks to you if you listen. Not like crazy-person talking. More like... creaks in the right places. Hums at the wrong times. She's trying to tell us something. Probably 'clean your damn quarters,' but could be something about that Aether signal. Who knows."`,

    `BRIGGS: "Another visit? I'm starting to think you actually like my company. That's concerning. For both of us."

[He stretches, joints popping audibly]

"Fun fact: Do you know what happens to a human body after 150 years of shipboard life? Everything hurts. EVERYTHING. I sneeze and my spine sounds like bubble wrap. Doctor says I'm 'remarkably healthy for my age.' I'm 180 years old. I'm not healthy. I'm pickled in spite and coffee substitutes."

"But you know what keeps me going? Seeing you Popsicles wake up and realize we're STILL not there. We're not even close. This journey? It's multi-generational. Your grandkids' grandkids MIGHT see that new galaxy. Maybe. If we don't hit another asteroid field."

"The Aether-Station Signal? Yeah, it's still out there. Broadcasting. Waiting. Some of the Old-Worlders think we should investigate. Investigate! HA! With what fuel? What time? We're barely keeping the lights on as it is."

[He waves dismissively]

"Anyway, if you need supplies, you know where to find me. Spoiler: It's here. It's always here. This is my life now."`,
  ],

  goodbye: `BRIGGS: "Yeah, yeah, get outta here. Some of us have actual work to do. And by 'some of us,' I mean me. Always me."

[He mutters as he returns to his inventory]

"Damn Popsicles... probably gonna break something..."`,
};

let dialogueIndex = 0;

export const TalkCommand: Command = {
  name: "talk",
  aliases: ["speak", "chat", "converse", "t"], // Add 't' as shorthand
  description: "Talk to NPCs on the ship",
  usage: "talk [npc name]",
  category: CommandCategory.CREW,

  async execute(args: string[], context: CommandContext): Promise<CommandResult> {
    const { gameState } = context;

    if (args.length === 0) {
      return {
        success: false,
        message: "Usage: talk <npc>\n\nAvailable NPCs:\n• briggs - Quartermaster (Cargo Hold)\n\nShorthand: 't b' for 'talk briggs'\n\n[More NPCs coming soon...]",
      };
    }

    // Map shorthand to full names
    const npcInput = args[0].toLowerCase();
    const npcShorthand: Record<string, string> = {
      b: "briggs",
      briggs: "briggs",
      quartermaster: "briggs",
    };
    
    const npcName = npcShorthand[npcInput] || npcInput;

    // Quartermaster Briggs
    if (npcName === "briggs" || npcName === "quartermaster") {
      // Check if player is in cargo hold
      if (gameState.currentLocation !== "cargoHold") {
        return {
          success: false,
          message: "Quartermaster Briggs is not here.\n\nHe can be found in the Cargo Hold.\nUse 'move cargo-hold' to go there.",
        };
      }

      // Get player alignment
      const alignment = gameState.character.characterLoot.alignment;
      const hasRepairSkill = gameState.character.characterLoot.skill === "Repair";
      
      // First time? Show initial dialogue with alignment reaction
      if (dialogueIndex === 0) {
        dialogueIndex++;
        
        let alignmentReaction = "";
        if (alignment === "Lawful") {
          alignmentReaction = "\n\n[He eyes you approvingly]\n\n\"Hmm. You've got that 'by-the-book' look about you. Good. The last thing I need is another chaotic wildcard breaking my inventory system. You'll do fine, Popsicle.\"";
        } else if (alignment === "Chaotic") {
          alignmentReaction = "\n\n[He narrows his eyes]\n\n\"Great. Another chaos agent. I can smell the 'break first, ask questions never' energy on you. Listen up: You touch my cargo without permission, you're getting spaced. Clear?\"";
        } else {
          alignmentReaction = "\n\n[He shrugs]\n\n\"Neutral type, huh? Can't decide if that's smart or just indecisive. Either way, don't make waves and we'll get along fine.\"";
        }
        
        // Repair skill unlock
        let maintenanceHint = "";
        if (hasRepairSkill) {
          maintenanceHint = "\n\n[He notices your tool belt]\n\n\"Wait... you actually know how to fix things? Huh. Maybe you're not completely useless. Tell you what—type 'talk briggs maintenance' and I'll show you the REAL ship logs. The ones they don't put in the official reports.\"";
        }
        
        return {
          success: true,
          message: QUARTERMASTER_DIALOGUES.initial + alignmentReaction + maintenanceHint,
        };
      }
      
      // Hidden Maintenance Log for Repair skill holders
      if (args[1] && args[1].toLowerCase() === "maintenance" && hasRepairSkill) {
        const maintenanceLog = `╔════════════════════════════════════════════════════════════╗
║              QUARTERMASTER'S MAINTENANCE LOG              ║
╚════════════════════════════════════════════════════════════╝

[CLASSIFIED - CREW ONLY]

BRIGGS: "Alright, since you actually know which end of a wrench to hold, here's the real deal."

[He pulls up a battered tablet]

SHIP INCIDENT LOG - YEAR 147:

"The Aether-Station Signal... it's not random. It's a pattern. Repeats every 73 hours. I've been tracking it. Nobody else cares—they're all too busy with their 'survival' and 'not dying' nonsense."

"But here's the thing: Every time the signal peaks, our hull integrity drops by 0.3%. Consistently. Like something is... pulling at us. Or calling to us. I don't know which is worse."

"Power spikes in Section 7. Cryo-Bay temperature fluctuations. The ship AI keeps logging 'anomalous readings' but won't specify what. It's like she's... scared? Can AIs be scared?"

"Year 150: Found scratches inside the unused airlocks. FROM THE INSIDE. Nobody's been in those sections for decades. I sealed them. Didn't report it. What would I even say?"

[He closes the tablet]

"So yeah. That's why I drink synthetic whiskey that tastes like regret. Now get back to work before I regret telling you this."`;
        
        return {
          success: true,
          message: maintenanceLog,
        };
      }

      // Initialize accomplishment state if not exists
      if (!gameState.accomplishments) {
        gameState.accomplishments = createAccomplishmentState();
      }
      
      // Track Briggs conversations
      gameState.briggsConversations = (gameState.briggsConversations || 0) + 1;
      
      // Check for "Chatty Pioneer" accomplishment
      const accomplishmentResult = incrementAccomplishment(
        gameState.accomplishments,
        'chattypioneer'
      );
      
      // Subsequent visits: cycle through repeat dialogues + add a random Briggs saying
      const repeatDialogues = QUARTERMASTER_DIALOGUES.repeat;
      const currentDialogue = repeatDialogues[(dialogueIndex - 1) % repeatDialogues.length];
      dialogueIndex++;
      
      // Add a random saying from Briggs
      const saying = getRandomBriggsSaying();
      const sayingFooter = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💀 BRIGGS' WISDOM:\n"${saying.text}"`;
      
      let finalMessage = currentDialogue + sayingFooter;
      
      // If accomplishment was just unlocked, add the unlock message
      if (accomplishmentResult.unlocked && accomplishmentResult.accomplishment) {
        const unlockMsg = getUnlockMessage(accomplishmentResult.accomplishment);
        const rewardResult = grantChattyPioneerReward();
        
        if (rewardResult.success) {
          finalMessage += `\n\n${unlockMsg}\n\n[You received: ${rewardResult.item}]\n\nBRIGGS: "Wait... did you just get a notification? Ha! The ship AI must like you. That's rare. Real rare. Here, take this shirt from the lost & found. Least I can do for someone who actually listens to an old man ramble."`;
        } else {
          finalMessage += `\n\n${unlockMsg}`;
        }
      }
      
      return {
        success: true,
        message: finalMessage,
        updates: {
          briggsConversations: gameState.briggsConversations,
          accomplishments: gameState.accomplishments,
        },
      };
    }

    return {
      success: false,
      message: "Unknown NPC: \"" + npcName + "\"\n\nTry 'talk briggs' to speak with the Quartermaster.",
    };
  },
};
