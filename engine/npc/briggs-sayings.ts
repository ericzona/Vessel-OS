/**
 * Briggs "The Void Prospector" - NPC Personality System
 * Tone: Han Solo meets Klondike Prospector (TV-MA)
 * Gruff, stir-crazy, cynical, unfiltered
 * 
 * TERMINOLOGY:
 * - "Statues" = Frozen crew still in cryo
 * - "Resonants" = Awoken players (living glitches who vibrate with the ship)
 * - "Aether-Leaf" = Stimulant he chews and spits
 * 
 * THEORY: The ship hums. Resonants couldn't stop vibrating, so they woke up.
 */

export interface BriggsSaying {
  text: string;
  category: "cynical" | "wisdom" | "humor" | "observation" | "resonant";
}

/**
 * Briggs' Sayings - Unfiltered Space Wisdom (TV-MA)
 */
export const BRIGGS_SAYINGS: BriggsSaying[] = [
  {
    text: "The void doesn't give a shit about your feelings, kid. That's why I stopped having them.",
    category: "wisdom",
  },
  {
    text: "Trust is expensive out here. And I'm broke as hell.",
    category: "cynical",
  },
  {
    text: "Every 'Statue' in cryo is dreaming of paradise. You woke up. That makes you either lucky or cursed. Haven't decided yet.",
    category: "resonant",
  },
  {
    text: "The ship hums. Always has. You're just the first one who couldn't stop vibrating long enough to stay asleep. You're a Resonant—a living glitch in the void.",
    category: "resonant",
  },
  {
    text: "I've been awake 150 years. You know what that does to a man? Makes him real good at being pissed off.",
    category: "observation",
  },
  {
    text: "Aether-Leaf keeps me sharp. Or insane. Hard to tell the difference anymore.",
    category: "humor",
  },
  {
    text: "Hope's for Statues. Resonants work with what's real.",
    category: "wisdom",
  },
  {
    text: "The Great Crash wasn't an accident. Something pulled us out of orbit. But nobody wants to hear that shit.",
    category: "cynical",
  },
  {
    text: "You want answers? The universe doesn't give refunds on bad questions, kid.",
    category: "observation",
  },
  {
    text: "Pioneers don't get remembered for being nice. They get remembered for not dying.",
    category: "wisdom",
  },
];

/**
 * Get a random Briggs saying
 */
export function getRandomBriggsSaying(): BriggsSaying {
  return BRIGGS_SAYINGS[Math.floor(Math.random() * BRIGGS_SAYINGS.length)];
}

/**
 * Briggs' Greeting - Context-aware with Resonant terminology
 */
export function getBriggsGreeting(gameState?: any): string {
  const greetings = [
    "Yeah? Make it quick. Got inventory to sort and Aether-Leaf to chew.",
    "Still breathing, Resonant? Impressive. Most don't last a week.",
    "Another vibrating glitch in human form. What do you want?",
    "You need something, or are you just bored of listening to the ship hum?",
    "What now? And don't tell me another Statue woke up. My sanity can't take it.",
    "Ship's holding together. That's more than I can say for my patience.",
    "Stop walking around naked. Go find some rags in The Dressing Room before I have to look at you.",
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Briggs' Response to 'help' or general inquiry
 */
export function getBriggsHelpResponse(): string {
  return `Look, I'm a Quartermaster, not a tour guide. 

What you need to know:
- There's $SCRAP floating in the void. You mine it, I track it.
- Ship systems fail. You fix them with subjective time or you die.
- The void doesn't care about your feelings. Neither do I.

That's the basics. Figure out the rest yourself, Resonant.`;
}

/**
 * Briggs' Response to specific inquiries (TV-MA unfiltered)
 */
export function getBriggsResponse(topic: string): string {
  const responses: Record<string, string> = {
    crash: "Asteroids came from nowhere. Right before we left orbit. Too damn convenient. Something PULLED us. But command doesn't want to hear conspiracy shit from a guy who chews leaves.",
    
    void: "The void's patient. It'll wait for you to make a mistake. And you will. They all do.",
    
    resonant: "You're a Resonant. A living glitch. The ship hums at a frequency, and you? You couldn't stop vibrating. That's why you woke up while the Statues keep dreaming. The ship CHOSE you. Or broke you. Haven't figured out which yet.",
    
    statues: "2,847 frozen Pioneers. Most will never wake. They're Statues now—pretty, useless, dreaming of a paradise they'll never see. You? You're awake. That makes you special. Or cursed.",
    
    pioneers: "We used to call everyone 'Pioneers.' Now I call them Statues or Resonants. You can guess which one you are.",
    
    ship: "This bucket of bolts vibrates. Always has. Like it's alive. Or possessed. The Statues can't feel it. But Resonants? You feel it in your bones. That's why you couldn't stay asleep.",
    
    aether: "Aether-Leaf. Grows in hydroponics. Tastes like shit. Keeps me awake and perceptive. Or maybe just crazy enough to function. Want some? Didn't think so. More for me.",
    
    captain: "Captain Vess didn't make it to the pods. Found them frozen in the command chair. They left a message for legacy holders. Touching. Also pointless. Dead's dead.",
    
    scrap: "$SCRAP's the only currency that matters now. Mine it, trade it, hoard it. Just don't come crying when you run out and I tell you to get back in your pod, Statue.",
    
    loot: "Lootopia's gone. Homeworld's a memory. All we got left are seeds, hope, and a bunch of Statues who think we're going to rebuild paradise. I'm not big on hope. Or paradise.",
    
    default: "I don't know everything, kid. Just most things. And the things I don't know? Usually better left alone.",
  };
  
  return responses[topic.toLowerCase()] || responses.default;
}

/**
 * Briggs' Aether-Leaf Habits (Flavor Text)
 */
export function getBriggsAetherAction(): string {
  const actions = [
    "[He chews something green and spits into a cup]",
    "[He pulls out a wad of Aether-Leaf and offers you some. You decline]",
    "[The smell of Aether-Leaf hangs in the air. Pungent. Chemical. Wrong]",
    "[He spits Aether-Leaf juice. It hisses when it hits the floor]",
  ];
  
  return actions[Math.floor(Math.random() * actions.length)];
}
