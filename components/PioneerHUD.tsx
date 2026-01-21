"use client";

import { PioneerManifest, LayerSlot } from "@/types/pioneer.types";
import { useState, useEffect } from "react";

interface PioneerHUDProps {
  manifest: PioneerManifest;
  size?: number;
}

// Fallback colors for each layer slot
const LAYER_COLORS: Record<LayerSlot, string> = {
  [LayerSlot.BACKGROUND]: "#1a1a2e",
  [LayerSlot.SHADOW]: "#0f0f1e",
  [LayerSlot.BODY]: "#d4a574",
  [LayerSlot.EYES]: "#4a90e2",
  [LayerSlot.PANTS]: "#2c3e50",
  [LayerSlot.SHOES]: "#34495e",
  [LayerSlot.SHIRT]: "#7f8c8d",
  [LayerSlot.WAIST]: "#95a5a6",
  [LayerSlot.GLOVES]: "#bdc3c7",
  [LayerSlot.WRISTS]: "#ecf0f1",
  [LayerSlot.NECK]: "#f39c12",
  [LayerSlot.FACE_ACC]: "#e74c3c",
  [LayerSlot.HAIR_HAT]: "#8e44ad",
};

export default function PioneerHUD({ manifest, size = 200 }: PioneerHUDProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Check if image exists, fallback to colored block
  const checkImage = (layerSlot: LayerSlot, assetId: string | null) => {
    if (!assetId) return null;

    // Convert LayerSlot enum to folder number
    const folderNum = layerSlot / 10;
    const imagePath = `/assets/pioneer/${folderNum}-${getLayerName(layerSlot)}/${assetId}.png`;
    
    return imagePath;
  };

  const getLayerName = (slot: LayerSlot): string => {
    const names: Record<LayerSlot, string> = {
      [LayerSlot.BACKGROUND]: "background",
      [LayerSlot.SHADOW]: "shadow",
      [LayerSlot.BODY]: "body",
      [LayerSlot.EYES]: "eyes",
      [LayerSlot.PANTS]: "pants",
      [LayerSlot.SHOES]: "shoes",
      [LayerSlot.SHIRT]: "shirt",
      [LayerSlot.WAIST]: "waist",
      [LayerSlot.GLOVES]: "gloves",
      [LayerSlot.WRISTS]: "wrists",
      [LayerSlot.NECK]: "neck",
      [LayerSlot.FACE_ACC]: "face-acc",
      [LayerSlot.HAIR_HAT]: "hair-hat",
    };
    return names[slot];
  };

  const renderLayer = (slot: LayerSlot, index: number) => {
    const assetId = manifest.layers[slot];
    if (!assetId) return null;

    const imagePath = checkImage(slot, assetId);
    const color = LAYER_COLORS[slot];
    const isLoaded = imagePath ? loadedImages[imagePath] : false;

    // Calculate position based on layer (higher layers slightly offset for depth)
    const yOffset = index * 0.5;

    return (
      <g key={slot}>
        {/* Fallback colored block */}
        {(!imagePath || !isLoaded) && (
          <rect
            x={size * 0.2}
            y={size * 0.2 + yOffset}
            width={size * 0.6}
            height={size * 0.6}
            fill={color}
            opacity={0.7}
            rx={4}
          />
        )}
        
        {/* Actual image if available */}
        {imagePath && (
          <image
            href={imagePath}
            x={0}
            y={yOffset}
            width={size}
            height={size}
            onLoad={() => setLoadedImages(prev => ({ ...prev, [imagePath]: true }))}
            onError={() => setLoadedImages(prev => ({ ...prev, [imagePath]: false }))}
            style={{ display: isLoaded ? 'block' : 'none' }}
          />
        )}
      </g>
    );
  };

  // Render layers in order (0-120)
  const layerOrder = Object.keys(LayerSlot)
    .filter(key => !isNaN(Number(key)))
    .map(Number)
    .sort((a, b) => a - b) as LayerSlot[];

  return (
    <div className="pioneer-hud relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="border-2 border-terminal-text rounded-lg bg-terminal-bg"
      >
        {layerOrder.map((slot, index) => renderLayer(slot, index))}
        
        {/* Generation badge overlay */}
        <text
          x={size * 0.05}
          y={size * 0.95}
          fontSize={size * 0.08}
          fill="#00ff41"
          fontFamily="monospace"
          fontWeight="bold"
        >
          GEN {manifest.generation}
        </text>
        
        {/* Rank badge */}
        <text
          x={size * 0.95}
          y={size * 0.95}
          fontSize={size * 0.07}
          fill="#00ff41"
          fontFamily="monospace"
          textAnchor="end"
        >
          {manifest.rank.toUpperCase()}
        </text>
      </svg>
      
      {/* Stats overlay */}
      <div className="mt-2 text-terminal-text text-xs font-mono">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-terminal-dim">PER</div>
            <div className="font-bold">{manifest.stats.perception}</div>
          </div>
          <div className="text-center">
            <div className="text-terminal-dim">SAL</div>
            <div className="font-bold">{manifest.stats.salvage}</div>
          </div>
          <div className="text-center">
            <div className="text-terminal-dim">ENG</div>
            <div className="font-bold">{manifest.stats.engineering}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
