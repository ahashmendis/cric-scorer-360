import React, { useMemo } from 'react';
import styles from './Reports.module.css';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/design-tokens.js';
import { calculateStrikeRate } from '../../styles/color-map.js';

/**
 * BATTING SCORECARD - Auto-populating from match_data
 * Displays all 11 batsmen with detailed statistics
 */
const BattingScorecard = ({
  matchData = {},
  team = {},
  onExport = () => {},
}) => {
  const batsmen = useMemo(() => {
    return (team.playingXI?.batting || []).map((batsman, idx) => {
      const strikeRate = calculateStrikeRate(batsman.runs || 0, batsman.balls || 0);
      const status = matchData?.batsmansOut?.find(w => w.playerName === batsman.name)
        ? `c ${matchData.batsmansOut.find(w => w.playerName === batsman.name)?.bowlerName} b ${matchData.batsmansOut.find(w => w.playerName === batsman.name)?.dismissalType}`
        : 'Not Out';
      
      return {
        ...batsman,
        strikeRate,
        status,
      };
    });
  }, [team, matchData]);

  const totals = useMemo(() => {
    const runs = batsmen.reduce((sum, b) => sum + (b.runs || 0), 0);
    const wickets = matchData?.teams?.batting?.wickets || 0;
    const balls = batsmen.reduce((sum, b) => sum + (b.balls || 0), 0);
    const fours = batsmen.reduce((sum, b) => sum + (b.fours || 0), 0);
    const sixes = batsmen.reduce((sum, b) => sum + (b.sixes || 0), 0);
    
    return { runs, wickets, balls, fours, sixes };
  }, [batsmen, matchData]);

  const extras = useMemo(() => {
    const extras = matchData?.extras || {};
    return (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);
  }, [matchData]);

  const grandTotal = useMemo(() => {
    return totals.runs + extras;
  }, [totals, extras]);

  return (
    <div className={styles.reportContainer}>
      {/* Header */}
      <div className={styles.reportHeader}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: team.color || COLORS.accentDarkGreen,
            marginRight: SPACING.md,
          }}
        />
        <div>
          <h1
            className={styles.reportTitle}
            style={{
              ...TYPOGRAPHY.reportHeading,
              color: team.color || COLORS.accentDarkGreen,
            }}
          >
            {team.name || 'Team A'} - Batting
          </h1>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            {matchData.format || 'ODI'} • {matchData.venue || 'Stadium'}
          </p>
        </div>
      </div>

      {/* Batting Table */}
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>#</th>
            <th style={{ width: '25%' }}>Batter</th>
            <th style={{ width: '10%' }}>Runs</th>
            <th style={{ width: '10%' }}>Balls</th>
            <th style={{ width: '8%' }}>4s</th>
            <th style={{ width: '8%' }}>6s</th>
            <th style={{ width: '12%' }}>S/R</th>
            <th style={{ width: '22%' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {batsmen.map((batsman, idx) => (
            <tr key={batsman.id}>
              <td>{batsman.number || idx + 1}</td>
              <td>
                <strong
                  style={{
                    color: batsman.name === team.playingXI?.batting?.[0]?.name ? COLORS.accentHotPink : COLORS.textPrimary,
                  }}
                >
                  {batsman.name}
                </strong>
              </td>
              <td className={styles.statHighlight}>{batsman.runs || 0}</td>
              <td>{batsman.balls || 0}</td>
              <td>{batsman.fours || 0}</td>
              <td>{batsman.sixes || 0}</td>
              <td>{batsman.strikeRate}</td>
              <td style={{ fontSize: '11px' }}>
                {batsman.status === 'Not Out' ? (
                  <span style={{ color: COLORS.accentDarkGreen, fontWeight: 700 }}>Not Out</span>
                ) : (
                  <span style={{ color: COLORS.ballWicket }}>{batsman.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Extras Section */}
      <div className={styles.extrasSection}>
        <h3 style={{ marginBottom: SPACING.md }}>Extras</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.md }}>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Wides</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: COLORS.accentHotPink }}>
              {matchData.extras?.wides || 0}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>No-Balls</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: COLORS.accentHotPink }}>
              {matchData.extras?.noBalls || 0}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Byes</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: COLORS.accentHotPink }}>
              {matchData.extras?.byes || 0}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Leg-Byes</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: COLORS.accentHotPink }}>
              {matchData.extras?.legByes || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className={styles.totalsSection}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: SPACING.lg }}>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>Total Runs</span>
            <p style={{ fontSize: '32px', fontWeight: 900, color: COLORS.accentHotPink }}>
              {grandTotal}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>Wickets</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.ballWicket }}>
              {totals.wickets}/10
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>Overs</span>
            <p style={{ fontSize: '20px', fontWeight: 700 }}>
              {matchData.teams?.batting?.overs || '0.0'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>Current RR</span>
            <p style={{ fontSize: '20px', fontWeight: 700 }}>
              {matchData.crr || '0.00'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>Fours/Sixes</span>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>
              {totals.fours}/{totals.sixes}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: SPACING.xl, paddingTop: SPACING.lg, borderTop: `1px solid ${COLORS.textSecondary}40`, fontSize: '10px', color: COLORS.textSecondary }}>
        Generated {new Date().toLocaleString()} • Scorecard v3.0
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.lg }}>
        <button
          className={styles.exportBtn}
          onClick={() => onExport('png')}
          style={{ backgroundColor: COLORS.accentHotPink }}
        >
          📥 PNG @ 300 DPI
        </button>
        <button
          className={styles.exportBtn}
          onClick={() => onExport('pdf')}
          style={{ backgroundColor: COLORS.accentDarkGreen }}
        >
          📄 PDF A4
        </button>
        <button
          className={styles.exportBtn}
          onClick={() => onExport('csv')}
          style={{ backgroundColor: COLORS.overlayDarkNavy }}
        >
          📊 CSV
        </button>
      </div>
    </div>
  );
};

export default BattingScorecard;
