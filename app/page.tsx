import Terminal from "@/components/Terminal";
import dynamic from "next/dynamic";

// Load PioneerHUD client-side only to avoid hydration issues
const PioneerHUDWrapper = dynamic(() => import("@/components/PioneerHUD").then(mod => {
  const { generatePioneerManifest } = require("@/engine/pioneer-generator");
  const manifest = generatePioneerManifest("pioneer-001", 0);
  
  return () => {
    const PioneerHUD = mod.default;
    return <PioneerHUD manifest={manifest} size={100} />;
  };
}), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-terminal-bg flex items-center justify-center p-4 relative">
      {/* Pioneer HUD - Top Left (Client-side only) */}
      <div className="absolute top-4 left-4 z-10">
        <PioneerHUDWrapper />
      </div>
      
      <Terminal />
    </main>
  );
}
