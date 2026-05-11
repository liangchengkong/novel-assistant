import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-container">
        <Outlet />
      </main>
    </div>
  );
}
