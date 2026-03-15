import React, { useMemo } from 'react';
import styles from './PerfectOverlay.module.css';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, DIMENSIONS } from '../styles/design-tokens.js';
import { calculateStrikeRate } from '../styles/color-map.js';

/**
 * PIXEL-PERFECT OVERLAY COMPONENT
 * Matches PSD Reference (Image 3) exactly
 * 
 * Props:
 *   matchData: Full match data object
 *   batsman: Current striker batsman
 *   nonStriker: Non-striker batsman
 *   bowler: Current bowler
 *   partnership: Partnership runs/balls
 *   customText: Custom overlay text { header, middle, footer }
 */
const PerfectOverlay = ({
  matchData,
  batsman,
  nonStriker,
  bowler,
  partnership,
  customText = {},
  teamA = {},
  teamB = {},
  venue = '',
  toss = {},
}) => {
  // Calculate derived values
  const strikerSR = useMemo(
    () => calculateStrikeRate(batsman?.runs || 0, batsman?.balls || 1),
    [batsman]
  );

  const bowlerEco = useMemo(() => {
    if (!bowler || !bowler.overs || bowler.overs === '0.0') return '0.00';
    const [overs, balls] = bowler.overs.toString().split('.').map(Number);
    const totalBalls = (overs * 6) + (balls || 0);
    if (totalBalls === 0) return '0.00';
    return (bowler.runs / totalBalls * 6).toFixed(2);
  }, [bowler]);

  return (
    <div
      className={styles.overlayContainer}
      style={{
        backgroundColor: COLORS.overlayGrassBg,
        padding: `${SPACING.overlayPaddingVertical} ${SPACING.overlayPaddingHorizontal}`,
        minHeight: DIMENSIONS.overlayHeight,
      }}
    >
      {/* LEFT TEAM BLOCK (Team A) */}
      <div className={styles.teamBlockLeft} style={{ backgroundColor: COLORS.overlayDarkNavy }}>
        <span
          className={styles.teamCode}
          style={{
            ...TYPOGRAPHY.teamCode,
            color: COLORS.overlayWhite,
          }}
        >
          {teamA.code || 'NZ'}
        </span>
      </div>

      {/* SCORE & BATSMAN SECTION */}
      <div className={styles.scoreBatsmanBlock}>
        {/* Main Score Row */}
        <div className={styles.scoreRow}>
          <span
            className={styles.scoreValue}
            style={{
              ...TYPOGRAPHY.score,
              color: COLORS.accentHotPink,
            }}
          >
            {teamA.runs || 0}
          </span>
          <span
            className={styles.scoreSub}
            style={{
              ...TYPOGRAPHY.secondary,
              color: COLORS.textSecondary,
            }}
          >
            ({teamA.overs || '0.0'})
          </span>
        </div>

        {/* Batsman Stats Row */}
        <div className={styles.batsmanInfo} style={{ gap: SPACING.itemSpacingWithinBlocks }}>
          <span
            className={styles.batsmanName}
            style={{
              ...TYPOGRAPHY.playerName,
              color: COLORS.textPrimary,
            }}
          >
            {batsman?.name || 'BATSMAN'}*
          </span>
          <span
            className={styles.batsmanStats}
            style={{
              ...TYPOGRAPHY.stats,
              color: COLORS.textSecondary,
            }}
          >
            {batsman?.runs || 0} ({batsman?.balls || 0})
          </span>
        </div>

        {/* Bowler Name Row */}
        <div className={styles.bowlerNameRow}>
          <span
            style={{
              ...TYPOGRAPHY.playerName,
              color: COLORS.textPrimary,
            }}
          >
            {bowler?.name || 'BOWLER'}
          </span>
          <span
            style={{
              ...TYPOGRAPHY.secondary,
              color: COLORS.textSecondary,
              marginLeft: '8px',
            }}
          >
            {bowler?.runs || 0} ({bowler?.wickets || 0})
          </span>
        </div>
      </div>

      {/* CENTER DIVIDER PANEL */}
      <div
        className={styles.dividerPanel}
        style={{
          backgroundColor: COLORS.overlayLightGray,
          padding: SPACING.itemSpacingWithinBlocks,
        }}
      >
        <div
          style={{
            ...TYPOGRAPHY.label,
            color: COLORS.textDark,
          }}
        >
          TOSS
        </div>
        <div
          style={{
            ...TYPOGRAPHY.stats,
            color: COLORS.textDark,
            fontSize: '12px',
          }}
        >
          {customText?.middle || 'LIVE FROM STADIUM'}
        </div>
        <div
          style={{
            ...TYPOGRAPHY.secondary,
            color: COLORS.textDark,
            fontSize: '11px',
          }}
        >
          {venue || 'VENUE'}
        </div>
      </div>

      {/* BOWLER SECTION */}
      <div
        className={styles.bowlerBlock}
        style={{
          backgroundColor: COLORS.accentDarkGreen,
          padding: SPACING.itemSpacingWithinBlocks,
          gap: SPACING.itemSpacingWithinBlocks,
        }}
      >
        <div
          style={{
            ...TYPOGRAPHY.playerName,
            color: COLORS.textPrimary,
          }}
        >
          {bowler?.name || 'SHORIFUL'}
        </div>
        <div
          style={{
            ...TYPOGRAPHY.stats,
            color: COLORS.textPrimary,
          }}
        >
          {bowler?.overs || '0.0'}-{bowler?.runs || 0} ({bowler?.wickets || 0})
        </div>
        {/* Run Rate Icons */}
        <div
          className={styles.bowlerIcons}
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={styles.runIcon}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i < 4 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* RIGHT TEAM BLOCK (Team B) */}
      <div
        className={styles.teamBlockRight}
        style={{ backgroundColor: COLORS.accentMaroon }}
      >
        <span
          className={styles.teamCode}
          style={{
            ...TYPOGRAPHY.teamCode,
            color: COLORS.overlayWhite,
          }}
        >
          {teamB.code || 'BAN'}
        </span>
      </div>

      {/* CUSTOM HEADER TEXT (Top-left overlay) */}
      {customText?.header && (
        <div
          className={styles.customHeader}
          style={{
            position: 'absolute',
            top: '8px',
            left: '16px',
            ...TYPOGRAPHY.label,
            color: COLORS.accentHotPink,
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {customText.header}
        </div>
      )}

      {/* PARTNERSHIP DISPLAY (Optional, bottom-right) */}
      {partnership && (
        <div
          className={styles.partnershipInfo}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '16px',
            ...TYPOGRAPHY.secondary,
            fontSize: '11px',
          }}
        >
          Partnership: {partnership.runs} ({partnership.balls})
        </div>
      )}
    </div>
  );
};

export default PerfectOverlay;
