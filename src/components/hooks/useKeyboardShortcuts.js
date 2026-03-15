import { useEffect } from 'react';
import axios from 'axios';

const useKeyboardShortcuts = (matchData, updateMatch, recordWicket, swapBatsmen, changeBowler) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if focused on input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      // Run scoring shortcuts
      if (key === '1') {
        e.preventDefault();
        updateMatch({
          teams: {
            ...matchData.teams,
            batting: {
              ...matchData.teams.batting,
              runs: matchData.teams.batting.runs + 1,
            },
          },
        });
      }

      if (key === '4') {
        e.preventDefault();
        updateMatch({
          teams: {
            ...matchData.teams,
            batting: {
              ...matchData.teams.batting,
              runs: matchData.teams.batting.runs + 4,
            },
          },
        });
      }

      if (key === '6') {
        e.preventDefault();
        updateMatch({
          teams: {
            ...matchData.teams,
            batting: {
              ...matchData.teams.batting,
              runs: matchData.teams.batting.runs + 6,
            },
          },
        });
      }

      // Wicket shortcut (W)
      if (key === 'w') {
        e.preventDefault();
        recordWicket('bowled');
      }

      // Swap batsmen (S)
      if (key === 's') {
        e.preventDefault();
        swapBatsmen();
      }

      // Change bowler (B)
      if (key === 'b') {
        e.preventDefault();
        changeBowler(matchData.currentBowler.id);
      }

      // Wide (W with Shift)
      if (key === 'w' && e.shiftKey) {
        e.preventDefault();
        updateMatch({
          extras: {
            ...matchData.extras,
            wides: matchData.extras.wides + 1,
          },
        });
      }

      // No-ball (N)
      if (key === 'n') {
        e.preventDefault();
        updateMatch({
          extras: {
            ...matchData.extras,
            noBalls: matchData.extras.noBalls + 1,
          },
        });
      }

      // Bye (Y)
      if (key === 'y') {
        e.preventDefault();
        updateMatch({
          extras: {
            ...matchData.extras,
            byes: matchData.extras.byes + 1,
          },
        });
      }

      // Leg-bye (L)
      if (key === 'l') {
        e.preventDefault();
        updateMatch({
          extras: {
            ...matchData.extras,
            legByes: matchData.extras.legByes + 1,
          },
        });
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Undo will be handled by parent component
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (((e.ctrlKey || e.metaKey) && key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'z')) {
        e.preventDefault();
        // Redo will be handled by parent component
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [matchData, updateMatch, recordWicket, swapBatsmen, changeBowler]);
};

export default useKeyboardShortcuts;
