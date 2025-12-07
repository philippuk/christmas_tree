import { Color } from "three";

export enum TreeState {
  CHAOS = "CHAOS",
  FORMED = "FORMED",
}

export interface OrnamentData {
  id: string;
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: Color;
  type: "HEAVY" | "MEDIUM" | "LIGHT";
}

export const TREE_COLORS = {
  RED: "#8a0303",     // Deep Crimson
  WHITE: "#ffffff",   // Snow White
  GREEN: "#0f2e13",   // Forest Green
  GOLD: "#ffd700",
  SILVER: "#c0c0c0"
};
