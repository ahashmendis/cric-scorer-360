import React, { useMemo } from 'react';
import styles from './Reports.module.css';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/design-tokens.js';

/**
 * PARTNERSHIP REPORT - Auto-populating from match_data
 * Displays current partnership and all partnership history
 */
const PartnershipReport = ({
  matchData = {},
  team = {},
  onExport = () => {},
}) => {
  const currentPartnership = useMemo(() => {
    const batsman = matchData.batsman || {};
    const nonStriker = matchData.nonStriker || {};
    const runs = (batsman.runsInPartnership || 0) + (nonStriker.runsInPartnership || 0);
    const balls = (batsman.ballsInPartnership || 0) + (nonStriker.ballsInPartnership || 0);
    const strikeRate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';
    
    return {
      batsman: batsman.name,
      nonStriker: nonStriker.name,
      runs,
      balls,
      strikeRate,
      fours: (batsman.foursInPartnership || 0) + (nonStriker.foursInPartnership || 0),
      sixes: (batsman.sixesInPartnership || 0) + (nonStriker.sixesInPartnership || 0),
    };
  }, [matchData]);

  const partnerships = useMemo(() => {
    return (matchData.partnershipHistory || [])
      .map((p, idx) => {
        const sr = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(2) : '0.00';
        return { ...p, strikeRate: sr, index: idx + 1 };
      })
      .sort((a, b) => b.runs - a.runs); // Sort by runs descending
  }, [matchData]);

  const partnershipStats = useMemo(() => {
    const highestPartnership = partnerships[0] || {};
    const totalPartnershipRuns = partnerships.reduce((sum, p) => sum + (p.runs || 0), 0);
    const totalPartnershipBalls = partnerships.reduce((sum, p) => sum + (p.balls || 0), 0);
    const avgPartnershipRuns = partnerships.length > 0 
      ? (totalPartnershipRuns / partnerships.length).toFixed(1)
      : '0.0';
    
    return {
      highestPartnership,
      totalPartnershipRuns,
      avgPartnershipRuns,
      partnershipCount: partnerships.length,
    };
  }, [partnerships]);

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
            {team.name || 'Team B'} - Partnerships
          </h1>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            {matchData.format || 'ODI'} • {matchData.venue || 'Stadium'}
          </p>
        </div>
      </div>

      {/* Current Partnership Highlight */}
      <div
        style={{
          backgroundColor: COLORS.overlayGrassGreen + '15',
          padding: SPACING.lg,
          borderRadius: '8px',
          marginBottom: SPACING.xl,
          borderLeft: `4px solid ${COLORS.overlayGrassGreen}`,
        }}
      >
        <h3 style={{ marginBottom: SPACING.md, color: COLORS.overlayGrassGreen }}>Current Partnership</h3>
        <div style={{ display: 'flex', gap: SPACING.xl, justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>Batsman</p>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>{currentPartnership.batsman || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>Non-Striker</p>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>{currentPartnership.nonStriker || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>Partnership Runs</p>
            <p
              className={styles.statHighlight}
              style={{ fontSize: '24px', margin: 0 }}
            >
              {currentPartnership.runs}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>Balls</p>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>{currentPartnership.balls}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>Strike Rate</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: COLORS.accentHotPink }}>
              {currentPartnership.strikeRate}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>4s/6s</p>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>
              {currentPartnership.fours}/{currentPartnership.sixes}
            </p>
          </div>
        </div>
      </div>

      {/* Partnership Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.md, marginBottom: SPACING.xl }}>
        <div style={{ padding: SPACING.md, backgroundColor: COLORS.textSecondary + '10', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '4px' }}>Total Partnerships</p>
          <p style={{ fontSize: '28px', fontWeight: 700 }}>{partnershipStats.partnershipCount}</p>
        </div>
        <div style={{ padding: SPACING.md, backgroundColor: COLORS.textSecondary + '10', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '4px' }}>Avg Partnership</p>
          <p style={{ fontSize: '28px', fontWeight: 700 }}>{partnershipStats.avgPartnershipRuns}</p>
        </div>
        <div style={{ padding: SPACING.md, backgroundColor: COLORS.textSecondary + '10', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '4px' }}>Highest Partnership</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: COLORS.accentHotPink }}>
            {partnershipStats.highestPartnership.runs || '-'}
          </p>
        </div>
        <div style={{ padding: SPACING.md, backgroundColor: COLORS.textSecondary + '10', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '4px' }}>Total Partnership Runs</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: COLORS.overlayGrassGreen }}>
            {partnershipStats.totalPartnershipRuns}
          </p>
        </div>
      </div>

      {/* Partnership History Table */}
      <h3 style={{ marginBottom: SPACING.md }}>Partnership History</h3>
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>#</th>
            <th style={{ width: '20%' }}>Batsman</th>
            <th style={{ width: '20%' }}>Non-Striker</th>
            <th style={{ width: '10%' }}>Runs</th>
            <th style={{ width: '10%' }}>Balls</th>
            <th style={{ width: '10%' }}>Strike Rate</th>
            <th style={{ width: '12%' }}>Wicket/Outcome</th>
            <th style={{ width: '13%' }}>4s/6s</th>
          </tr>
        </thead>
        <tbody>
          {partnerships.map((p) => {
            const outcome = p.dismissalType ? `${p.dismissalType}` : `Wicket ${p.wicketNumber || '-'}`;
            return (
              <tr key={p.index}>
                <td>{p.index}</td>
                <td><strong>{p.batsmanName || 'N/A'}</strong></td>
                <td>{p.nonSrikerName || 'N/A'}</td>
                <td className={styles.statHighlight}>{p.runs || 0}</td>
                <td>{p.balls || 0}</td>
                <td style={{ fontWeight: 700 }}>{p.strikeRate}</td>
                <td style={{ fontSize: '12px', color: COLORS.ballWicket }}>
                  {outcome}
                </td>
                <td><strong>{p.fours || 0}/{p.sixes || 0}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {partnerships.length === 0 && (
        <p style={{ textAlign: 'center', color: COLORS.textSecondary, padding: SPACING.xl }}>
          No completed partnerships yet
        </p>
      )}

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

export default PartnershipReport;
