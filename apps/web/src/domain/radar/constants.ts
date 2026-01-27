import type { QuadrantPosition } from "./types";

// -----------------------------------------------------------------------------
// DATA SOURCE
// -----------------------------------------------------------------------------

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;

export const RADAR_SHEET_ID = "1B-ojvUlqVMigLGGs8egpn-0YaVTDmqe1Vb6EL2ji-aM";

export const NOTION_PAGE_ID = import.meta.env.VITE_NOTION_PAGE_ID as string | undefined;

export const NOTION_WORKER_URL = import.meta.env.VITE_NOTION_WORKER_URL as string | undefined;

// -----------------------------------------------------------------------------
// RINGS
// -----------------------------------------------------------------------------

export const RING_NAMES = ["proven", "experimental", "learning", "avoid"] as const;

/**
 * Ring ratios for proportional spacing (0 = center, 1 = edge)
 * First ratio includes buffer to prevent blips from being cut off at center.
 * Buffer accounts for: quadrantsGap/2 (16px) + blipWidth (22px) + spacing margin
 */
export const RING_RATIOS = [0.11, 0.406, 0.652, 0.832, 1] as const;

// -----------------------------------------------------------------------------
// QUADRANTS
// -----------------------------------------------------------------------------

/**
 * Quadrant start angles by position (in degrees).
 * Position labels match visual location on screen (NW = top-left, etc.)
 */
export const QUADRANT_ANGLES: Readonly<Record<QuadrantPosition, number>> = {
  NW: 0,
  SW: -90,
  NE: 90,
  SE: -180,
};

/** Ordered list of quadrant positions (clockwise from top-left: NW, NE, SE, SW) */
export const QUADRANT_POSITIONS: readonly QuadrantPosition[] = ["NW", "NE", "SE", "SW"];

// -----------------------------------------------------------------------------
// GRAPH DIMENSIONS
// -----------------------------------------------------------------------------

/** Base quadrant size in pixels */
export const QUADRANT_SIZE = 512;

/** Gap between quadrants in pixels */
export const QUADRANTS_GAP = 32;

/** Effective quadrant size including half the gap */
export const EFFECTIVE_QUADRANT_SIZE = QUADRANT_SIZE + QUADRANTS_GAP / 2;

/** Total radar size (2 quadrants + gap) */
export const RADAR_SIZE = QUADRANT_SIZE * 2 + QUADRANTS_GAP;

// -----------------------------------------------------------------------------
// BLIP DIMENSIONS
// -----------------------------------------------------------------------------

/** Standard blip circle width in pixels */
export const BLIP_WIDTH = 22;

/** Minimum blip width in pixels */
export const BLIP_MIN_WIDTH = 12;

/** Blip group height in pixels */
export const BLIP_GROUP_HEIGHT = 24;

/** Width for "new" group blips */
export const BLIP_NEW_GROUP_WIDTH = 88;

/** Width for "existing" group blips */
export const BLIP_EXISTING_GROUP_WIDTH = 124;

// -----------------------------------------------------------------------------
// BLIP LAYOUT
// -----------------------------------------------------------------------------

/** Maximum blips per ring before grouping [ring0, ring1, ring2, ring3] */
export const MAX_BLIPS_PER_RING = [8, 22, 17, 18] as const;

/** Group blip angles per ring in degrees [ring0, ring1, ring2, ring3] */
export const GROUP_BLIP_ANGLES = [30, 35, 60, 80] as const;

// -----------------------------------------------------------------------------
// UI DIMENSIONS
// -----------------------------------------------------------------------------

/** Height of the sticky quadrant title header in pixels */
export const STICKY_HEADER_HEIGHT = 56;

// -----------------------------------------------------------------------------
// RESPONSIVE BREAKPOINTS
// -----------------------------------------------------------------------------

/** Breakpoint for switching to mobile radar view */
export const MOBILE_BREAKPOINT = 1024;

// -----------------------------------------------------------------------------
// ANIMATION TIMING
// -----------------------------------------------------------------------------

/** Duration to wait for DOM transitions before scrolling (matches --transition-slow) */
export const TRANSITION_DURATION_MS = 300;

/** Minimum loading duration for smooth animation */
export const MIN_LOADING_DURATION_MS = 1500;
