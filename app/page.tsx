"use client";

import { useState, useEffect } from "react";
import Terminal from "@/components/Terminal";
import { GameState, CompartmentId } from "@/types/game.types";
import { generatePioneerManifest } from "@/engine/pioneer-generator";
import { generateCharacterLoot } from "@/types/loot.types";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // Initialize game state on client side
    const pioneerManifest = generatePioneerManifest("pioneer-001", 0);
    const characterLoot = generateCharacterLoot();
    
    const initialState: GameState = {
      character: {
        name: "Pioneer",
        id: "pioneer-001",
        pioneerManifest,
        characterLoot,
        lootManifest: [],
        founderBadge: true, // Set to true for testing founder features
        pioneerNumber: 1,
        awakeningTime: Date.now(),
      },
      currentLocation: "cryoBay" as CompartmentId,
      ship: {
        power: 75,
        oxygen: 80,
        hull: 60,
        cryo: 90,
        scrap: 10,
      },
      timeDilatation: {
        subjectiveTime: 100,
        timeScale: 1.0,
        maxSubjectiveTime: 100,
      },
      inventory: {
        items: [],
        maxSlots: 10,
      },
      credits: 0,
      scrapBalance: 10,
      sovereignVaults: {
        treasury: 0,
        marketing: 0,
        builderRewards: 0,
        garbageCollector: 0,
      },
      compartmentOwnership: [],
      gameTime: 0,
      isRunning: true,
      briggsConversations: 0,
    };

    setGameState(initialState);
  }, []);

  if (!gameState) {
    return (
      <main className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-terminal-text font-mono">
          Initializing...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Terminal 
        gameState={gameState} 
        onGameStateUpdate={setGameState}
      />
    </main>
  );
}
