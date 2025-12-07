import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SnowShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uHeight;
    attribute float aRandom;
    attribute float aSpeed;
    varying float vAlpha;
    
    void main() {
      vec3 pos = position;
      
      // Fall down
      float fallOffset = uTime * aSpeed;
      pos.y -= fallOffset;
      
      // Wrap around logic (simulate infinite fall)
      // Modulo arithmetic in shader for y
      // range is roughly 20 to -10 -> span 30
      float span = 30.0;
      pos.y = mod(pos.y - 10.0, span) - 10.0; // center around 0
      if(pos.y < -10.0) pos.y += span;

      // Horizontal drift
      pos.x += sin(uTime * 0.5 + aRandom * 10.0) * 0.5;
      pos.z += cos(uTime * 0.3 + aRandom * 8.0) * 0.5;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Fade out at bottom
      // Normalize Y from -10 to 20 -> 0 to 1
      // If y < -5 start fading
      vAlpha = smoothstep(-10.0, -5.0, pos.y);

      gl_PointSize = (25.0 * aRandom + 10.0) / -mvPosition.z;
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      float strength = 1.0 - (dist * 2.0);
      gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * strength * 0.8);
    }
  `
};

// Reduced count for optimization (2000 -> 1500)
const COUNT = 1500;

const Snow: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, randoms, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);
    const spd = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      // Random position in a large cylinder/box area
      pos[i * 3] = (Math.random() - 0.5) * 40;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30 + 10; // y (start high)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;     // z
      
      rnd[i] = Math.random();
      spd[i] = 1.0 + Math.random() * 3.0; // Fall speed
    }
    return { positions: pos, randoms: rnd, speeds: spd };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={COUNT}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={COUNT}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[SnowShaderMaterial]}
        uniforms={{
          uTime: { value: 0 },
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;