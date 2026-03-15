/**
 * Ball Event Color Mapping & Event Utils
 * Maps ball events to colors for the ball-by-ball bar
 */

import { BALL_EVENT_COLORS } from './design-tokens.js';

export const BALL_EVENTS = {
  DOT: 'dot',
  SINGLE: 'single',
  DOUBLE: 'double',
  THREE: 'three',
  BOUNDARY: 'four',
  SIX: 'six',
  WICKET: 'wicket',
  WIDE: 'wide',
  NO_BALL: 'no-ball',
  BYE: 'bye',
  LEG_BYE: 'leg-bye',
};

export const getColorForBallEvent = (eventType) => {
  return BALL_EVENT_COLORS[eventType] || BALL_EVENT_COLORS.dot;
};

export const getEventLabel = (eventType) => {
  const labels = {
    [BALL_EVENTS.DOT]: 'Dot',
    [BALL_EVENTS.SINGLE]: 'Single',
    [BALL_EVENTS.DOUBLE]: 'Double',
    [BALL_EVENTS.THREE]: 'Three',
    [BALL_EVENTS.BOUNDARY]: 'Four',
    [BALL_EVENTS.SIX]: 'Six',
    [BALL_EVENTS.WICKET]: 'Wicket',
    [BALL_EVENTS.WIDE]: 'Wide',
    [BALL_EVENTS.NO_BALL]: 'No-ball',
    [BALL_EVENTS.BYE]: 'Bye',
    [BALL_EVENTS.LEG_BYE]: 'Leg-bye',
  };
  return labels[eventType] || 'Unknown';
};

/**
 * Convert ball history array to visual segments for ball-by-ball bar
 */
export const createBallSegments = (ballHistory) => {
  return ballHistory.map((ball, index) => ({
    id: `ball-${index + 1}`,
    ballNumber: index + 1,
    eventType: ball.eventType,
    color: getColorForBallEvent(ball.eventType),
    label: getEventLabel(ball.eventType),
    runs: ball.runs || 0,
    timestamp: ball.timestamp,
  }));
};

/**
 * Calculate strike rate from runs and balls
 */
export const calculateStrikeRate = (runs, balls) => {
  if (!balls || balls === 0) return 0;
  return ((runs / balls) * 100).toFixed(2);
};

/**
 * Calculate economy rate from runs and overs
 */
export const calculateEconomy = (runs, overs) => {
  if (!overs || overs === 0) return 0;
  const totalBalls = Math.floor(overs) * 6 + (overs % 1) * 10;
  return (runs / totalBalls * 6).toFixed(2);
};

/**
 * Convert overs format (35.2) to total balls
 */
export const oversToBalls = (oversString) => {
  const [overs, balls] = oversString.toString().split('.').map(Number);
  return (overs * 6) + (balls || 0);
};

/**
 * Convert total balls to overs format (e.g., 212 balls = 35.2)
 */
export const ballsToOvers = (totalBalls) => {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return `${overs}.${balls}`;
};

/**
 * Format nationality/team code to display
 */
export const formatTeamCode = (code) => {
  return code?.toUpperCase() || 'XXX';
};

/**
 * Generate default batsman object
 */
export const createBatsman = (id, name, number) => ({
  id,
  name,
  number,
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0,
  strikeRate: '0.00',
  status: 'yet to bat',
});

/**
 * Generate default bowler object
 */
export const createBowler = (id, name, number) => ({
  id,
  name,
  number,
  overs: '0.0',
  maidens: 0,
  runs: 0,
  wickets: 0,
  economy: '0.00',
});

/**
 * Validate ball event data
 */
export const validateBallEvent = (event) => {
  const { eventType, runs = 0, ballNumber } = event;
  
  if (!eventType || !Object.values(BALL_EVENTS).includes(eventType)) {
    throw new Error(`Invalid ball event type: ${eventType}`);
  }
  
  if (runs < 0 || runs > 6) {
    throw new Error(`Invalid runs: ${runs}. Must be 0-6`);
  }
  
  return true;
};

export default {
  BALL_EVENTS,
  getColorForBallEvent,
  getEventLabel,
  createBallSegments,
  calculateStrikeRate,
  calculateEconomy,
  oversToBalls,
  ballsToOvers,
  formatTeamCode,
  createBatsman,
  createBowler,
  validateBallEvent,
};
