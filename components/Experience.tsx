import React, { Suspense } from "react";
import { OrbitControls, Environment, PerspectiveCamera, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { KernelSize, Resolution } from "postprocessing";
import { TreeState } from "../types";
import Foliage from "./Foliage";
import OrnamentsSystem from "./Ornaments";
import Snow from "./Snow";
import PolaroidsSystem from "./Polaroids";
import Star from "./Star";

interface ExperienceProps {
  treeState: TreeState;
  userImages: string[];
}

const Experience: React.FC<ExperienceProps> = ({ treeState, userImages }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={treeState === TreeState.FORMED}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#0f1a20" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00aaff" />
      
      {/* Environment Map for Reflections */}
      <Environment preset="lobby" environmentIntensity={0.5} />

      {/* 3D Content */}
      <group position={[0, -2, 0]}>
        <Foliage treeState={treeState} />
        <OrnamentsSystem treeState={treeState} />
        <Star treeState={treeState} />
        <Suspense fallback={null}>
           <PolaroidsSystem treeState={treeState} userImages={userImages} />
        </Suspense>
      </group>
      
      <Snow />
      {/* Reduced star count for better performance */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          luminanceSmoothing={0.1} 
          intensity={1.2} 
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;