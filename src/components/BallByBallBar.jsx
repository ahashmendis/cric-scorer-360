import React, { useEffect, useRef, useCallback } from 'react';
import styles from './BallByBallBar.module.css';
import { COLORS, DIMENSIONS } from '../styles/design-tokens.js';
import { createBallSegments, getEventLabel } from '../styles/color-map.js';

/**
 * BALL-BY-BALL BAR COMPONENT
 * Matches PSD Reference (Image 4) exactly
 * 
 * Props:
 *   ballHistory: Array of ball events [{ ballNumber, eventType, runs, timestamp }, ...]
 *   onBallClick: Callback when a ball segment is clicked
 *   autoScroll: Auto-scroll to show latest balls (default: true)
 */
const BallByBallBar = ({
  ballHistory = [],
  onBallClick = () => {},
  autoScroll = true,
}) => {
  const containerRef = useRef(null);
  const segments = createBallSegments(ballHistory);

  // Auto-scroll to show latest balls
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current;
      // Scroll to right with a small delay to ensure DOM is updated
      setTimeout(() => {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      }, 0);
    }
  }, [ballHistory.length, autoScroll]);

  const handleSegmentClick = useCallback(
    (ball) => {
      onBallClick(ball);
    },
    [onBallClick]
  );

  const handleSegmentHover = useCallback((e, ball) => {
    const tooltip = e.currentTarget.querySelector(`.${styles.ballSegmentTooltip}`);
    if (tooltip) {
      tooltip.textContent = `Ball ${ball.ballNumber}: ${ball.label}`;
    }
  }, []);

  return (
    <div
      className={styles.ballByBallBar}
      ref={containerRef}
      role="region"
      aria-label="Ball-by-ball indicator bar"
    >
      {segments.length === 0 ? (
        <div className={styles.noData} style={{ color: COLORS.textSecondary }}>
          Waiting for first ball...
        </div>
      ) : (
        segments.map((segment) => (
          <div
            key={segment.id}
            className={styles.ballSegment}
            data-event={segment.eventType}
            data-ball-number={segment.ballNumber}
            style={{
              backgroundColor: segment.color,
              minWidth: DIMENSIONS.minBallSegmentWidth,
              maxWidth: DIMENSIONS.maxBallSegmentWidth,
              height: '100%',
            }}
            onClick={() => handleSegmentClick(segment)}
            onMouseEnter={(e) => handleSegmentHover(e, segment)}
            title={`Ball ${segment.ballNumber}: ${segment.label}`}
            role="button"
            tabIndex={0}
            aria-pressed="false"
            aria-label={`Ball ${segment.ballNumber}: ${segment.label}`}
          >
            {/* Visual indicator for sixes and wickets */}
            {segment.eventType === 'six' && (
              <div className={styles.ballIndicator} title="Six!">
                ⚡
              </div>
            )}
            {segment.eventType === 'wicket' && (
              <div className={styles.ballIndicator} title="Wicket!">
                ⚔️
              </div>
            )}
            {segment.eventType === 'boundary' && (
              <div className={styles.ballIndicator} title="Four!">
                ⬤
              </div>
            )}

            {/* Tooltip */}
            <div className={styles.ballSegmentTooltip}>
              {`Ball ${segment.ballNumber}: ${segment.label}`}
            </div>
          </div>
        ))
      )}

      {/* Loading indicator for live matches */}
      {ballHistory.length > 0 && (
        <div className={styles.ballSegmentLoading} title="Live updates...">
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      )}
    </div>
  );
};

export default BallByBallBar;
