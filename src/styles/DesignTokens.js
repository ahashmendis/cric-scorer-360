// Design Tokens - Colors, Typography, Spacing
export const COLORS = {
  // Overlay Colors (PSD Match)
  overlayGrass: '#4CAF50',           // Grass green background
  overlayGold: '#FFD700',            // Border gold
  scoreHotPink: '#E725AA',           // Score color
  
  // Quick Action Buttons
  buttonCyan: '#06B6D4',             // +1 Run
  buttonGreen: '#10B981',            // +4 Runs
  buttonAmber: '#F59E0B',            // +6 Runs
  buttonRed: '#EF4444',              // Wicket
  buttonPurple: '#8B5CF6',           // Swap/Change
  buttonBlue: '#3B82F6',             // Bowler Change
  
  // Ball-by-Ball Events
  ballDot: '#F5F5F5',                // Dot
  ballSingle: '#1B5E20',             // Single run
  ballBoundary: '#E725AA',           // Four
  ballSix: '#FF6B00',                // Six
  ballWicket: '#B71C1C',             // Wicket
  ballWide: '#FFC107',               // Wide
  ballNoBall: '#FF9800',             // No-ball
  ballBye: '#9C27B0',                // Bye
  ballLegBye: '#3F51B5',             // Leg-bye
  
  // UI Colors
  bgDark: '#0F172A',
  bgPanel: '#1E293B',
  bgCardDark: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  border: '#475569',
  accent: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const TYPOGRAPHY = {
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  
  // Font Sizes
  h1: '32px',
  h2: '24px',
  h3: '18px',
  body: '14px',
  caption: '12px',
  
  // Font Weights
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const LAYOUT = {
  // Column widths
  leftPanelWidth: '280px',
  centerPanelWidth: '560px',
  rightPanelWidth: '360px',
  
  // Panel gaps
  panelGap: '12px',
  
  // Quick Action Button Sizes
  buttonWidth: '72px',
  buttonHeight: '56px',
  buttonGap: '12px',
  
  // Live Preview
  previewWidth: '400px',
  previewHeight: '240px',
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '300ms ease',
  slow: '500ms ease',
};

export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1280px',
  wide: '1920px',
};
