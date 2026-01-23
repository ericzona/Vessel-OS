"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Layer mapping for hotkeys 0-9 (aligned with folder IDs for muscle memory)
const LAYER_MAP: Record<string, { folder: string; name: string }> = {
  "1": { folder: "10-necklace", name: "Necklace" },
  "2": { folder: "2-body", name: "Body" },
  "3": { folder: "3-eyes", name: "Eyes" },
  "4": { folder: "4-shirt", name: "Shirt" },
  "5": { folder: "5-pants", name: "Pants" },
  "6": { folder: "6-shoes", name: "Shoes" },
  "7": { folder: "7-jacket", name: "Jacket" },
  "8": { folder: "8-hat", name: "Hat" },
  "9": { folder: "9-glasses", name: "Glasses" },
};

export default function CuratorPage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    // Load file list from API
    loadFileList();
  }, []);

  useEffect(() => {
    // Keyboard handler
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "1" && key <= "9") {
        sortImage(key);
      } else if (key === "0") {
        markAsGarbage();
      } else if (key.toLowerCase() === "s") {
        skipImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentImage]);

  const loadFileList = async () => {
    try {
      const response = await fetch('/api/curator/list');
      const data = await response.json();
      
      if (data.success && data.files.length > 0) {
        setImageList(data.files);
        setTotalFiles(data.total);
        setCurrentImage(`/staging_assets/${data.files[0]}`);
        setCurrentIndex(0);
      } else {
        console.error('No files found in staging_assets');
      }
    } catch (error) {
      console.error('Failed to load file list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextImage = () => {
    if (imageList.length === 0) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < imageList.length) {
      setCurrentImage(`/staging_assets/${imageList[nextIndex]}`);
      setCurrentIndex(nextIndex);
      setImageError(false);
    } else {
      // All images sorted!
      setCurrentImage(null);
    }
  };

  const sortImage = async (layerKey: string) => {
    if (!currentImage || processing) return;

    setProcessing(true);
    const layer = LAYER_MAP[layerKey];
    const filename = currentImage.split("/").pop() || "unknown";

    try {
      const response = await fetch('/api/curator/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, targetFolder: layer.folder }),
      });

      const data = await response.json();
      
      if (data.success) {
        const folderId = layer.folder.split('-')[0]; // Extract folder ID (e.g., "10" from "10-necklace")
        setFeedback(`✓ Moved ${filename} to Folder ${folderId} (${layer.name})`);
        setSortedCount(prev => prev + 1);
        setTimeout(() => setFeedback(""), 2500);
        loadNextImage();
      } else {
        setFeedback(`✗ Error: ${data.error}`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (error) {
      setFeedback(`✗ Network error`);
      setTimeout(() => setFeedback(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const markAsGarbage = async () => {
    if (!currentImage || processing) return;

    setProcessing(true);
    const filename = currentImage.split("/").pop() || "unknown";

    try {
      const response = await fetch('/api/curator/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, targetFolder: 'garbage' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedback(`🗑 Sent to garbage!`);
        setSortedCount(prev => prev + 1);
        setTimeout(() => setFeedback(""), 2000);
        loadNextImage();
      } else {
        setFeedback(`✗ Error: ${data.error}`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (error) {
      setFeedback(`✗ Network error`);
      setTimeout(() => setFeedback(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const skipImage = () => {
    if (!currentImage || processing) return;
    setFeedback("⏭ Skipped");
    setTimeout(() => setFeedback(""), 1000);
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
            Sorted: <span className="text-yellow-400">{sortedCount}</span> / {totalFiles || "???"}
          </div>
          <div className="text-sm opacity-60 mt-1">
            Current: {currentIndex + 1} of {totalFiles} | Remaining: {totalFiles - currentIndex - sortedCount}
          </div>
          {feedback && (
            <div className="mt-2 text-lg font-bold text-yellow-300 animate-pulse">
              {feedback}
            </div>
          )}
          {processing && (
            <div className="mt-2 text-sm text-yellow-500">
              Processing...
            </div>
          )}
        </div>

        {/* Current Image */}
        <div className="border-2 border-green-500 p-8 mb-6 flex items-center justify-center bg-gray-900 min-h-[400px]">
          {currentImage ? (
            <div className="relative w-64 h-64 border border-green-500">
              {imageError ? (
                // Corrupted data fallback
                <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black mb-2">⚠</div>
                    <div className="text-lg font-bold text-black">DATA CORRUPTED</div>
                    <div className="text-xs text-black opacity-70 mt-2">{currentImage.split("/").pop()}</div>
                  </div>
                </div>
              ) : (
                // Actual image with error handling
                <img
                  src={currentImage}
                  alt="Lootopian Item"
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          ) : (
            <div className="text-2xl text-yellow-400">
              🎉 ALL IMAGES SORTED! 🎉
            </div>
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

        {/* Garbage + Skip Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={markAsGarbage}
            disabled={processing}
            className="border-2 border-red-500 text-red-500 p-4 hover:bg-red-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl font-bold">[0] GARBAGE</div>
            <div className="text-sm mt-1 opacity-60">Delete item</div>
          </button>
          <button
            onClick={skipImage}
            disabled={processing}
            className="border-2 border-yellow-500 text-yellow-500 p-4 hover:bg-yellow-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl font-bold">[S] SKIP</div>
            <div className="text-sm mt-1 opacity-60">Skip for now</div>
          </button>
        </div>

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
