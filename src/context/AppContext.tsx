import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { ProjectDetail } from '../api/novelApi';

interface AppState {
  sidebarCollapsed: boolean;
  currentProjectId: string | null;
  currentProject: ProjectDetail | null;
}

type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CURRENT_PROJECT'; projectId: string; project: ProjectDetail }
  | { type: 'CLEAR_CURRENT_PROJECT' };

const initialState: AppState = {
  sidebarCollapsed: false,
  currentProjectId: null,
  currentProject: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProjectId: action.projectId, currentProject: action.project };
    case 'CLEAR_CURRENT_PROJECT':
      return { ...state, currentProjectId: null, currentProject: null };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
