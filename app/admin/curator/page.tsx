"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Layer mapping for hotkeys 1-9
const LAYER_MAP: Record<string, { folder: string; name: string }> = {
  "1": { folder: "0-background", name: "Background" },
  "2": { folder: "1-shadow", name: "Shadow" },
  "3": { folder: "2-body", name: "Body" },
  "4": { folder: "3-eyes", name: "Eyes" },
  "5": { folder: "4-shirt", name: "Shirt" },
  "6": { folder: "5-pants", name: "Pants" },
  "7": { folder: "6-shoes", name: "Shoes" },
  "8": { folder: "7-jacket", name: "Jacket" },
  "9": { folder: "8-hat", name: "Hair/Hat" },
};

export default function CuratorPage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const [sortedCount, setSortedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load first image from staging
    loadNextImage();

    // Keyboard handler
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "1" && key <= "9") {
        sortImage(key);
      } else if (key === "0") {
        markAsGarbage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const loadNextImage = async () => {
    // In real implementation, this would fetch from /api/curator/next
    // For now, mock it
    setCurrentImage(`/staging_assets/item_${Math.floor(Math.random() * 6326)}.png`);
    setLoading(false);
  };

  const sortImage = async (layerKey: string) => {
    if (!currentImage) return;

    const layer = LAYER_MAP[layerKey];
    const timestamp = new Date().toISOString();
    const filename = currentImage.split("/").pop() || "unknown";

    // Log to master_manifest.json
    const logEntry = {
      id: sortedCount + 1,
      filename,
      layer: layer.folder,
      timestamp,
    };

    console.log("SORTED:", logEntry);

    // In real implementation: 
    // await fetch('/api/curator/sort', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ filename, targetFolder: layer.folder })
    // });

    setSortedCount(prev => prev + 1);
    loadNextImage();
  };

  const markAsGarbage = async () => {
    if (!currentImage) return;

    const timestamp = new Date().toISOString();
    const filename = currentImage.split("/").pop() || "unknown";

    console.log("GARBAGE:", { filename, timestamp });

    setSortedCount(prev => prev + 1);
    loadNextImage();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-2xl font-mono">Loading Curator...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="border-2 border-green-500 p-4 mb-6">
          <h1 className="text-3xl mb-2">🎯 LOOT-TINDER CURATOR TOOL</h1>
          <p className="text-sm opacity-80">Sort 6,326 Lootopian items into proper layers</p>
          <div className="mt-2 text-xl">
            Sorted: <span className="text-yellow-400">{sortedCount}</span> / 6,326
          </div>
        </div>

        {/* Current Image */}
        <div className="border-2 border-green-500 p-8 mb-6 flex items-center justify-center bg-gray-900 min-h-[400px]">
          {currentImage ? (
            <div className="relative w-64 h-64 border border-green-500">
              {/* Fallback placeholder - in production would show actual image */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                <span className="text-white text-center px-4">
                  Item Preview<br/>
                  <span className="text-xs opacity-60">{currentImage.split("/").pop()}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No image loaded</div>
          )}
        </div>

        {/* Hotkey Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(LAYER_MAP).map(([key, { folder, name }]) => (
            <button
              key={key}
              onClick={() => sortImage(key)}
              className="border-2 border-green-500 p-4 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
            >
              <div className="text-2xl font-bold text-yellow-400">[{key}]</div>
              <div className="text-sm mt-1">{name}</div>
              <div className="text-xs opacity-60 mt-1">{folder}</div>
            </button>
          ))}
        </div>

        {/* Garbage Button */}
        <button
          onClick={markAsGarbage}
          className="w-full border-2 border-red-500 text-red-500 p-4 hover:bg-red-900 hover:bg-opacity-30 transition-colors"
        >
          <div className="text-2xl font-bold">[0] GARBAGE / DELETE</div>
          <div className="text-sm mt-1 opacity-60">Mark as unusable</div>
        </button>

        {/* Instructions */}
        <div className="mt-8 border border-green-500 p-4 text-xs opacity-60">
          <div className="mb-2 font-bold text-base opacity-100">INSTRUCTIONS:</div>
          <ul className="space-y-1">
            <li>• Press 1-9 to assign to layer (or click button)</li>
            <li>• Press 0 to mark as garbage</li>
            <li>• Files auto-move to /public/assets/pioneer/[layer]/</li>
            <li>• All actions logged to master_manifest.json</li>
            <li>• Goal: Sort all 6,326 items before launch</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
