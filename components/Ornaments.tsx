import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TreeState, TREE_COLORS } from "../types";
import { randomConePoint, randomSpherePoint, lerp } from "../utils/math";

interface InstancedOrnamentsProps {
  treeState: TreeState;
  count: number;
  type: "HEAVY" | "MEDIUM" | "LIGHT";
  colors: string[];
  scaleRange: [number, number];
  geometry: THREE.BufferGeometry;
  emissive?: boolean;
}

const dummy = new THREE.Object3D();

const InstancedOrnaments: React.FC<InstancedOrnamentsProps> = ({
  treeState,
  count,
  type,
  colors,
  scaleRange,
  geometry,
  emissive = false,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Physics config
  const lerpSpeed = type === "HEAVY" ? 1.0 : type === "MEDIUM" ? 1.5 : 2.0;
  
  // Data generation
  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Chaos: Random sphere
      const chaos = randomSpherePoint(18); // Slightly larger chaos radius than foliage
      
      // Target: Cone, but slightly pushed out to be on surface
      // H=14, R=5.5.
      // We want ornaments mostly on the surface, so we bias the R generation.
      const y = Math.random() * 14;
      const rAtY = (1 - y / 14) * 5.5;
      const angle = Math.random() * Math.PI * 2;
      // Bias towards 1 for surface placement
      const r = (0.6 + 0.4 * Math.sqrt(Math.random())) * rAtY; 
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      
      const scale = lerp(scaleRange[0], scaleRange[1], Math.random());
      
      return {
        chaosPos: new THREE.Vector3(chaos[0], chaos[1], chaos[2]),
        targetPos: new THREE.Vector3(x, y - 5, z),
        scale,
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        currentPos: new THREE.Vector3(chaos[0], chaos[1], chaos[2]), // Start at chaos
      };
    });
  }, [count, colors, scaleRange]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((d, i) => {
        dummy.position.copy(d.currentPos);
        dummy.scale.set(d.scale, d.scale, d.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, d.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isFormed = treeState === TreeState.FORMED;
    // Framerate independent lerp factor
    const alpha = Math.min(lerpSpeed * delta, 1.0);

    data.forEach((d, i) => {
      // Determine destination
      const dest = isFormed ? d.targetPos : d.chaosPos;
      
      // Lerp current position
      d.currentPos.lerp(dest, alpha);
      
      // Update dummy
      dummy.position.copy(d.currentPos);
      dummy.scale.set(d.scale, d.scale, d.scale);
      dummy.rotation.set(Math.sin(d.currentPos.x), Math.cos(d.currentPos.y), 0); // Slight rotation based on pos
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial 
        toneMapped={false} 
        color={emissive ? new THREE.Color(10, 10, 10) : new THREE.Color(1,1,1)} 
        emissive={emissive ? new THREE.Color(1, 1, 0.8) : new THREE.Color(0,0,0)}
        emissiveIntensity={emissive ? 2 : 0}
        roughness={emissive ? 0.1 : 0.2}
        metalness={emissive ? 0 : 0.8}
      />
    </instancedMesh>
  );
};

const OrnamentsSystem: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  // Geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  
  return (
    <group>
      {/* Heavy: Gift Boxes - Reduced Count */}
      <InstancedOrnaments
        treeState={treeState}
        count={50}
        type="HEAVY"
        colors={[TREE_COLORS.RED, TREE_COLORS.WHITE]}
        scaleRange={[0.6, 1.0]}
        geometry={boxGeo}
      />
      
      {/* Medium: Baubles - Reduced Count */}
      <InstancedOrnaments
        treeState={treeState}
        count={200}
        type="MEDIUM"
        colors={[TREE_COLORS.RED, TREE_COLORS.WHITE, TREE_COLORS.GOLD]}
        scaleRange={[0.3, 0.5]}
        geometry={sphereGeo}
      />

       {/* Light: Glowing Lights - Reduced Count */}
       <InstancedOrnaments
        treeState={treeState}
        count={450}
        type="LIGHT"
        colors={[TREE_COLORS.WHITE, "#fffacd"]} // LemonChiffonish white
        scaleRange={[0.08, 0.15]}
        geometry={sphereGeo}
        emissive={true}
      />
    </group>
  );
};

export default OrnamentsSystem;