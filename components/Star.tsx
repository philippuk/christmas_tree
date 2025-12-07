import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TreeState, TREE_COLORS } from "../types";
import { randomSpherePoint } from "../utils/math";

const Star: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Chaos position
  const [chaosPos] = useState(() => {
    const p = randomSpherePoint(15);
    return new THREE.Vector3(p[0], p[1], p[2]);
  });
  
  // Target position: Top of the tree
  // Tree roughly goes from y=-5 to y=9. Star sits at ~9.5.
  const targetPos = new THREE.Vector3(0, 9.5, 0); 

  // Create a proper 5-pointed star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    
    // Start at top
    shape.moveTo(0, outerRadius);
    
    // Draw the star path
    for (let i = 1; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      shape.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.1,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // Center geometry for proper rotation
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const dest = treeState === TreeState.FORMED ? targetPos : chaosPos;
    
    // Smooth independent lerp movement
    const step = 2.5 * delta;
    groupRef.current.position.lerp(dest, step);
    
    if (treeState === TreeState.FORMED) {
       // Smoothly reset rotation to zero (facing forward)
       groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 2);
       groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 2);
       groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 2);
       
       // Gentle bobbing motion
       const bob = Math.sin(state.clock.elapsedTime * 2) * 0.1;
       groupRef.current.position.y = dest.y + bob;
    } else {
       // Tumble when in chaos
       groupRef.current.rotation.x += delta * 0.5;
       groupRef.current.rotation.z += delta * 0.5;
    }
    
    // Subtle pulse
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={chaosPos}>
        {/* Warm glow light */}
        <pointLight color="#ffddaa" intensity={5} distance={15} decay={2} />
        
        <mesh geometry={starGeometry}>
            {/* High emissive material for bloom effect */}
            <meshStandardMaterial 
                color={TREE_COLORS.GOLD} 
                emissive="#ffaa00"
                emissiveIntensity={3.0}
                toneMapped={false}
                roughness={0.1}
                metalness={0.8}
            />
        </mesh>
    </group>
  );
};

export default Star;