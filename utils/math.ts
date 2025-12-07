import * as THREE from 'three';

// Generate a random point inside a sphere
export const randomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

// Generate a random point within a cone volume (for the tree)
export const randomConePoint = (height: number, radiusBase: number, yOffset: number = 0): [number, number, number] => {
  const y = Math.random() * height; // Height from base
  const rAtY = (1 - y / height) * radiusBase; // Radius at this height
  
  const angle = Math.random() * Math.PI * 2;
  // Sqrt for uniform distribution in the circle slice
  const r = Math.sqrt(Math.random()) * rAtY; 

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return [x, y + yOffset, z];
};

export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};
