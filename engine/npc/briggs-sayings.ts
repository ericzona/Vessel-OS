/**
 * Briggs "The Void Prospector" - NPC Personality System
 * Tone: Han Solo meets Klondike Prospector
 * Gruff, suspicious, cynical, yet strangely charming and observant
 * 
 * NO pirate clichés. NO "Yarrr". NO Confucius wisdom.
 * Space Pirate Wisdom: Direct, practical, darkly humorous
 */

export interface BriggsSaying {
  text: string;
  category: "cynical" | "wisdom" | "humor" | "observation";
}

/**
 * Briggs' Sayings - Space Pirate Wisdom
 * 10 original sayings that feel authentic to a grizzled void prospector
 */
export const BRIGGS_SAYINGS: BriggsSaying[] = [
  {
    text: "The void doesn't have a conscience, kid. That's why I do.",
    category: "wisdom",
  },
  {
    text: "Trust is expensive out here. I'm on a budget.",
    category: "cynical",
  },
  {
    text: "People who talk about 'the journey' never had to mine asteroids for breakfast.",
    category: "humor",
  },
  {
    text: "You want answers? The universe doesn't give refunds on bad questions.",
    category: "observation",
  },
  {
    text: "I've seen empires fall over less $SCRAP than what's floating outside that viewport.",
    category: "wisdom",
  },
  {
    text: "Hope's a luxury. Paranoia's kept me alive longer.",
    category: "cynical",
  },
  {
    text: "The ship doesn't care if you're having an existential crisis. Neither do I.",
    category: "observation",
  },
  {
    text: "Out here, everyone's running from something. Question is: what are *you* running from?",
    category: "wisdom",
  },
  {
    text: "The Great Crash wasn't an accident. But nobody pays me to ask questions.",
    category: "cynical",
  },
  {
    text: "Pioneers don't get remembered for being nice. They get remembered for surviving.",
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
 * Briggs' Greeting - Context-aware based on game state
 */
export function getBriggsGreeting(gameState?: any): string {
  const greetings = [
    "Yeah? Make it quick. I got inventory to sort.",
    "Still breathing, Popsicle? Impressive.",
    "You need something, or are you just bored?",
    "Another Pioneer awake. Great. More mouths to feed.",
    "What now?",
    "Ship's holding together for once. Miracle or curse, I can't tell.",
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
- Ship systems fail. You repair them with subjective time.
- The void doesn't care about your feelings.

That's the basics. Figure out the rest yourself.`;
}

/**
 * Briggs' Response to specific inquiries
 */
export function getBriggsResponse(topic: string): string {
  const responses: Record<string, string> = {
    crash: "Asteroids came from nowhere. Right before Lootopian orbit. Too convenient, if you ask me. But nobody ever does.",
    void: "The void's patient. It'll wait for you to make a mistake. Always does.",
    pioneers: "2,847 frozen Pioneers. Most won't make it. You probably won't either. But you're here talking to me, so maybe you're stubborn enough.",
    ship: "This bucket of bolts held together through the crash. That's either luck or spite. I'm betting spite.",
    loot: "Lootopia's gone. Homeworld's a memory. All we got left are seeds and hope. I'm not big on hope.",
    captain: "Captain Vess didn't make it to the pods. Found them in the command chair, frozen solid. Left a message for the legacy holders. Touching, I guess.",
    scrap: "$SCRAP's the only currency that matters now. Trade it, hoard it, spend it. Just don't come crying when you run out.",
    default: "I don't know everything, kid. Just most things.",
  };
  
  return responses[topic.toLowerCase()] || responses.default;
}
