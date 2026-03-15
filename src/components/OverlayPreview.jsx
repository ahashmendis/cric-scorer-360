import React, { useEffect, useRef } from 'react';
import styles from './OverlayPreview.module.css';

const OverlayPreview = ({ matchData }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Generate overlay HTML based on template and matchData
      const overlayHTML = generateOverlayHTML(matchData);
      const blob = new Blob([overlayHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [matchData]);

  return (
    <div className={styles.container}>
      <h3>📺 Live Overlay Preview</h3>
      <div className={styles.previewBox}>
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          title="Overlay Preview"
          sandbox="allow-same-origin"
        />
      </div>
      <p className={styles.info}>Real-time OBS preview (updating &lt;100ms)</p>
    </div>
  );
};

function generateOverlayHTML(matchData) {
  const homeTeam = matchData.teams.batting;
  const awayTeam = matchData.teams.bowling;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1280px;
          height: 720px;
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          font-family: Arial, sans-serif;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        
        .scorecard {
          width: 100%;
          padding: 40px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 3px solid #FFD700;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .score-section {
          text-align: center;
        }
        
        .team-name {
          color: #FFD700;
          font-size: 18px;
          margin-bottom: 10px;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .score {
          color: #E725AA;
          font-size: 48px;
          font-weight: bold;
          font-family: "Courier New", monospace;
        }
        
        .overs {
          color: #FFF;
          font-size: 16px;
          margin-top: 8px;
        }
        
        .divider {
          width: 3px;
          height: 100px;
          background: #FFD700;
          margin: 0 40px;
        }
        
        .batsman {
          text-align: left;
          color: #FFF;
        }
        
        .batsman-name {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .batsman-stats {
          font-size: 12px;
          color: #CBD5E1;
        }
      </style>
    </head>
    <body>
      <div class="scorecard">
        <div class="score-section">
          <div class="team-name">${homeTeam.name}</div>
          <div class="score">${homeTeam.runs}/${homeTeam.wickets}</div>
          <div class="overs">${homeTeam.overs} Overs</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="batsman">
          <div class="batsman-name">🏏 ${matchData.currentBatsmen?.striker?.name || 'Batsman'}</div>
          <div class="batsman-stats">${matchData.currentBatsmen?.striker?.runs || 0}(${matchData.currentBatsmen?.striker?.balls || 0})</div>
        </div>
        
        <div class="batsman">
          <div class="batsman-name">⚾ ${matchData.currentBowler?.name || 'Bowler'}</div>
          <div class="batsman-stats">${matchData.currentBowler?.overs || '0.0'} - ${matchData.currentBowler?.runs || 0}/${matchData.currentBowler?.wickets || 0}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default OverlayPreview;
