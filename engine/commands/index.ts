/**
 * Command Registry
 * Centralized export of all available commands
 */

import { Command } from "@/types/game.types";
import { StatusCommand } from "./status";
import { RepairCommand } from "./repair";
import { MineCommand } from "./mine";
import { MoveCommand } from "./move";
import { LookCommand } from "./look";
import { TalkCommand } from "./talk";
import { FeedbackCommand } from "./feedback";
import { HelpCommand } from "./help";
import { QuartersCommand } from "./quarters";
import { LockerCommand } from "./locker";
import { InspectCommand } from "./inspect";
import { InventoryCommand } from "./inventory";

/**
 * Registry of all available commands
 * Add new commands here to automatically register them
 */
export const COMMAND_REGISTRY: Command[] = [
  StatusCommand,
  RepairCommand,
  MineCommand,
  MoveCommand,
  LookCommand,
  TalkCommand,
  FeedbackCommand,
  HelpCommand,
  QuartersCommand,
  LockerCommand,
  InspectCommand,
  InventoryCommand,
];

/**
 * Get a command map for quick lookup
 */
export function getCommandMap(): Map<string, Command> {
  const map = new Map<string, Command>();
  
  COMMAND_REGISTRY.forEach((cmd) => {
    // Register main command name
    map.set(cmd.name.toLowerCase(), cmd);
    
    // Register aliases
    if (cmd.aliases) {
      cmd.aliases.forEach((alias) => {
        map.set(alias.toLowerCase(), cmd);
      });
    }
  });
  
  return map;
}
