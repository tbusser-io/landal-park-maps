/**
 * Layout and UI-related constants
 */

/** Responsive breakpoints in pixels */
export const BREAKPOINTS = {
  /** Mobile devices (up to 767px) */
  MOBILE: 767,
  /** Tablet devices (up to 1023px) */
  TABLET: 1023,
} as const;

/** Component dimensions in pixels */
export const DIMENSIONS = {
  /** Filter sidebar width on desktop */
  SIDEBAR_WIDTH: 300,
  /** Side panel width on desktop */
  PANEL_WIDTH: 420,
  /** Standard padding for map edges */
  MAP_PADDING: 20,
  /** Bottom padding for mobile map (above controls) */
  MAP_PADDING_MOBILE_BOTTOM: 100,
} as const;

/** Animation and timing constants in milliseconds */
export const TIMING = {
  /** Delay for initial map bounds calculation */
  MAP_INIT_DELAY: 500,
  /** Delay for subsequent map bounds updates */
  MAP_UPDATE_DELAY: 100,
} as const;

/** Media query strings for use with @vueuse/core */
export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE}px)`,
  TABLET: `(max-width: ${BREAKPOINTS.TABLET}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.TABLET + 1}px)`,
} as const;
