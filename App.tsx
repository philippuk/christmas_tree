import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import Overlay from "./components/Overlay";
import { TreeState } from "./types";

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);
  const [userImages, setUserImages] = useState<string[]>([]);

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas
        dpr={[1, 2]} // Support high pixel ratio for crisp bloom
        gl={{ 
          antialias: false, // Postprocessing handles AA better usually or bloom blurs it anyway
          toneMappingExposure: 1.5,
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        <color attach="background" args={['#020202']} />
        <Suspense fallback={null}>
          <Experience treeState={treeState} userImages={userImages} />
        </Suspense>
      </Canvas>
      <Overlay 
        treeState={treeState} 
        setTreeState={setTreeState} 
        onUpload={(imgs) => setUserImages(imgs)}
      />
      
      {/* Loading Screen / Suspense Fallback visually handled by empty canvas initially */}
      <div className="absolute bottom-4 right-4 text-white/10 text-xs font-mono pointer-events-none">
        v1.0.0 • R3F
      </div>
    </div>
  );
};

export default App;