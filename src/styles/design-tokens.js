/**
 * Design Tokens - Cricket Broadcaster 360
 * All measurements, colors, and typography extracted from PSD specifications
 * Ensures pixel-perfect, consistent design across all components
 * 
 * Version: 3.0 FINAL
 */

// ============================================================================
// COLOR PALETTE (Measured from PSD - Image 3/4)
// ============================================================================

export const COLORS = {
  // Primary Broadcast Colors
  overlayGrassBg: '#4CAF50',        // Grass green (field color)
  overlayDarkNavy: '#1A1F35',       // Dark navy blocks
  overlayLightGray: '#F5F5F5',      // Light gray/white text bg
  overlayWhite: '#FFFFFF',          // Pure white text
  
  // Accents
  accentHotPink: '#E725AA',         // Hot pink (score highlight)
  accentDarkGreen: '#1B5E20',       // Dark green (bowler section)
  accentMaroon: '#8B0000',          // Maroon (right team block)
  
  // Text Colors
  textPrimary: '#FFFFFF',           // White (primary text)
  textSecondary: '#B0B8D4',         // Light gray (secondary text)
  textDark: '#000000',              // Black (on light backgrounds)
  
  // Ball-by-Ball Event Colors
  ballDot: '#F5F5F5',               // Dot ball - light gray
  ballSingle: '#1B5E20',            // Single/safe - dark green
  ballBoundary: '#E725AA',          // Boundary (4) - hot pink
  ballSix: '#FF6B00',               // Sixer (6) - bright orange
  ballWicket: '#B71C1C',            // Wicket - dark red
  ballWide: '#FFC107',              // Wide - amber
  ballNoBall: '#FF9800',            // No-ball - orange
  ballBye: '#9C27B0',               // Bye - purple
  ballLegBye: '#3F51B5',            // Leg-bye - indigo
  
  // Shadows & Borders
  shadowDefault: '0 4px 12px rgba(0, 0, 0, 0.15)',
  borderSubtle: '1px solid #CCCCCC',
};

// ============================================================================
// TYPOGRAPHY (Measured from PSD)
// ============================================================================

export const TYPOGRAPHY = {
  // Team Code (NZ, BAN)
  teamCode: {
    fontFamily: "'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '1px',
    lineHeight: 1,
  },
  
  // Score (120)
  score: {
    fontFamily: "'Inter', 'SF Pro Display', sans-serif",
    fontSize: '56px',
    fontWeight: 900,
    letterSpacing: '0.5px',
    lineHeight: 1,
  },
  
  // Batsman/Bowler Name (ALLEN, CONWAY, SHORIFUL)
  playerName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.25px',
    lineHeight: '1.2',
  },
  
  // Stats Values (11 (8), 0-4 (0.3))
  stats: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0px',
    lineHeight: '1.2',
  },
  
  // Labels (TOSS, LIVE FROM)
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    lineHeight: '1.2',
  },
  
  // Secondary Text (smaller, gray)
  secondary: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    letterSpacing: '0px',
    color: '#B0B8D4',
    lineHeight: '1.3',
  },
  
  // Report Headings
  reportHeading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '0px',
    lineHeight: '1.2',
  },
  
  // Report Body
  reportBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    letterSpacing: '0px',
    lineHeight: '1.5',
  },
};

// ============================================================================
// SPACING (All from PSD measurements)
// ============================================================================

export const SPACING = {
  // Overlay Container
  overlayPaddingHorizontal: '16px',
  overlayPaddingVertical: '12px',
  gapBetweenBlocks: '12px',
  itemSpacingWithinBlocks: '8px',
  
  // Responsive gaps
  mobileGap: '6px',
  tabletGap: '10px',
  desktopGap: '12px',
  
  // Standard spacing scale
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

// ============================================================================
// BORDER RADIUS (From PSD)
// ============================================================================

export const BORDER_RADIUS = {
  overlayTopLeft: '12px',
  overlayTopRight: '12px',
  overlayBottomLeft: '4px',
  overlayBottomRight: '4px',
  ballSegment: '8px',
  standard: '6px',
  small: '4px',
  large: '12px',
};

// ============================================================================
// DIMENSIONS
// ============================================================================

export const DIMENSIONS = {
  // Overlay Bar
  overlayHeight: '64px',
  overlayBarHeight: '28px',    // Ball-by-ball bar
  minBallSegmentWidth: '8px',
  maxBallSegmentWidth: '200px',
  ballSegmentGap: '1px',
  
  // Team Blocks
  teamBlockWidth: '80px',
  
  // Button Sizes
  largeButtonWidth: '72px',
  largeButtonHeight: '56px',
  actionButtonHeight: '44px',
  
  // Report Dimensions
  reportWidth: '1200px',
  reportBattingHeight: '1600px',
  reportBowlingHeight: '800px',
  reportPartnershipHeight: '600px',
};

// ============================================================================
// BREAKPOINTS (Responsive Design)
// ============================================================================

export const BREAKPOINTS = {
  mobile: '540px',       // 960×540
  tablet: '768px',       // iPad and above
  desktop: '1280px',     // 1280×720 (minimum)
  fullHD: '1920px',      // 1920×1080
  '4K': '2560px',        // 2560×1440+
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATIONS = {
  buttonClick: '0.3s',
  statsUpdate: '0.2s',
  ballSegmentSlide: '0.3s',
  overlaySync: '<100ms',
  toastDisplay: '2s',
  fadeIn: 'fade-in 0.2s ease-in-out',
  slideDown: 'slide-down 0.3s ease-out',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  default: COLORS.shadowDefault,
  sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
  md: '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.25)',
};

// ============================================================================
// TEAM COLORS (Customizable per match, defaults provided)
// ============================================================================

export const TEAM_COLORS = {
  newZealand: {
    primary: '#1B5E20',    // Dark green
    secondary: '#4CAF50',  // Light green
    accent: '#81C784',     // Accent green
  },
  bangladesh: {
    primary: '#8B0000',    // Maroon
    secondary: '#C41C3B',  // Bright maroon
    accent: '#E57373',     // Light red
  },
  india: {
    primary: '#1565C0',    // Blue
    secondary: '#1976D2',  // Bright blue
    accent: '#42A5F5',     // Light blue
  },
  pakistan: {
    primary: '#00796B',    // Dark teal
    secondary: '#009688',  // Teal
    accent: '#4DB6AC',     // Light teal
  },
};

// ============================================================================
// BALL EVENT COLOR MAP
// ============================================================================

export const BALL_EVENT_COLORS = {
  dot: COLORS.ballDot,
  single: COLORS.ballSingle,
  'double': COLORS.ballSingle,
  'three': COLORS.ballSingle,
  boundary: COLORS.ballBoundary,
  'four': COLORS.ballBoundary,
  six: COLORS.ballSix,
  wicket: COLORS.ballWicket,
  wide: COLORS.ballWide,
  'no-ball': COLORS.ballNoBall,
  bye: COLORS.ballBye,
  'leg-bye': COLORS.ballLegBye,
};

// ============================================================================
// EXPORT QUALITY SETTINGS
// ============================================================================

export const EXPORT_QUALITY = {
  png: {
    dpi: 300,
    quality: 0.95,
    formats: {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '2K': { width: 2560, height: 1440 },
      '4K': { width: 3840, height: 2160 },
    },
  },
  pdf: {
    format: 'A4',
    orientation: 'portrait',
    margin: '10mm',
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  maxPlayersPerTeam: 11,
  maxBowlersPerTeam: 4,
  maxBallsPerMatch: 300,      // For Test cricket
  minOversForStats: 0.1,
  maxRunsPerBall: 6,
  maxExtras: 999,
};

// ============================================================================
// DEFAULT MATCH CONFIG
// ============================================================================

export const DEFAULT_MATCH_CONFIG = {
  format: 'ODI',
  oversPerInning: 50,
  ballsPerOver: 6,
  minPlayers: 11,
  minBowlers: 4,
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  'addSingleRun': '1',
  'addFourRuns': '4',
  'addSixRuns': '6',
  'recordWicket': 'w',
  'undo': 'ctrl+z',
  'redo': 'ctrl+y',
  'swapBatsmen': 's',
  'changeBowler': 'b',
  'editExtras': 'e',
  'deliveryVariants': 'd',
  'downloadReports': 'ctrl+shift+d',
};

// ============================================================================
// REPORT CONFIGURATION
// ============================================================================

export const REPORT_CONFIG = {
  batting: {
    sortBy: 'battingOrder',    // or 'runs', 'strikeRate'
    includeProjections: true,
    showFallOfWickets: true,
  },
  bowling: {
    sortBy: 'overs',           // or 'wickets', 'economy'
    includeEconomy: true,
    showMaidens: true,
  },
  partnership: {
    includeChart: true,
    chartType: 'line',         // or 'area'
    gridInterval: 10,          // balls
  },
  main: {
    includeProjections: true,
    showCRR: true,
    showRRR: true,
  },
};

// Export all as single object
export const DESIGN_TOKENS = {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  DIMENSIONS,
  BREAKPOINTS,
  ANIMATIONS,
  SHADOWS,
  TEAM_COLORS,
  BALL_EVENT_COLORS,
  EXPORT_QUALITY,
  VALIDATION,
  DEFAULT_MATCH_CONFIG,
  KEYBOARD_SHORTCUTS,
  REPORT_CONFIG,
};

export default DESIGN_TOKENS;
