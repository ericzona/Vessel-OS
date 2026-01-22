"use client";

import { PioneerManifest, LayerSlot } from "@/types/pioneer.types";
import { useState } from "react";

interface PioneerHUDProps {
  manifest: PioneerManifest;
  size?: number;
}

// Fallback colors for 3 base layers
const LAYER_COLORS = {
  body: "#d4a574",
  eyes: "#4a90e2",
  hair: "#8e44ad",
};

export default function PioneerHUD({ manifest, size = 100 }: PioneerHUDProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Only render 3 base layers for now: body, eyes, hair
  const bodyId = manifest.layers[LayerSlot.BODY] || "1-white";
  const eyesId = manifest.layers[LayerSlot.EYES] || "1-Black";
  const hairId = manifest.layers[LayerSlot.HAIR_HAT] || "1-spiked-black";
  
  const layers = [
    { 
      id: "body", 
      src: `/assets/pioneer/2-body/pioneer_body_${bodyId}.png`,
      color: LAYER_COLORS.body,
      fallbackText: "BODY"
    },
    { 
      id: "eyes", 
      src: `/assets/pioneer/3-eyes/pioneer_eyes_${eyesId}.png`,
      color: LAYER_COLORS.eyes,
      fallbackText: "EYES"
    },
    { 
      id: "hair", 
      src: `/assets/pioneer/8-hat/pioneer_hair_${hairId}.png`,
      color: LAYER_COLORS.hair,
      fallbackText: "HAIR"
    },
  ];

  const renderLayer = (layer: typeof layers[0], index: number) => {
    const isLoaded = loadedImages[layer.src];
    const yOffset = index * 0.3;

    return (
      <g key={layer.id}>
        {/* Fallback colored block with label */}
        {!isLoaded && (
          <>
            <rect
              x={size * 0.15}
              y={size * 0.15 + yOffset}
              width={size * 0.7}
              height={size * 0.7}
              fill={layer.color}
              opacity={0.8}
              rx={4}
            />
            <text
              x={size * 0.5}
              y={size * 0.5 + yOffset}
              fontSize={size * 0.08}
              fill="#ffffff"
              fontFamily="monospace"
              textAnchor="middle"
              opacity={0.9}
            >
              {layer.fallbackText}
            </text>
          </>
        )}
        
        {/* Actual PNG image */}
        <image
          href={layer.src}
          x={0}
          y={yOffset}
          width={size}
          height={size}
          onLoad={() => setLoadedImages(prev => ({ ...prev, [layer.src]: true }))}
          onError={() => setLoadedImages(prev => ({ ...prev, [layer.src]: false }))}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      </g>
    );
  };

  return (
    <div className="pioneer-hud relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="border-2 border-terminal-text rounded-lg bg-terminal-bg"
      >
        {layers.map((layer, index) => renderLayer(layer, index))}
        
        {/* Generation badge overlay */}
        <text
          x={size * 0.05}
          y={size * 0.95}
          fontSize={size * 0.1}
          fill="#00ff00"
          fontFamily="monospace"
          fontWeight="bold"
        >
          G{manifest.generation}
        </text>
        
        {/* Rank badge */}
        <text
          x={size * 0.95}
          y={size * 0.95}
          fontSize={size * 0.09}
          fill="#00ff00"
          fontFamily="monospace"
          textAnchor="end"
        >
          {manifest.rank.substring(0, 3).toUpperCase()}
        </text>
      </svg>
      
      {/* Stats overlay - show 6 core stats */}
      <div className="mt-1 text-terminal-text text-[8px] font-mono leading-tight">
        <div className="grid grid-cols-3 gap-0.5 text-center">
          <div>
            <div className="text-terminal-dim">STR</div>
            <div className="font-bold text-[10px]">{manifest.stats.perception}</div>
          </div>
          <div>
            <div className="text-terminal-dim">VIT</div>
            <div className="font-bold text-[10px]">{manifest.stats.salvage}</div>
          </div>
          <div>
            <div className="text-terminal-dim">AGI</div>
            <div className="font-bold text-[10px]">{manifest.stats.engineering}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0.5 text-center mt-0.5">
          <div>
            <div className="text-terminal-dim">INT</div>
            <div className="font-bold text-[10px]">{manifest.stats.perception + 2}</div>
          </div>
          <div>
            <div className="text-terminal-dim">LCK</div>
            <div className="font-bold text-[10px]">{manifest.stats.salvage - 1}</div>
          </div>
          <div>
            <div className="text-terminal-dim">DEX</div>
            <div className="font-bold text-[10px]">{manifest.stats.engineering + 1}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
