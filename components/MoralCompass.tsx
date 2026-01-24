"use client";

import { useState, useEffect } from "react";
import { AlignmentScores } from "@/types/alignment.types";

interface MoralCompassProps {
  scores: AlignmentScores;
  className?: string;
}

/**
 * Visual Moral Compass - 2D Coordinate Grid
 * Shows Pioneer alignment as a drifting bubble on a grid
 * X-axis: Law (-100) to Chaos (+100)
 * Y-axis: Evil (-100) to Good (+100)
 * Center (0,0) = True Neutral
 */
export default function MoralCompass({ scores, className = "" }: MoralCompassProps) {
  const [bubbleX, setBubbleX] = useState(0);
  const [bubbleY, setBubbleY] = useState(0);

  // Animate bubble position when scores change
  useEffect(() => {
    // Map scores to pixel coordinates
    // Grid is 200x200px, center at 100,100
    // Lawful-Chaos: -100 to +100 maps to 0 to 200 (left to right)
    // Good-Evil: -100 to +100 maps to 200 to 0 (bottom to top, inverted for screen coords)
    
    const x = ((scores.lawChaos + 100) / 200) * 200; // 0-200px
    const y = ((100 - scores.goodEvil) / 200) * 200; // 0-200px (inverted: good=top, evil=bottom)
    
    setBubbleX(x);
    setBubbleY(y);
  }, [scores]);

  return (
    <div className={`${className} relative`}>
      {/* The Compass Grid - 200x200px */}
      <div className="relative w-[200px] h-[200px] border-2 border-terminal-text bg-terminal-bg">
        {/* Grid lines */}
        {/* Vertical center line (Law/Chaos divide) */}
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-terminal-dim opacity-30" />
        {/* Horizontal center line (Good/Evil divide) */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-terminal-dim opacity-30" />
        
        {/* Quarter markers */}
        <div className="absolute left-1/4 top-0 w-[1px] h-full bg-terminal-dim opacity-15" />
        <div className="absolute left-3/4 top-0 w-[1px] h-full bg-terminal-dim opacity-15" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-terminal-dim opacity-15" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-terminal-dim opacity-15" />

        {/* Axis Labels (single letters) */}
        {/* Top: Good */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-terminal-bright text-xs font-bold">
          G
        </div>
        {/* Bottom: Evil */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-terminal-bright text-xs font-bold">
          E
        </div>
        {/* Left: Law */}
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-terminal-bright text-xs font-bold">
          L
        </div>
        {/* Right: Chaos */}
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 text-terminal-bright text-xs font-bold">
          C
        </div>

        {/* Center marker (0,0) */}
        <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-terminal-dim rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* The Drifting Bubble/Puck */}
        <div 
          className="absolute w-4 h-4 bg-terminal-bright rounded-full opacity-80 shadow-lg transition-all duration-700 ease-out"
          style={{
            left: `${bubbleX}px`,
            top: `${bubbleY}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
          }}
        >
          {/* Pulse effect */}
          <div className="absolute inset-0 bg-terminal-bright rounded-full animate-ping opacity-30" />
        </div>

        {/* Coordinate readout */}
        <div className="absolute -bottom-10 left-0 right-0 text-center text-xs text-terminal-dim font-mono">
          ({scores.lawChaos}, {scores.goodEvil})
        </div>
      </div>

      {/* Quadrant Legend */}
      <div className="mt-12 grid grid-cols-2 gap-2 text-[10px] text-terminal-dim">
        <div className="text-left">
          <span className="text-terminal-bright">L+G:</span> Paladin
        </div>
        <div className="text-right">
          <span className="text-terminal-bright">C+G:</span> Rebel
        </div>
        <div className="text-left">
          <span className="text-terminal-bright">L+E:</span> Tyrant
        </div>
        <div className="text-right">
          <span className="text-terminal-bright">C+E:</span> Destroyer
        </div>
      </div>
    </div>
  );
}
