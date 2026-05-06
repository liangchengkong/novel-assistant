import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import OutlinePage from '../pages/OutlinePage/OutlinePage';
import WorkspacePage from '../pages/WorkspacePage/WorkspacePage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'outline', element: <OutlinePage /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default router;
