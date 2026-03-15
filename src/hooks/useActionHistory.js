/**
 * useActionHistory - Custom React Hook for Undo/Redo Functionality
 * Manages action history with configurable stack size and action types
 */

import { useCallback, useReducer } from 'react';

/**
 * Action types for the history reducer
 */
const ACTION_TYPES = {
  PUSH: 'PUSH', // Add new action to history
  UNDO: 'UNDO', // Go back one action
  REDO: 'REDO', // Go forward one action
  RESET: 'RESET', // Clear all history
  APPLY: 'APPLY', // Apply an action without adding to history
};

/**
 * Reducer function for managing action history state
 */
const historyReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.PUSH: {
      // Remove any redo history when new action is performed
      const newPast = [...state.past, state.present];
      return {
        past: newPast.slice(-state.maxSize), // Keep only last maxSize items
        present: action.payload,
        future: [],
      };
    }

    case ACTION_TYPES.UNDO:
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };

    case ACTION_TYPES.REDO:
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };

    case ACTION_TYPES.RESET:
      return {
        past: [],
        present: action.payload || {},
        future: [],
      };

    case ACTION_TYPES.APPLY:
      // Apply action without adding to history (for initial state)
      return {
        ...state,
        present: action.payload,
      };

    default:
      return state;
  }
};

/**
 * useActionHistory Hook
 * @param {Object} initialState - Initial state object
 * @param {number} maxSize - Maximum history stack size (default: 50)
 * @returns {Object} History state and control functions
 */
export const useActionHistory = (initialState = {}, maxSize = 50) => {
  const [state, dispatch] = useReducer(
    historyReducer,
    {
      past: [],
      present: initialState,
      future: [],
      maxSize,
    }
  );

  /**
   * Push new action to history
   * @param {Object} action - Action object to store
   */
  const pushAction = useCallback((action) => {
    dispatch({
      type: ACTION_TYPES.PUSH,
      payload: action,
    });
  }, []);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    dispatch({ type: ACTION_TYPES.UNDO });
  }, []);

  /**
   * Redo undone action
   */
  const redo = useCallback(() => {
    dispatch({ type: ACTION_TYPES.REDO });
  }, []);

  /**
   * Reset history to initial state
   * @param {Object} newInitialState - New initial state (optional)
   */
  const reset = useCallback((newInitialState = {}) => {
    dispatch({
      type: ACTION_TYPES.RESET,
      payload: newInitialState,
    });
  }, []);

  /**
   * Apply action without adding to history (for internal updates)
   * @param {Object} action - Action to apply
   */
  const apply = useCallback((action) => {
    dispatch({
      type: ACTION_TYPES.APPLY,
      payload: action,
    });
  }, []);

  /**
   * Get current state
   */
  const getCurrentState = useCallback(() => state.present, [state.present]);

  /**
   * Check if undo is available
   */
  const canUndo = useCallback(() => state.past.length > 0, [state.past.length]);

  /**
   * Check if redo is available
   */
  const canRedo = useCallback(() => state.future.length > 0, [state.future.length]);

  /**
   * Get history statistics
   */
  const getStats = useCallback(() => ({
    pastSize: state.past.length,
    futureSize: state.future.length,
    totalActions: state.past.length + state.future.length,
    maxSize: state.maxSize,
  }), [state.past.length, state.future.length, state.maxSize]);

  /**
   * Clear future (redo) stack
   * Used when new action is performed after undo
   */
  const clearFuture = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.RESET,
      payload: state.present,
    });
  }, [state.present]);

  return {
    // State
    state: state.present,
    history: state,

    // Actions
    pushAction,
    undo,
    redo,
    reset,
    apply,
    clearFuture,

    // Queries
    getCurrentState,
    canUndo,
    canRedo,
    getStats,
  };
};

/**
 * useMatchDataHistory - Specialized hook for match data with common actions
 * Handles: Add runs, wicket, bowler change, batsman swap, extras
 */
export const useMatchDataHistory = (initialMatchData = {}) => {
  const history = useActionHistory(initialMatchData, 50);

  /**
   * Action: Add runs
   */
  const addRuns = useCallback((runs, ballType = 'single', batsmanName = '') => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      runs: (current.runs || 0) + runs,
      ballHistory: [...(current.ballHistory || []), { type: ballType, runs, timestamp: new Date() }],
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Action: Record wicket
   */
  const recordWicket = useCallback((batsmanName, dismissalType, bowlerName) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      wickets: (current.wickets || 0) + 1,
      batsmansOut: [...(current.batsmansOut || []), batsmanName],
      ballHistory: [
        ...(current.ballHistory || []),
        { type: 'wicket', batsman: batsmanName, dismissal: dismissalType, bowler: bowlerName, timestamp: new Date() },
      ],
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Action: Change bowler
   */
  const changeBowler = useCallback((newBowlerName) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      currentBowler: newBowlerName,
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Action: Swap batsmen (strike)
   */
  const swapBatsmen = useCallback(() => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      batsman: current.nonStriker,
      nonStriker: current.batsman,
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Action: Add extras (wides, no-balls, byes, leg-byes)
   */
  const addExtras = useCallback((extraType, runs) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      extras: {
        ...(current.extras || {}),
        [extraType]: ((current.extras?.[extraType] || 0) + runs),
      },
      ballHistory: [
        ...(current.ballHistory || []),
        { type: extraType, runs, timestamp: new Date() },
      ],
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Action: Update batsman stats
   */
  const updateBatsmanStats = useCallback((batsmanName, stats = {}) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      batting: (current.batting || []).map(b =>
        b.name === batsmanName ? { ...b, ...stats } : b
      ),
    };
    history.pushAction(updated);
  }, [history]);

  return {
    ...history,
    // Specialized actions
    addRuns,
    recordWicket,
    changeBowler,
    swapBatsmen,
    addExtras,
    updateBatsmanStats,
  };
};

/**
 * useFormHistory - Specialized hook for form input history
 * Useful for complex forms with multiple fields
 */
export const useFormHistory = (initialFormData = {}) => {
  const history = useActionHistory(initialFormData, 30);

  /**
   * Update form field
   */
  const updateField = useCallback((fieldName, value) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      [fieldName]: value,
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((fields = {}) => {
    const current = history.getCurrentState();
    const updated = {
      ...current,
      ...fields,
    };
    history.pushAction(updated);
  }, [history]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((initial = {}) => {
    history.reset(initial);
  }, [history]);

  return {
    ...history,
    updateField,
    updateFields,
    resetForm,
  };
};

export default useActionHistory;
