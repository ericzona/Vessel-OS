"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { GameState, CommandResult, BinaryChoice } from "@/types/game.types";
import { CommandParser } from "@/engine/command-parser";
import { ShipHeartbeat } from "@/engine/ship-heartbeat";
import { TimeDilatationManager } from "@/engine/time-dilatation";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";
import { getAlignmentDescription } from "@/types/alignment.types";
import { applyAlignmentShift } from "@/types/alignment.types";
import PioneerHUD from "./PioneerHUD";
import TypewriterText, { TypewriterHandle } from "./TypewriterText";
import MoralCompass from "./MoralCompass";

interface TerminalProps {
  gameState: GameState;
  onGameStateUpdate: (newState: GameState) => void;
}

interface QueuedMessage {
  id: number;
  text: string;
  timestamp: Date;
  isNarrative: boolean; // true = typewriter, false = instant
}

export default function Terminal({ gameState, onGameStateUpdate }: TerminalProps) {
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<QueuedMessage[]>([]);
  const [currentTypingMessage, setCurrentTypingMessage] = useState<QueuedMessage | null>(null);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAlignmentModal, setShowAlignmentModal] = useState(false);
  const [showBinaryChoice, setShowBinaryChoice] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<TypewriterHandle>(null);
  const messageIdCounter = useRef(0);
  const hasShownWelcome = useRef(false);
  
  // Initialize command parser with dependencies
  const shipHeartbeat = useRef(new ShipHeartbeat(gameState.ship));
  const timeDilatation = useRef(new TimeDilatationManager(gameState.timeDilatation));
  const commandParser = useRef(new CommandParser(shipHeartbeat.current, timeDilatation.current));

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages, currentTypingMessage]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Welcome message on first load (only once)
  useEffect(() => {
    if (!hasShownWelcome.current) {
      hasShownWelcome.current = true;
      addMessage(getWelcomeMessage(), true); // Narrative typewriter
    }
  }, []);

  // Process message queue (one at a time with typewriter)
  useEffect(() => {
    if (!currentTypingMessage && messageQueue.length > 0) {
      const nextMessage = messageQueue[0];
      setMessageQueue(prev => prev.slice(1));
      
      if (nextMessage.isNarrative) {
        // Show with typewriter effect
        setCurrentTypingMessage(nextMessage);
      } else {
        // Instant display (for commands and system messages)
        setDisplayedMessages(prev => [...prev, nextMessage]);
      }
    }
  }, [messageQueue, currentTypingMessage]);

  // Global keyboard shortcuts - CRITICAL: Window-level capture
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Check if we're typing in input field
      const isTypingInInput = document.activeElement?.tagName === 'INPUT';
      
      // [S] - Skip typewriter (HIGHEST PRIORITY)
      if ((e.key === 's' || e.key === 'S') && currentTypingMessage && !isTypingInInput) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('🔴 S KEY CAPTURED - Skipping typewriter');
        setDisplayedMessages(prev => [...prev, currentTypingMessage]);
        setCurrentTypingMessage(null);
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      
      // [I] - Toggle inventory modal (no terminal text)
      if ((e.key === 'i' || e.key === 'I') && !isTypingInInput && !gameState.pendingChoice) {
        e.preventDefault();
        console.log('🔴 I KEY CAPTURED - Opening Inventory Modal');
        setShowInventoryModal(prev => !prev);
        return;
      }
      
      // [P] - Toggle profile modal (no terminal text)
      if ((e.key === 'p' || e.key === 'P') && !isTypingInInput) {
        e.preventDefault();
        console.log('🔴 P KEY CAPTURED - Opening Profile Modal');
        setShowProfileModal(prev => !prev);
        return;
      }
      
      // [A] - Toggle alignment modal OR select choice A
      if ((e.key === 'a' || e.key === 'A') && !isTypingInInput) {
        e.preventDefault();
        if (gameState.pendingChoice) {
          console.log('🔴 A KEY CAPTURED - Selecting Choice A');
          handleBinaryChoice('A');
        } else {
          console.log('🔴 A KEY CAPTURED - Opening Alignment Modal');
          setShowAlignmentModal(prev => !prev);
        }
        return;
      }
      
      // [B] - Binary choice selection
      if ((e.key === 'b' || e.key === 'B') && !isTypingInInput && gameState.pendingChoice) {
        e.preventDefault();
        console.log('🔴 B KEY CAPTURED - Selecting Choice B');
        handleBinaryChoice('B');
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [gameState.pendingChoice, currentTypingMessage, showProfileModal, showInventoryModal, showAlignmentModal]);

  const addMessage = (text: string, isNarrative: boolean = false) => {
    const newMessage: QueuedMessage = {
      id: messageIdCounter.current++,
      text,
      timestamp: new Date(),
      isNarrative,
    };
    setMessageQueue(prev => [...prev, newMessage]);
  };

  const handleTypewriterComplete = () => {
    if (currentTypingMessage) {
      setDisplayedMessages(prev => [...prev, currentTypingMessage]);
      setCurrentTypingMessage(null);
    }
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // If typing animation is active, CANCEL it immediately
    if (currentTypingMessage) {
      setDisplayedMessages(prev => [...prev, currentTypingMessage]);
      setCurrentTypingMessage(null);
    }

    // Block commands if binary choice is pending
    if (gameState.pendingChoice) {
      addMessage("⚠️  You must choose [A] or [B] before continuing.", false);
      return;
    }

    // Add command to history
    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Echo command (instant)
    addMessage(`> ${trimmedCmd}`, false);

    // Parse and execute using CommandParser
    const result: CommandResult = await commandParser.current.parse(trimmedCmd, gameState);

    // Update game state if command returns updates
    if (result.updates) {
      const newState = { ...gameState, ...result.updates };
      onGameStateUpdate(newState);
    }

    // Handle binary choice presentation
    if (result.binaryChoice) {
      onGameStateUpdate({ ...gameState, pendingChoice: result.binaryChoice });
      setShowBinaryChoice(true);
    }

    // Display result
    if (result.message) {
      // Narrative messages use typewriter, system messages are instant
      const isNarrative = result.message.includes("You stand in") || 
                         result.message.includes("NAVIGATION IN PROGRESS") ||
                         result.message.includes("Welcome, Pioneer") ||
                         result.message.includes("Quartermaster Briggs") ||
                         result.message.includes("says,") ||
                         result.message.includes("The walls") ||
                         result.message.includes("step through") ||
                         trimmedCmd.startsWith("look") ||
                         trimmedCmd.startsWith("l ") ||
                         trimmedCmd.startsWith("talk") ||
                         trimmedCmd.startsWith("quarters") ||
                         trimmedCmd.startsWith("q");
      addMessage(result.message, isNarrative);
    }

    // Clear input
    setInput("");
  };

  const handleBinaryChoice = (choice: "A" | "B") => {
    if (!gameState.pendingChoice) return;

    const selectedOption = choice === "A" 
      ? gameState.pendingChoice.optionA 
      : gameState.pendingChoice.optionB;

    // Apply alignment shift
    const newAlignment = applyAlignmentShift(
      gameState.alignment,
      selectedOption.text,
      selectedOption.alignmentImpact.lawChaos,
      selectedOption.alignmentImpact.goodEvil
    );

    // Show result
    addMessage(`\n[CHOICE ${choice}] ${selectedOption.text}`, false);
    addMessage(selectedOption.resultText, true);

    // Check if alignment changed
    if (newAlignment.currentAlignment !== gameState.alignment.currentAlignment) {
      addMessage(`\n🔄 ALIGNMENT SHIFT: ${gameState.alignment.currentAlignment} → ${newAlignment.currentAlignment}`, false);
      addMessage(getAlignmentDescription(newAlignment.currentAlignment), true);
    }

    // Handle Loot Locker choice - add items to inventory
    let updatedInventory = gameState.inventory;
    if (gameState.pendingChoice.id === "loot-locker-awakening") {
      if (choice === "A") {
        // SALVAGE RAGS - Add 3 basic items
        updatedInventory = {
          ...gameState.inventory,
          items: [
            ...gameState.inventory.items,
            { id: "10-necklace", name: "Basic Necklace", type: "MATERIAL" as any, quantity: 1, description: "For identification" },
            { id: "4-shirt", name: "Utility Shirt", type: "MATERIAL" as any, quantity: 1, description: "Stained but functional" },
            { id: "5-pants", name: "Basic Pants", type: "MATERIAL" as any, quantity: 1, description: "Reinforced at the knees" },
          ],
        };
      } else {
        // DIG DEEPER - Add Aether-Leaf
        updatedInventory = {
          ...gameState.inventory,
          items: [
            ...gameState.inventory.items,
            { id: "aether-leaf", name: "Aether-Leaf", type: "MATERIAL" as any, quantity: 1, description: "Bioluminescent botanical sample. Origin unknown." },
          ],
        };
      }
    }

    // Update game state
    onGameStateUpdate({
      ...gameState,
      alignment: newAlignment,
      inventory: updatedInventory,
      pendingChoice: undefined,
    });

    setShowBinaryChoice(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 1. HIGHEST PRIORITY: Skip typewriter with 's' key
    if (currentTypingMessage && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔴 INPUT-LEVEL S KEY - Skipping typewriter');
      setDisplayedMessages(prev => [...prev, currentTypingMessage]);
      setCurrentTypingMessage(null);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    // 2. MODAL HOTKEYS: Only if input is empty (to allow typing commands)
    if (input === "") {
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        console.log('🔴 INPUT-LEVEL I KEY - Opening Inventory Modal');
        setShowInventoryModal(true);
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        console.log('🔴 INPUT-LEVEL A KEY - Opening Alignment Modal');
        setShowAlignmentModal(true);
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        console.log('🔴 INPUT-LEVEL P KEY - Opening Profile Modal');
        setShowProfileModal(true);
        return;
      }
    }
    
    // 3. Standard input handling
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (newIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  // Global click listener - always return focus to input when not typing
  useEffect(() => {
    const handleDocumentClick = () => {
      if (!currentTypingMessage && inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [currentTypingMessage]);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-hidden bg-terminal-bg text-terminal-text font-mono">
      {/* Header with Pioneer Profile */}
      <div className="flex items-center justify-between p-4 border-b-2 border-terminal-text w-full max-w-full overflow-hidden">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-['Press_Start_2P'] text-terminal-bright text-center flex-1 w-full px-2 break-words">
          THE GREAT TRANSIT
        </h1>
        
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowProfileModal(true)}
          title="Click or press [P] to view profile"
        >
          <PioneerHUD manifest={gameState.character.pioneerManifest} size={80} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Displayed (completed) messages */}
        {displayedMessages.map((msg) => (
          <div 
            key={msg.id} 
            className="whitespace-pre-wrap break-words"
            style={{ fontFamily: 'monospace' }}
          >
            {msg.text}
          </div>
        ))}
        
        {/* Currently typing message */}
        {currentTypingMessage && (
          <TypewriterText
            ref={typewriterRef}
            text={currentTypingMessage.text}
            speed={25}
            onComplete={handleTypewriterComplete}
            className="whitespace-pre-wrap break-words"
          />
        )}
        
        {/* Binary Choice Display - Subtle */}
        {gameState.pendingChoice && showBinaryChoice && (
          <div className="mt-4 mb-2">
            <div className="mb-2 text-terminal-dim text-sm">
              <span className="text-terminal-bright">[A]</span> {gameState.pendingChoice.optionA.text} | <span className="text-terminal-bright">[B]</span> {gameState.pendingChoice.optionB.text}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Static Interaction Bar - Mobile Friendly */}
      {currentTypingMessage && (
        <div className="border-t-2 border-terminal-bright bg-black p-2 px-4 flex gap-2 w-full">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Skip and immediately clear typing state
              if (currentTypingMessage) {
                setDisplayedMessages(prev => [...prev, currentTypingMessage]);
                setCurrentTypingMessage(null);
              }
              // Force focus
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="flex-1 border-2 border-terminal-bright text-terminal-bright hover:bg-terminal-bright hover:text-terminal-bg focus:outline-none transition-colors py-3 px-4 font-bold text-base sm:text-lg animate-pulse"
          >
            [S] SKIP
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Complete current and move to next
              if (currentTypingMessage) {
                setDisplayedMessages(prev => [...prev, currentTypingMessage]);
                setCurrentTypingMessage(null);
              }
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="flex-1 border-2 border-terminal-text text-terminal-text hover:bg-terminal-text hover:text-terminal-bg focus:outline-none transition-colors py-3 px-4 font-bold text-base sm:text-lg"
          >
            [N] NEXT
          </button>
        </div>
      )}

      {/* Action Bar - State-Swap: Normal or Choice Buttons */}
      <div className="border-t-2 border-terminal-dim bg-black p-2 px-4">
        {gameState.pendingChoice ? (
          /* CHOICE MODE: Show A/B buttons */
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={() => handleBinaryChoice('A')}
              className="flex-1 border-2 border-terminal-bright text-terminal-bright hover:bg-terminal-bright hover:text-black transition-colors h-11 px-3 text-sm font-bold animate-pulse"
            >
              [A] {gameState.pendingChoice.optionA.text.toUpperCase()}
            </button>
            <button
              onClick={() => handleBinaryChoice('B')}
              className="flex-1 border-2 border-terminal-text text-terminal-text hover:bg-terminal-text hover:text-black transition-colors h-11 px-3 text-sm font-bold animate-pulse"
            >
              [B] {gameState.pendingChoice.optionB.text.toUpperCase()}
            </button>
          </div>
        ) : (
          /* NORMAL MODE: Show I/P/A buttons */
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={() => setShowInventoryModal(true)}
              className="flex-1 border border-terminal-text text-terminal-text hover:bg-terminal-text hover:text-black transition-colors h-11 px-3 text-sm font-bold"
            >
              [I] INVENTORY
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex-1 border border-terminal-bright text-terminal-bright hover:bg-terminal-bright hover:text-black transition-colors h-11 px-3 text-sm font-bold"
            >
              [P] PROFILE
            </button>
            <button
              onClick={() => setShowAlignmentModal(true)}
              className="flex-1 border border-terminal-text text-terminal-text hover:bg-terminal-text hover:text-black transition-colors h-11 px-3 text-sm font-bold"
            >
              [A] ALIGNMENT
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-terminal-text">
        <div className="flex items-center gap-2">
          <span className="text-terminal-bright font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-terminal-text font-mono"
            placeholder="Type 'help' for commands..."
            autoComplete="off"
            spellCheck={false}
            disabled={false}
          />
        </div>
        {gameState.pendingChoice && !currentTypingMessage && (
          <div className="text-terminal-dim text-xs mt-2">
            ⚠️  Choice pending - select [A] or [B] first
          </div>
        )}
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowInventoryModal(false)}
        >
          <div 
            className="bg-terminal-bg border-4 border-terminal-text p-8 max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-['Press_Start_2P'] text-terminal-bright">
                INVENTORY
              </h2>
              <button 
                onClick={() => setShowInventoryModal(false)}
                className="text-terminal-dim hover:text-terminal-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-terminal-dim">
                Capacity: {gameState.inventory.items.length} / {gameState.inventory.maxSlots}
              </div>

              {/* Inventory Grid - 4x5 (20 slots) */}
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: gameState.inventory.maxSlots }).map((_, index) => {
                  const item = gameState.inventory.items[index];
                  return (
                    <div
                      key={index}
                      className={`
                        border-2 h-20 flex items-center justify-center
                        ${item 
                          ? 'border-terminal-text bg-terminal-dim bg-opacity-10' 
                          : 'border-terminal-dim border-dashed'
                        }
                      `}
                    >
                      {item ? (
                        <div className="text-center p-2">
                          <div className="text-xs text-terminal-bright font-bold truncate">
                            {item.name}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-terminal-dim">
                              x{item.quantity}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-terminal-dim text-xs">—</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-terminal-dim text-center mt-4">
                Press [I] or click anywhere to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Modal */}
      {showAlignmentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowAlignmentModal(false)}
        >
          <div 
            className="bg-terminal-bg border-4 border-terminal-bright p-8 max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-['Press_Start_2P'] text-terminal-bright">
                ALIGNMENT & QUEST LOG
              </h2>
              <button 
                onClick={() => setShowAlignmentModal(false)}
                className="text-terminal-dim hover:text-terminal-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Alignment */}
              <div className="border-2 border-terminal-bright p-4">
                <h3 className="text-terminal-bright mb-2 font-bold">⚖️ CURRENT ALIGNMENT</h3>
                <div className="text-2xl text-center text-terminal-bright mb-2">
                  {gameState.alignment.currentAlignment}
                </div>
                <div className="text-xs text-terminal-dim text-center italic">
                  {getAlignmentDescription(gameState.alignment.currentAlignment)}
                </div>
              </div>

              {/* Moral Compass Visual */}
              <div className="border-2 border-terminal-text p-4">
                <h3 className="text-terminal-bright mb-3 font-bold">9-POINT SPECTRUM</h3>
                <div className="flex justify-center">
                  <MoralCompass scores={gameState.alignment.scores} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-terminal-dim">Law/Chaos:</span>
                    <span className="text-terminal-bright ml-2">{gameState.alignment.scores.lawChaos}</span>
                  </div>
                  <div>
                    <span className="text-terminal-dim">Good/Evil:</span>
                    <span className="text-terminal-bright ml-2">{gameState.alignment.scores.goodEvil}</span>
                  </div>
                </div>
              </div>

              {/* Quest Log */}
              <div className="border-2 border-terminal-text p-4">
                <h3 className="text-terminal-bright mb-3 font-bold">📜 QUEST LOG</h3>
                {gameState.alignment.questLog.length > 0 ? (
                  <div className="space-y-2">
                    {gameState.alignment.questLog.map((quest, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-terminal-bright">• {quest.name}</span>
                        <span className="text-terminal-dim ml-2">[{quest.status.toUpperCase()}]</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-terminal-dim italic">No active quests</div>
                )}
              </div>

              {/* Recent Choices */}
              <div className="border-2 border-terminal-text p-4">
                <h3 className="text-terminal-bright mb-3 font-bold">🔄 RECENT CHOICES</h3>
                {gameState.alignment.alignmentHistory.length > 0 ? (
                  <div className="space-y-1 text-xs">
                    {gameState.alignment.alignmentHistory.slice(-5).reverse().map((shift, i) => (
                      <div key={i} className="text-terminal-dim">
                        {i + 1}. {shift.choice}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-terminal-dim italic">No choices made yet</div>
                )}
                <div className="mt-3 text-xs text-terminal-dim">
                  Total Choices: {gameState.alignment.alignmentHistory.length}
                </div>
              </div>

              <div className="text-xs text-terminal-dim text-center mt-4">
                Press [A] or click anywhere to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pioneer Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-terminal-bg border-4 border-terminal-text p-8 max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-['Press_Start_2P'] text-terminal-bright">
                PIONEER MANIFEST
              </h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-terminal-dim hover:text-terminal-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-8">
              {/* 10x Enlarged Pioneer */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <PioneerHUD manifest={gameState.character.pioneerManifest} size={400} />
              </div>

              {/* Stats & Info */}
              <div className="flex-1 space-y-4">
                {/* Core Stats */}
                <div className="border-2 border-terminal-text p-4">
                  <h3 className="text-terminal-bright mb-3 font-bold">CORE STATS</h3>
                  <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                    <StatDisplay 
                      label="STR" 
                      value={gameState.character.pioneerManifest.stats.str} 
                      tooltip="Strength - Affects combat and mining"
                    />
                    <StatDisplay 
                      label="VIT" 
                      value={gameState.character.pioneerManifest.stats.vit} 
                      tooltip="Vitality - Affects health and survival"
                    />
                    <StatDisplay 
                      label="AGI" 
                      value={gameState.character.pioneerManifest.stats.agi} 
                      tooltip="Agility - Affects movement and evasion"
                    />
                    <StatDisplay 
                      label="INT" 
                      value={gameState.character.pioneerManifest.stats.int} 
                      tooltip="Intelligence - Affects research and problem-solving"
                    />
                    <StatDisplay 
                      label="LCK" 
                      value={gameState.character.pioneerManifest.stats.lck} 
                      tooltip="Luck - Affects critical hits and rare finds"
                    />
                    <StatDisplay 
                      label="DEX" 
                      value={gameState.character.pioneerManifest.stats.dex} 
                      tooltip="Dexterity - Affects precision and crafting"
                    />
                  </div>
                  <div className="mt-2 text-xs text-terminal-dim text-center">
                    Total: {gameState.character.pioneerManifest.stats.str + gameState.character.pioneerManifest.stats.vit + gameState.character.pioneerManifest.stats.agi + gameState.character.pioneerManifest.stats.int + gameState.character.pioneerManifest.stats.lck + gameState.character.pioneerManifest.stats.dex}
                  </div>
                </div>

                {/* Moral Compass - Visual 2D Grid */}
                <div className="border-2 border-terminal-bright p-4 bg-terminal-bg">
                  <h3 className="text-terminal-bright mb-3 font-bold">⚖️ MORAL COMPASS</h3>
                  <div className="flex flex-col items-center">
                    <MoralCompass scores={gameState.alignment.scores} />
                    <div className="mt-4 text-center text-xs text-terminal-dim italic">
                      {getAlignmentDescription(gameState.alignment.currentAlignment)}
                    </div>
                  </div>
                </div>

                {/* Pioneer Info */}
                <div className="border-2 border-terminal-text p-4">
                  <h3 className="text-terminal-bright mb-2 font-bold">PIONEER INFO</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-terminal-dim">Number:</span> #{gameState.character.pioneerNumber}</p>
                    <p><span className="text-terminal-dim">Generation:</span> G{gameState.character.pioneerManifest.generation}</p>
                    <p><span className="text-terminal-dim">Rank:</span> {gameState.character.pioneerManifest.rank}</p>
                    <p><span className="text-terminal-dim">Choices Made:</span> {gameState.alignment.alignmentHistory.length}</p>
                  </div>
                </div>

                <div className="text-xs text-terminal-dim text-center mt-4">
                  Press [P] or click anywhere to close
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Display Component with Hover Tooltip
function StatDisplay({ label, value, tooltip }: { label: string; value: number; tooltip: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex justify-between items-center cursor-help border border-terminal-dim p-2 hover:border-terminal-text transition-colors">
        <span className="text-terminal-dim">{label}</span>
        <span className="text-terminal-bright font-bold text-lg">{value}</span>
      </div>
      
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-0 mb-2 p-2 bg-terminal-bg border border-terminal-text text-xs whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}

// Welcome message with standardized 62-char borders
function getWelcomeMessage(): string {
  const title = "THE GREAT TRANSIT";
  const paddedTitle = title.padStart((60 + title.length) / 2).padEnd(60);
  
  return `
╔════════════════════════════════════════════════════════════╗
║${paddedTitle}║
╚════════════════════════════════════════════════════════════╝

Welcome, Pioneer.

You have awakened from cryo-sleep aboard the colony ship.
The Great Crash during departure from Lootopian orbit has
left the fleet scattered. Most crew remain frozen.

Your mission: Keep the ship alive until you reach the new galaxy.

Type 'help' for available commands.
Type 'look' to examine your surroundings.
Type 'status' for ship systems report.

───────────────────────────────────────────────────────────

Press [P] or click your profile (top-right) to view your Pioneer.
`.trim();
}
