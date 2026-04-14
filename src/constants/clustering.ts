/**
 * Marker clustering configuration constants
 */

/** Cluster marker sizing configuration */
export const CLUSTER_CONFIG = {
  /** Base size for cluster markers in pixels */
  BASE_SIZE: 40,
  /** Maximum size for cluster markers in pixels */
  MAX_SIZE: 70,
  /** Size increase per increment in pixels */
  SIZE_INCREMENT: 5,
  /** Number of markers to trigger size increment */
  MARKERS_PER_INCREMENT: 10,
  /** Base font size for cluster count */
  BASE_FONT_SIZE: 16,
  /** Maximum font size for cluster count */
  MAX_FONT_SIZE: 22,
  /** Markers needed to increase font size */
  MARKERS_PER_FONT_INCREMENT: 50,
  /** Font size increase per increment */
  FONT_SIZE_INCREMENT: 2,
} as const;

/** Cluster marker colors (Landal brand) */
export const CLUSTER_COLORS = {
  /** Background color (cream) */
  BACKGROUND: '#FFFAE9',
  /** Text color (teal) */
  TEXT: '#0097A2',
} as const;
