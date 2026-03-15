import React, { useMemo } from 'react';
import styles from './Reports.module.css';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/design-tokens.js';

/**
 * BOWLING SCORECARD - Auto-populating from match_data
 * Displays all 4 bowlers with detailed statistics
 */
const BowlingScorecard = ({
  matchData = {},
  team = {},
  onExport = () => {},
}) => {
  const bowlers = useMemo(() => {
    return (team.playingXI?.bowling || []).map((bowler) => {
      const [overs, balls] = (bowler.overs || '0.0').toString().split('.').map(Number);
      const totalBalls = (overs * 6) + (balls || 0);
      const economy = totalBalls > 0 ? (bowler.runs / totalBalls * 6).toFixed(2) : '0.00';
      
      return {
        ...bowler,
        economy,
        totalBalls,
      };
    });
  }, [team]);

  const totals = useMemo(() => {
    const runs = bowlers.reduce((sum, b) => sum + (b.runs || 0), 0);
    const wickets = bowlers.reduce((sum, b) => sum + (b.wickets || 0), 0);
    const maidens = bowlers.reduce((sum, b) => sum + (b.maidens || 0), 0);
    const totalBalls = bowlers.reduce((sum, b) => sum + (b.totalBalls || 0), 0);
    - const economy = totalBalls > 0 ? (runs / totalBalls * 6).toFixed(2) : '0.00';
    
    return { runs, wickets, maidens, economy };
  }, [bowlers]);

  return (
    <div className={styles.reportContainer}>
      {/* Header */}
      <div className={styles.reportHeader}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: team.color || COLORS.accentMaroon,
            marginRight: SPACING.md,
          }}
        />
        <div>
          <h1
            className={styles.reportTitle}
            style={{
              ...TYPOGRAPHY.reportHeading,
              color: team.color || COLORS.accentMaroon,
            }}
          >
            {team.name || 'Team B'} - Bowling
          </h1>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            {matchData.format || 'ODI'} • {matchData.venue || 'Stadium'}
          </p>
        </div>
      </div>

      {/* Bowling Table */}
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>#</th>
            <th style={{ width: '25%' }}>Bowler</th>
            <th style={{ width: '10%' }}>Overs</th>
            <th style={{ width: '8%' }}>Maidens</th>
            <th style={{ width: '10%' }}>Runs</th>
            <th style={{ width: '10%' }}>Wickets</th>
            <th style={{ width: '12%' }}>Economy</th>
            <th style={{ width: '20%' }}>Avg/Ball</th>
          </tr>
        </thead>
        <tbody>
          {bowlers.map((bowler, idx) => {
            const avgPerBall = bowler.totalBalls > 0 
              ? (bowler.runs / bowler.totalBalls).toFixed(2)
              : '0.00';
            
            return (
              <tr key={bowler.id}>
                <td>{bowler.number || idx + 1}</td>
                <td>
                  <strong
                    style={{
                      color: bowler.name === matchData.currentBowler?.name ? COLORS.accentHotPink : COLORS.textPrimary,
                    }}
                  >
                    {bowler.name}
                  </strong>
                </td>
                <td>{bowler.overs || '0.0'}</td>
                <td style={{ color: COLORS.textSecondary }}>{bowler.maidens || 0}</td>
                <td className={styles.statHighlight}>{bowler.runs || 0}</td>
                <td
                  style={{
                    color: bowler.wickets > 0 ? COLORS.ballWicket : COLORS.textSecondary,
                    fontWeight: bowler.wickets > 0 ? 700 : 400,
                  }}
                >
                  {bowler.wickets || 0}
                </td>
                <td style={{ fontWeight: 700 }}>{bowler.economy}</td>
                <td style={{ fontSize: '11px', color: COLORS.textSecondary }}>
                  {avgPerBall} per ball
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Stats */}
      <div className={styles.extrasSection}>
        <h3 style={{ marginBottom: SPACING.md }}>Bowling Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.md }}>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Total Runs</span>
            <p className={styles.statHighlight} style={{ fontSize: '24px' }}>
              {totals.runs}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Total Wickets</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.ballWicket }}>
              {totals.wickets}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Maidens</span>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {totals.maidens}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>Overall Economy</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.accentDarkGreen }}>
              {totals.economy}
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
        <button className={styles.exportBtn} onClick={() => onExport('png')} style={{ backgroundColor: COLORS.accentHotPink }}>
          📥 PNG @ 300 DPI
        </button>
        <button className={styles.exportBtn} onClick={() => onExport('pdf')} style={{ backgroundColor: COLORS.accentDarkGreen }}>
          📄 PDF A4
        </button>
        <button className={styles.exportBtn} onClick={() => onExport('csv')} style={{ backgroundColor: COLORS.overlayDarkNavy }}>
          📊 CSV
        </button>
      </div>
    </div>
  );
};

export default BowlingScorecard;
