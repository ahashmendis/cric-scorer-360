import React, { useMemo } from 'react';
import styles from './BallByBallBar.module.css';

/**
 * BALL-BY-BALL BAR COMPONENT
 * Hardcoded with PSD Reference (Images 1 & 2)
 * Shows match flow with team colors and events
 */
const BallByBallBar = ({ matchData }) => {
  const ballSequence = useMemo(() => {
    if (!matchData?.ballsHistory) return [];
    
    return matchData.ballsHistory.map((ball, idx) => {
      let color = '#F5F5F5'; // Dot (default)
      let label = '•';
      let event = 'Dot';

      if (ball.runs === 1) {
        color = '#1B5E20';
        label = '1';
        event = 'Single';
      } else if (ball.runs === 4) {
        color = '#E725AA';
        label = '4';
        event = 'Boundary';
      } else if (ball.runs === 6) {
        color = '#FF6B00';
        label = '6';
        event = 'Six';
      } else if (ball.isWicket) {
        color = '#B71C1C';
        label = 'W';
        event = 'Wicket';
      } else if (ball.isWide) {
        color = '#FFC107';
        label = 'Wd';
        event = 'Wide';
      } else if (ball.isNoBall) {
        color = '#FF9800';
        label = 'Nb';
        event = 'No-Ball';
      }

      return { color, label, run: idx + 1, event };
    });
  }, [matchData]);

  // Get team colors from match data
  const homeTeamColor = matchData?.teams?.batting?.color || '#1B5E20'; // Dark green
  const awayTeamColor = matchData?.teams?.bowling?.color || '#B71C1C'; // Dark red
  
  return (
    <div className={styles.container}>
      <h3>🎯 Ball-by-Ball & Match Flow</h3>
      
      {/* Hardcoded Match Flow Bars (from PSD Images 1 & 2) */}
      <div className={styles.flowSection}>
        {/* Bar 1: Home Team Perspective */}
        <div className={styles.flowBar} title="Match flow - Home team at bat">
          <div className={styles.segment} style={{ flex: 1, backgroundColor: homeTeamColor }}>
            <span className={styles.segmentText}>{matchData?.teams?.batting?.name?.substring(0, 3).toUpperCase() || 'HOME'}</span>
          </div>
          <div className={styles.segment} style={{ flex: 0.4, backgroundColor: '#E725AA' }}>
            <span className={styles.segmentText} style={{ fontSize: '11px' }}>⚡</span>
          </div>
          <div className={styles.segment} style={{ flex: 1.2, backgroundColor: homeTeamColor }}>
            <span className={styles.segmentText}>{matchData?.teams?.batting?.runs || 0}/{matchData?.teams?.batting?.wickets || 0}</span>
          </div>
          <div className={styles.segment} style={{ flex: 0.8, backgroundColor: '#E5E5E5' }}>
            <span className={styles.segmentText} style={{ color: '#333', fontSize: '11px' }}>{matchData?.teams?.batting?.overs || '0.0'}</span>
          </div>
          <div className={styles.segment} style={{ flex: 1.2, backgroundColor: awayTeamColor }}>
            <span className={styles.segmentText}>{matchData?.teams?.bowling?.name?.substring(0, 3).toUpperCase() || 'AWAY'}</span>
          </div>
        </div>

        {/* Bar 2: Away Team Perspective (Reversed) */}
        <div className={styles.flowBar} title="Match flow - Away team perspective" style={{ marginTop: '8px' }}>
          <div className={styles.segment} style={{ flex: 1.2, backgroundColor: awayTeamColor }}>
            <span className={styles.segmentText}>{matchData?.teams?.bowling?.name?.substring(0, 3).toUpperCase() || 'AWAY'}</span>
          </div>
          <div className={styles.segment} style={{ flex: 0.8, backgroundColor: '#E5E5E5' }}>
            <span className={styles.segmentText} style={{ color: '#333', fontSize: '11px' }}>-</span>
          </div>
          <div className={styles.segment} style={{ flex: 1.2, backgroundColor: awayTeamColor }}>
            <span className={styles.segmentText}>BOWLING</span>
          </div>
          <div className={styles.segment} style={{ flex: 0.4, backgroundColor: '#E725AA' }}>
            <span className={styles.segmentText} style={{ fontSize: '11px' }}>⚡</span>
          </div>
          <div className={styles.segment} style={{ flex: 1, backgroundColor: homeTeamColor }}>
            <span className={styles.segmentText}>{matchData?.teams?.batting?.name?.substring(0, 3).toUpperCase() || 'HOME'}</span>
          </div>
        </div>
      </div>

      {/* Individual Ball-by-Ball Sequence */}
      <div className={styles.ballBar}>
        <div className={styles.ballSequence}>
          {ballSequence.length === 0 ? (
            <p className={styles.noData}>No balls played yet - Match ready to start</p>
          ) : (
            ballSequence.map((ball, idx) => (
              <div
                key={idx}
                className={styles.ball}
                style={{ backgroundColor: ball.color }}
                title={`Ball ${ball.run}: ${ball.event}`}
              >
                <span className={styles.label}>{ball.label}</span>
                <span className={styles.tooltip}>{ball.event}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#F5F5F5', border: '1px solid #999' }}></div>
          <span>Dot</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#1B5E20' }}></div>
          <span>Single</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#E725AA' }}></div>
          <span>Boundary</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#FF6B00' }}></div>
          <span>Six</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#B71C1C' }}></div>
          <span>Wicket</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#FFC107' }}></div>
          <span>Wide</span>
        </div>
      </div>
    </div>
  );
};

export default BallByBallBar;
