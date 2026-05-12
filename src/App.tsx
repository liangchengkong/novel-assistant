import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { getSettings } from './api/novelApi';
import { AppProvider } from './context/AppContext';
import router from './router';
import { applyAppPreferences } from './utils/appPreferences';

export default function App() {
  useEffect(() => {
    let alive = true;

    async function loadPreferences() {
      try {
        const settings = await getSettings();
        if (alive) applyAppPreferences(settings);
      } catch {
        // The settings page shows backend connection errors; app boot should stay usable.
      }
    }

    loadPreferences();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
