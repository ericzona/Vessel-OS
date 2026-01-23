"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({ 
  text, 
  speed = 25, 
  onComplete,
  className = ""
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipToEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDisplayedText(text);
    setIsComplete(true);
    currentIndexRef.current = text.length;
    if (onComplete) onComplete();
  };

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    setIsComplete(false);
    currentIndexRef.current = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start typewriter effect
    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current < text.length) {
        setDisplayedText((prev) => prev + text[currentIndexRef.current]);
        currentIndexRef.current++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  // Global keyboard listener for [N]ext and [S]kip
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 's' || e.key === 'Enter') {
        skipToEnd();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [text]);

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap">{displayedText}</div>
      {!isComplete && (
        <div className="text-terminal-text opacity-60 text-xs mt-2">
          Press [N]ext, [S]kip, or [Enter] to complete...
        </div>
      )}
    </div>
  );
}
