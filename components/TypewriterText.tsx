"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

/**
 * Typewriter 2.0 - The RPG Feel
 * Phase 4.6: Stable typewriter with clean string sanitization
 * 
 * Controls:
 * - [S] or [Enter] = Skip to end of current message
 * - [N] or [Space] = Next message (triggers onComplete)
 * 
 * Speed: 30ms/char for RPG-style pacing
 */
export default function TypewriterText({ 
  text, 
  speed = 30, 
  onComplete,
  className = ""
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sanitize text to prevent undefined/corruption
  const sanitizedText = String(text || "").trim();

  const skipToEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayedText(sanitizedText);
    setIsComplete(true);
    currentIndexRef.current = sanitizedText.length;
  };

  const handleNext = () => {
    if (isComplete && onComplete) {
      onComplete();
    } else {
      skipToEnd();
    }
  };

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    setIsComplete(false);
    currentIndexRef.current = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Start typewriter effect with sanitized text
    if (sanitizedText.length > 0) {
      intervalRef.current = setInterval(() => {
        if (currentIndexRef.current < sanitizedText.length) {
          const char = sanitizedText[currentIndexRef.current];
          setDisplayedText((prev) => prev + char);
          currentIndexRef.current++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsComplete(true);
        }
      }, speed);
    } else {
      setIsComplete(true);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sanitizedText, speed]);

  // Global keyboard listener for controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // CRITICAL: Always ignore if typing in input field or if textarea/other input
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || 
          activeEl?.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement)?.isContentEditable) {
        return;
      }
      
      const key = e.key.toLowerCase();
      
      // [S] = Skip to end of current typing
      if (key === 's') {
        e.preventDefault();
        if (currentIndexRef.current < sanitizedText.length) {
          // Still typing, skip to end
          skipToEnd();
        }
      }
      // [N] or [Space] = Next message (only when complete)
      else if ((key === 'n' || e.key === ' ') && isComplete && onComplete) {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, onComplete, sanitizedText, skipToEnd]);

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap">{displayedText}</div>
      {!isComplete && (
        <div className="text-terminal-dim opacity-70 text-xs mt-1">
          [S] Skip | [Enter] Skip
        </div>
      )}
      {isComplete && onComplete && (
        <div className="text-terminal-bright opacity-80 text-xs mt-1 animate-pulse">
          [N] Next | [Space] Next
        </div>
      )}
    </div>
  );
}
