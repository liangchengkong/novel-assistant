import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project, AppSettings } from '../types';

interface AppState {
  currentProject: Project | null;
  projects: Project[];
  settings: AppSettings;
  sidebarCollapsed: boolean;
}

type AppAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const initialState: AppState = {
  currentProject: null,
  projects: [
    { id: '1', title: '《星际拾荒者》', genre: '科幻 / 废土', lastModified: '2 小时前修改', coverColor: 'from-[#a8caba] to-[#5b8c85]' },
    { id: '2', title: '《剑道长生》', genre: '仙侠 / 修真', lastModified: '昨天修改', coverColor: 'from-[#d4b8b8] to-[#a37c7c]' },
    { id: '3', title: '《都市诡闻录》', genre: '悬疑 / 灵异', lastModified: '3 天前修改', coverColor: 'from-[#b8c1d4] to-[#7c8ea3]' },
  ],
  settings: {
    apiKey: '',
    apiProvider: 'openai',
    darkMode: false,
    fontFamily: 'serif',
    autoSave: true,
    aiPolishLevel: 'moderate',
  },
  sidebarCollapsed: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
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
