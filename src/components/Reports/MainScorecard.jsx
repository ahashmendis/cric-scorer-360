import React, { useMemo } from 'react';
import styles from './Reports.module.css';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/design-tokens.js';

/**
 * MAIN SCORECARD - Auto-populating summary view
 * Displays top batsmen, top bowlers, key match stats, and projections
 */
const MainScorecard = ({
  matchData = {},
  teamA = {},
  teamB = {},
  onExport = () => {},
}) => {
  const topBatsmen = useMemo(() => {
    return (matchData.batting || [])
      .sort((a, b) => (b.runs || 0) - (a.runs || 0))
      .slice(0, 3);
  }, [matchData]);

  const topBowlers = useMemo(() => {
    return (matchData.bowling || [])
      .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
      .slice(0, 2);
  }, [matchData]);

  const matchStats = useMemo(() => {
    const teamARuns = matchData.teamA?.runs || 0;
    const teamAWickets = matchData.teamA?.wickets || 0;
    const teamAOvers = matchData.teamA?.overs || '0.0';
    const teamBRuns = matchData.teamB?.runs || 0;
    const teamBWickets = matchData.teamB?.wickets || 0;
    const teamBOvers = matchData.teamB?.overs || '0.0';

    // Calculate run rate
    const [aOvers, aBalls] = teamAOvers.toString().split('.').map(Number);
    const aTotalBalls = (aOvers * 6) + (aBalls || 0);
    const aCRR = aTotalBalls > 0 ? (teamARuns / aTotalBalls * 6).toFixed(2) : '0.00';

    const [bOvers, bBalls] = teamBOvers.toString().split('.').map(Number);
    const bTotalBalls = (bOvers * 6) + (bBalls || 0);
    const bCRR = bTotalBalls > 0 ? (teamBRuns / bTotalBalls * 6).toFixed(2) : '0.00';

    return {
      teamA: { runs: teamARuns, wickets: teamAWickets, overs: teamAOvers, crr: aCRR },
      teamB: { runs: teamBRuns, wickets: teamBWickets, overs: teamBOvers, crr: bCRR },
    };
  }, [matchData]);

  const matchSummary = useMemo(() => {
    const diffRuns = Math.abs(matchStats.teamA.runs - matchStats.teamB.runs);
    const result = matchStats.teamA.runs > matchStats.teamB.runs
      ? `${teamA.name} leads by ${diffRuns} runs`
      : matchStats.teamB.runs > matchStats.teamA.runs
      ? `${teamB.name} leads by ${diffRuns} runs`
      : 'Match tied';

    return { result, diffRuns };
  }, [matchStats, teamA, teamB]);

  return (
    <div className={styles.reportContainer}>
      {/* Header with Logos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '4px',
              backgroundColor: teamA.color || COLORS.accentDarkGreen,
            }}
          />
          <div>
            <h2 style={{ ...TYPOGRAPHY.reportHeading, color: teamA.color, margin: 0 }}>
              {teamA.name || 'Team A'}
            </h2>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: 0 }}>
              {matchData.format || 'ODI'}
            </p>
          </div>
        </div>

        <div style={{ flex: 1, textAlign: 'center', padding: SPACING.lg }}>
          <h1
            style={{
              ...TYPOGRAPHY.reportHeading,
              color: COLORS.accentHotPink,
              margin: '0 0 8px 0',
            }}
          >
            {matchData.venue || 'Venue'}
          </h1>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: 0 }}>
            {matchData.matchType || 'Live Match'} • {new Date().toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ ...TYPOGRAPHY.reportHeading, color: teamB.color, margin: 0 }}>
              {teamB.name || 'Team B'}
            </h2>
            <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: 0 }}>
              {matchData.format || 'ODI'}
            </p>
          </div>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '4px',
              backgroundColor: teamB.color || COLORS.accentMaroon,
            }}
          />
        </div>
      </div>

      {/* Match Status Banner */}
      <div
        style={{
          backgroundColor: COLORS.accentHotPink,
          color: 'white',
          padding: SPACING.lg,
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: SPACING.xl,
          fontWeight: 700,
          fontSize: '16px',
        }}
      >
        {matchSummary.result}
      </div>

      {/* Scorecard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.xl, marginBottom: SPACING.xl }}>
        {/* Team A Score */}
        <div
          style={{
            backgroundColor: (teamA.color || COLORS.accentDarkGreen) + '15',
            padding: SPACING.lg,
            borderRadius: '4px',
            borderTop: `4px solid ${teamA.color || COLORS.accentDarkGreen}`,
          }}
        >
          <h3 style={{ margin: `0 0 ${SPACING.md}px 0`, color: teamA.color }}>
            {teamA.name}
          </h3>
          <div style={{ display: 'flex', gap: SPACING.xl, alignItems: 'baseline' }}>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Runs</p>
              <p className={styles.statHighlight} style={{ fontSize: '48px', margin: 0 }}>
                {matchStats.teamA.runs}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Wickets</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: COLORS.ballWicket, margin: 0 }}>
                {matchStats.teamA.wickets}/11
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Overs</p>
              <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
                {matchStats.teamA.overs}
              </p>
            </div>
          </div>
          <div style={{ marginTop: SPACING.lg, paddingTop: SPACING.md, borderTop: `1px solid ${COLORS.textSecondary}40` }}>
            <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Current Run Rate</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: COLORS.accentDarkGreen, margin: 0 }}>
              {matchStats.teamA.crr} per over
            </p>
          </div>
        </div>

        {/* Team B Score */}
        <div
          style={{
            backgroundColor: (teamB.color || COLORS.accentMaroon) + '15',
            padding: SPACING.lg,
            borderRadius: '4px',
            borderTop: `4px solid ${teamB.color || COLORS.accentMaroon}`,
          }}
        >
          <h3 style={{ margin: `0 0 ${SPACING.md}px 0`, color: teamB.color }}>
            {teamB.name}
          </h3>
          <div style={{ display: 'flex', gap: SPACING.xl, alignItems: 'baseline' }}>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Runs</p>
              <p className={styles.statHighlight} style={{ fontSize: '48px', margin: 0 }}>
                {matchStats.teamB.runs}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Wickets</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: COLORS.ballWicket, margin: 0 }}>
                {matchStats.teamB.wickets}/11
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Overs</p>
              <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
                {matchStats.teamB.overs}
              </p>
            </div>
          </div>
          <div style={{ marginTop: SPACING.lg, paddingTop: SPACING.md, borderTop: `1px solid ${COLORS.textSecondary}40` }}>
            <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>Current Run Rate</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: COLORS.accentMaroon, margin: 0 }}>
              {matchStats.teamB.crr} per over
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <h3 style={{ marginBottom: SPACING.md }}>Top Performers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.xl, marginBottom: SPACING.xl }}>
        {/* Top Batsmen */}
        <div>
          <h4 style={{ color: COLORS.overlayGrassGreen, marginBottom: SPACING.md }}>Top Batsmen</h4>
          <table className={styles.reportTable} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Player</th>
                <th style={{ width: '20%' }}>Runs</th>
                <th style={{ width: '20%' }}>Balls</th>
                <th style={{ width: '20%' }}>S/R</th>
              </tr>
            </thead>
            <tbody>
              {topBatsmen.map((batsman, idx) => {
                const sr = batsman.balls > 0 
                  ? ((batsman.runs / batsman.balls) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={idx}>
                    <td><strong>{batsman.name}</strong></td>
                    <td className={styles.statHighlight}>{batsman.runs || 0}</td>
                    <td>{batsman.balls || 0}</td>
                    <td style={{ fontWeight: 700 }}>{sr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {topBatsmen.length === 0 && (
            <p style={{ color: COLORS.textSecondary, fontSize: '12px', textAlign: 'center', padding: SPACING.lg }}>
              No batsmen data yet
            </p>
          )}
        </div>

        {/* Top Bowlers */}
        <div>
          <h4 style={{ color: COLORS.ballWicket, marginBottom: SPACING.md }}>Top Bowlers</h4>
          <table className={styles.reportTable} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Player</th>
                <th style={{ width: '20%' }}>Runs</th>
                <th style={{ width: '20%' }}>Wickets</th>
                <th style={{ width: '20%' }}>Econ</th>
              </tr>
            </thead>
            <tbody>
              {topBowlers.map((bowler, idx) => {
                const [overs, balls] = (bowler.overs || '0.0').toString().split('.').map(Number);
                const totalBalls = (overs * 6) + (balls || 0);
                const economy = totalBalls > 0 ? (bowler.runs / totalBalls * 6).toFixed(2) : '0.00';
                return (
                  <tr key={idx}>
                    <td><strong>{bowler.name}</strong></td>
                    <td>{bowler.runs || 0}</td>
                    <td style={{ color: COLORS.ballWicket, fontWeight: 700 }}>
                      {bowler.wickets || 0}
                    </td>
                    <td style={{ fontWeight: 700 }}>{economy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {topBowlers.length === 0 && (
            <p style={{ color: COLORS.textSecondary, fontSize: '12px', textAlign: 'center', padding: SPACING.lg }}>
              No bowlers data yet
            </p>
          )}
        </div>
      </div>

      {/* Match Info Footer */}
      <div style={{ padding: SPACING.lg, backgroundColor: COLORS.textSecondary + '10', borderRadius: '4px', marginBottom: SPACING.xl }}>
        <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: 0 }}>
          Toss: {matchData.tossWinner || 'N/A'} • Format: {matchData.format || 'N/A'} • Venue: {matchData.venue || 'N/A'}
        </p>
        <p style={{ fontSize: '11px', color: COLORS.textSecondary, margin: '4px 0 0 0' }}>
          Generated {new Date().toLocaleString()} • Scorecard v3.0
        </p>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: SPACING.md }}>
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

export default MainScorecard;
