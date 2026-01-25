"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
  className?: string;
}

export interface TypewriterHandle {
  skip: () => void;
  next: () => void;
  isTyping: () => boolean;
  isComplete: () => boolean;
}

/**
 * Typewriter 3.0 - Character-by-Character RPG Reveal
 * 
 * Features:
 * - Reveals exactly ONE character every 25ms
 * - No scanning effect - pure left-to-right reveal
 * - Exposes skip() and next() methods for external controls
 * - Mobile-friendly with explicit button support
 */
const TypewriterText = forwardRef<TypewriterHandle, TypewriterTextProps>(({ 
  text, 
  speed = 25, 
  onComplete,
  onSkip,
  onNext,
  className = ""
}, ref) => {
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
    if (onSkip) onSkip();
  };

  const handleNext = () => {
    if (isComplete && onComplete) {
      if (onNext) onNext();
      onComplete();
    } else {
      skipToEnd();
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    skip: skipToEnd,
    next: handleNext,
    isTyping: () => currentIndexRef.current < sanitizedText.length && !isComplete,
    isComplete: () => isComplete,
  }));

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

    // Start typewriter effect - ONE character at a time
    if (sanitizedText.length > 0) {
      intervalRef.current = setInterval(() => {
        if (currentIndexRef.current < sanitizedText.length) {
          // Reveal exactly one character
          currentIndexRef.current++;
          setDisplayedText(sanitizedText.substring(0, currentIndexRef.current));
        } else {
          // Typing complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsComplete(true);
          if (onComplete) onComplete();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Always ignore if typing in input field
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || 
          activeEl?.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement)?.isContentEditable) {
        return;
      }
      
      const key = e.key.toLowerCase();
      
      // [S] or [Enter] = Skip to end
      if (key === 's' || e.key === 'Enter') {
        if (currentIndexRef.current < sanitizedText.length) {
          e.preventDefault();
          skipToEnd();
        }
      }
      // [N] or [Space] = Next (only when complete)
      else if ((key === 'n' || e.key === ' ') && isComplete) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, sanitizedText]);

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap font-mono">{displayedText}</div>
    </div>
  );
});

TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;
