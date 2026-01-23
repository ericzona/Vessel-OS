"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { GameState, CommandResult } from "@/types/game.types";
import { CommandParser } from "@/engine/command-parser";
import { ShipHeartbeat } from "@/engine/ship-heartbeat";
import { TimeDilatationManager } from "@/engine/time-dilatation";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";
import PioneerHUD from "./PioneerHUD";

interface TerminalProps {
  gameState: GameState;
  onGameStateUpdate: (newState: GameState) => void;
}

interface Message {
  id: number;
  text: string;
  timestamp: Date;
}

export default function Terminal({ gameState, onGameStateUpdate }: TerminalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(0);
  
  // Initialize command parser with dependencies
  const shipHeartbeat = useRef(new ShipHeartbeat(gameState.ship));
  const timeDilatation = useRef(new TimeDilatationManager(gameState.timeDilatation));
  const commandParser = useRef(new CommandParser(shipHeartbeat.current, timeDilatation.current));

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(getWelcomeMessage());
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          setShowProfileModal(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: messageIdCounter.current++, text, timestamp: new Date() },
    ]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Echo command
    addMessage(`> ${trimmedCmd}`);

    // Parse and execute using CommandParser
    const result: CommandResult = commandParser.current.parse(trimmedCmd, gameState);

    // Update game state if command returns updates
    if (result.updates) {
      const newState = { ...gameState, ...result.updates };
      onGameStateUpdate(newState);
    }

    // Display result (clean, no duplication)
    if (result.message) {
      addMessage(result.message);
    }

    // Clear input
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-mono">
      {/* Header with Pioneer Profile */}
      <div className="flex items-center justify-between p-4 border-b-2 border-terminal-text">
        <h1 className="text-2xl font-['Press_Start_2P'] text-terminal-bright">
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
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="whitespace-pre-wrap break-words"
            style={{ fontFamily: 'monospace' }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
          />
        </div>
      </div>

      {/* Pioneer Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-terminal-bg border-4 border-terminal-text p-8 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-['Press_Start_2P'] text-terminal-bright">
                PIONEER PROFILE
              </h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-terminal-dim hover:text-terminal-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-8">
              {/* 10x Enlarged Pioneer */}
              <div className="flex-shrink-0">
                <PioneerHUD manifest={gameState.character.pioneerManifest} size={400} />
              </div>

              {/* Stats Display */}
              <div className="flex-1 space-y-4">
                <div className="border-2 border-terminal-text p-4">
                  <h3 className="text-terminal-bright mb-3 font-bold">CORE STATS</h3>
                  <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                    <StatDisplay 
                      label="STR" 
                      value={gameState.character.pioneerManifest.stats.perception} 
                      tooltip="Strength - Affects mining and combat effectiveness"
                    />
                    <StatDisplay 
                      label="VIT" 
                      value={gameState.character.pioneerManifest.stats.salvage} 
                      tooltip="Vitality - Increases survival and health"
                    />
                    <StatDisplay 
                      label="AGI" 
                      value={gameState.character.pioneerManifest.stats.engineering} 
                      tooltip="Agility - Improves movement and evasion"
                    />
                    <StatDisplay 
                      label="INT" 
                      value={gameState.character.pioneerManifest.stats.perception + 2} 
                      tooltip="Intelligence - Enhances research and problem-solving"
                    />
                    <StatDisplay 
                      label="LCK" 
                      value={gameState.character.pioneerManifest.stats.salvage - 1} 
                      tooltip="Luck - Affects critical hits (21 rolls) and rare finds"
                    />
                    <StatDisplay 
                      label="DEX" 
                      value={gameState.character.pioneerManifest.stats.engineering + 1} 
                      tooltip="Dexterity - Improves precision and crafting"
                    />
                  </div>
                </div>

                <div className="border-2 border-terminal-text p-4">
                  <h3 className="text-terminal-bright mb-2 font-bold">PIONEER INFO</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-terminal-dim">Number:</span> #{gameState.character.pioneerNumber}</p>
                    <p><span className="text-terminal-dim">Generation:</span> G{gameState.character.pioneerManifest.generation}</p>
                    <p><span className="text-terminal-dim">Rank:</span> {gameState.character.pioneerManifest.rank}</p>
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

// Fixed 62-character width ASCII border helper
function createBorder(content: string): string {
  const width = 60; // Content area (62 - 2 for borders)
  const padded = content.padEnd(width).substring(0, width);
  return `║${padded}║`;
}

function getWelcomeMessage(): string {
  const title = "THE GREAT TRANSIT";
  const paddedTitle = title.padStart((60 + title.length) / 2).padEnd(60);
  
  return `
╔════════════════════════════════════════════════════════════╗
${createBorder(paddedTitle)}
╚════════════════════════════════════════════════════════════╝

Welcome, Pioneer.

You have awakened from cryo-sleep aboard the colony ship.
The Great Crash during departure from Lootopian orbit has
left the fleet scattered. Most crew remain frozen.

Your mission: Keep the ship alive until you reach the new galaxy.

Type 'help' for available commands.
Type 'look' to examine your surroundings.
Type 'status' for a full ship systems report.

───────────────────────────────────────────────────────────

Press [P] or click your profile (top-right) to view your Pioneer.
`.trim();
}
