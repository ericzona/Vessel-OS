"use client";

import Terminal from "@/components/Terminal";
import PioneerHUD from "@/components/PioneerHUD";
import { generatePioneerManifest } from "@/engine/pioneer-generator";

export default function Home() {
  // Generate a sample pioneer manifest for the HUD
  const sampleManifest = generatePioneerManifest("pioneer-001", 0);
  
  return (
    <main className="min-h-screen bg-terminal-bg flex items-center justify-center p-4 relative">
      {/* Pioneer HUD - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <PioneerHUD manifest={sampleManifest} size={100} />
      </div>
      
      <Terminal />
    </main>
  );
}
