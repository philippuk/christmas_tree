import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TreeState, TREE_COLORS } from "../types";
import { randomConePoint, randomSpherePoint } from "../utils/math";

// Custom shader material for the foliage
const FoliageShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vDepth;

    // Cubic Bezier ease-in-out function
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;
      
      float easedProgress = easeInOutCubic(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aChaosPos, aTargetPos, easedProgress);
      
      // Add subtle wind/breathing movement based on time and height
      float wind = sin(uTime * 2.0 + pos.y * 0.5) * 0.1 * easedProgress; // Only move when formed
      pos.x += wind;
      pos.z += cos(uTime * 1.5 + pos.y * 0.5) * 0.1 * easedProgress;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      vDepth = -mvPosition.z;
      // Increased base size (80.0) to compensate for lower particle count
      gl_PointSize = (80.0 * uPixelRatio) / -mvPosition.z;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vRandom;
    varying float vDepth;

    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Simple shading based on depth and randomness
      vec3 finalColor = uColor;
      finalColor += vRandom * 0.2; // slight color variation
      
      // Fake ambient occlusion / shadow at bottom of particle
      float shadow = smoothstep(0.5, 0.3, dist);
      
      gl_FragColor = vec4(finalColor * shadow, 1.0);
    }
  `
};

interface FoliageProps {
  treeState: TreeState;
}

// Optimized count for better performance (Reduced from 12000 to 8500)
const COUNT = 8500;
const TREE_HEIGHT = 14;
const TREE_RADIUS = 5.5;
const CHAOS_RADIUS = 15;

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positionsChaos, positionsTarget, randoms } = useMemo(() => {
    const pChaos = new Float32Array(COUNT * 3);
    const pTarget = new Float32Array(COUNT * 3);
    const rnds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Chaos: Random sphere
      const chaos = randomSpherePoint(CHAOS_RADIUS);
      pChaos[i * 3] = chaos[0];
      pChaos[i * 3 + 1] = chaos[1];
      pChaos[i * 3 + 2] = chaos[2];

      // Target: Cone
      const target = randomConePoint(TREE_HEIGHT, TREE_RADIUS, -5); 
      pTarget[i * 3] = target[0];
      pTarget[i * 3 + 1] = target[1];
      pTarget[i * 3 + 2] = target[2];

      rnds[i] = Math.random();
    }
    return { positionsChaos: pChaos, positionsTarget: pTarget, randoms: rnds };
  }, []);

  // Define uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color(TREE_COLORS.GREEN) },
    uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate uProgress based on treeState using delta time
      const targetP = treeState === TreeState.FORMED ? 1 : 0;
      // Framerate independent interpolation
      const step = 2.0 * delta; 
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetP,
        step 
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Use chaos as base position, logic is in shader
          count={COUNT}
          array={positionsChaos} // This is actually unused by shader logic (we use aChaosPos), but needed by threejs to render bounding box
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={COUNT}
          array={positionsChaos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={COUNT}
          array={positionsTarget}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[FoliageShaderMaterial]}
        uniforms={uniforms}
        transparent={false}
        depthWrite={true}
      />
    </points>
  );
};

export default Foliage;