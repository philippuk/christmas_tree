import React, { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TreeState } from "../types";
import { randomConePoint, randomSpherePoint } from "../utils/math";

// A single polaroid component
const Polaroid: React.FC<{
  position: THREE.Vector3;
  targetPos: THREE.Vector3;
  chaosPos: THREE.Vector3;
  treeState: TreeState;
  url: string;
}> = ({ position, targetPos, chaosPos, treeState, url }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, url);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const dest = treeState === TreeState.FORMED ? targetPos : chaosPos;
    
    // Smooth independent lerp
    const step = 1.5 * delta;
    meshRef.current.position.lerp(dest, step);
    
    // Look at center-ish but rotate slightly
    if (treeState === TreeState.FORMED) {
       meshRef.current.lookAt(0, meshRef.current.position.y, 0);
       meshRef.current.rotateY(Math.PI); // Face outwards
       
       // Correct any residual rotation from chaos state
       meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, step);
       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, step);
    } else {
       // Chaos spin
       meshRef.current.rotation.x += 0.5 * delta;
       meshRef.current.rotation.y += 0.5 * delta;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* White Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0.1, 0.02]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const PolaroidsSystem: React.FC<{ treeState: TreeState; userImages: string[] }> = ({ treeState, userImages }) => {
  // If user provides images, use them. Otherwise default random ones.
  // We'll generate a fixed number of frames (e.g. 12) and cycle through the images.
  const count = 12;
  
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Scatter nicely on the tree
      const targetArr = randomConePoint(12, 4.5, -4);
      // Push slightly out
      const v = new THREE.Vector3(...targetArr);
      v.multiplyScalar(1.15); // Slightly further out to not clip with foliage
      
      const chaosArr = randomSpherePoint(12);
      
      // Determine Image URL
      let url;
      if (userImages.length > 0) {
        url = userImages[i % userImages.length];
      } else {
        url = `https://picsum.photos/200/200?random=${i + 100}`;
      }

      return {
        id: i,
        targetPos: v,
        chaosPos: new THREE.Vector3(...chaosArr),
        url: url,
        initialPos: new THREE.Vector3(...chaosArr)
      };
    });
  }, [userImages]); // Re-calculate when userImages change

  return (
    <group>
      {data.map((d, index) => (
        <Polaroid
          key={`${d.id}-${d.url}`} // Key by URL too so it re-mounts/re-loads when image changes
          position={d.initialPos}
          targetPos={d.targetPos}
          chaosPos={d.chaosPos}
          treeState={treeState}
          url={d.url}
        />
      ))}
    </group>
  );
};

export default PolaroidsSystem;