"use client";

import { useState, useEffect, useRef } from "react";
import { TerminalMessage, MessageType, GameState } from "@/types/game.types";
import { ShipHeartbeat } from "@/engine/ship-heartbeat";
import { TimeDilatationManager } from "@/engine/time-dilatation";
import { CommandParser } from "@/engine/command-parser";
import { generatePioneerManifest } from "@/engine/pioneer-generator";
import { generateCharacterLoot } from "@/types/loot.types";

export default function Terminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [gameState, setGameState] = useState<GameState>({
    character: {
      name: "Pioneer",
      id: "pioneer-001",
      pioneerManifest: generatePioneerManifest("pioneer-001", 0), // Gen 0 = Pre-Crash OG
      characterLoot: generateCharacterLoot(), // Random traits "Gerant the Scholar" style
      lootManifest: [
        { id: "suit-01", name: "Tattered Flight Suit", description: "Standard issue Pioneer gear, worn from years in cryo", rarity: "common", category: "clothing" },
        { id: "badge-01", name: "Old-World PFP Badge", description: "A faded digital badge from Lootopia's golden age", rarity: "uncommon", category: "badge" },
      ],
      founderBadge: false, // Set to true for legacy holders
      pioneerNumber: 1,
      awakeningTime: Date.now(),
    },
    currentLocation: "cryoBay",
    ship: { power: 85, oxygen: 90, hull: 75, cryo: 95, scrap: 50 },
    timeDilatation: { subjectiveTime: 100, timeScale: 1.0, maxSubjectiveTime: 100 },
    inventory: { items: [], maxSlots: 10 },
    credits: 0, // Chip Credits (exchanged from $SOL)
    scrapBalance: 50, // Player's $SCRAP balance
    sovereignVaults: {
      treasury: 0,
      marketing: 0,
      builderRewards: 0,
      garbageCollector: 0,
    },
    compartmentOwnership: [
      { compartmentId: "cryoBay", ownerId: null, claimCost: 100, isLocked: false, vendingMachine: null },
      { compartmentId: "engineering", ownerId: null, claimCost: 150, isLocked: false, vendingMachine: null },
      { compartmentId: "bridge", ownerId: null, claimCost: 200, isLocked: false, vendingMachine: null },
      { compartmentId: "cargoHold", ownerId: null, claimCost: 125, isLocked: false, vendingMachine: null },
    ],
    gameTime: 0,
    isRunning: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAlertsRef = useRef<Set<string>>(new Set());
  
  // Initialize game engines
  const shipHeartbeat = useRef<ShipHeartbeat>(new ShipHeartbeat(gameState.ship));
  const timeDilatation = useRef<TimeDilatationManager>(new TimeDilatationManager(gameState.timeDilatation));
  const commandParser = useRef<CommandParser>(
    new CommandParser(shipHeartbeat.current, timeDilatation.current)
  );

  // Add message helper
  const addMessage = (text: string, type: MessageType = MessageType.SYSTEM) => {
    const newMessage: TerminalMessage = {
      id: Date.now().toString() + Math.random(),
      text,
      type,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Initialize game with welcome message
  useEffect(() => {
    const welcomeMessage = `
╔════════════════════════════════════════════════════════════╗
║           THE GREAT TRANSIT - SHIP SYSTEM v1.0           ║
╚════════════════════════════════════════════════════════════╝

INITIALIZATION COMPLETE.

You awaken from cryo-sleep aboard the Pioneer vessel.
The journey through the void continues...

System status: NOMINAL
Destination: GALAXY [COORDINATES LOCKED]

Type 'help' for available commands.
Type 'status' to check ship systems.
    `.trim();
    
    addMessage(welcomeMessage, MessageType.NARRATIVE);
    
    // Start the ship heartbeat
    shipHeartbeat.current.start((systems, alerts) => {
      setGameState((prev) => ({
        ...prev,
        ship: systems,
        gameTime: prev.gameTime + 1,
      }));
      
      // Display alerts only if they're new (prevent duplicate spam)
      const currentAlerts = new Set(alerts);
      alerts.forEach((alert) => {
        // Only add alert if it's not in the last batch of alerts
        if (!lastAlertsRef.current.has(alert)) {
          addMessage(alert, MessageType.WARNING);
        }
      });
      
      // Update the last alerts set
      lastAlertsRef.current = currentAlerts;
    });

    // Focus input
    inputRef.current?.focus();

    // Cleanup on unmount
    return () => {
      shipHeartbeat.current.stop();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add player command to messages
    addMessage(`> ${input}`, MessageType.PLAYER);
    
    // Add to history
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    // Parse and execute command
    const result = commandParser.current.parse(input, gameState);
    
    // Display result
    addMessage(result.message, result.success ? MessageType.SUCCESS : MessageType.ERROR);
    
    // Clear input
    setInput("");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  // Get message color class
  const getMessageColor = (type: MessageType): string => {
    switch (type) {
      case MessageType.SYSTEM:
        return "text-terminal-text";
      case MessageType.PLAYER:
        return "text-terminal-highlight";
      case MessageType.SUCCESS:
        return "text-terminal-text";
      case MessageType.ERROR:
        return "text-terminal-error";
      case MessageType.WARNING:
        return "text-terminal-warning";
      case MessageType.NARRATIVE:
        return "text-terminal-dim";
      default:
        return "text-terminal-text";
    }
  };

  return (
    <div className="w-full max-w-4xl h-[600px] bg-terminal-bg border-2 border-terminal-text rounded-lg shadow-2xl flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-terminal-text text-terminal-bg px-4 py-2 font-bold flex justify-between items-center">
        <span>PIONEER SHIP TERMINAL</span>
        <span className="text-sm">
          TIME: {gameState.gameTime}s | SCALE: {gameState.timeDilatation.timeScale}x
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`${getMessageColor(msg.type)} whitespace-pre-wrap`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t-2 border-terminal-text p-4">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-terminal-text font-bold mr-2">{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-terminal-text outline-none font-mono"
            placeholder="Enter command..."
            autoComplete="off"
            autoFocus
            style={{ caretColor: '#00ff00' }}
          />
        </form>
      </div>
    </div>
  );
}
