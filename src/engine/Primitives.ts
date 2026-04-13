// ─────────────────────────────────────────────────────────────────────────────
// Primitives.ts — Point и Color
//
// Аналоги Lua Point:New(x,y) и Color:New(a,r,g,b).
// Re-экспортируются также из AssetRenderer для удобства.
// ─────────────────────────────────────────────────────────────────────────────

export type PointData = { x: number; y: number };

/** Аналог Lua Point:New(x, y) */
export function Point(x: number, y: number): PointData {
  return { x, y };
}

export type ColorData = { a: number; r: number; g: number; b: number };

/** Аналог Lua Color:New(alpha, red, green, blue) — alpha первым */
export function Color(a: number, r: number, g: number, b: number): ColorData {
  return { a, r, g, b };
}
