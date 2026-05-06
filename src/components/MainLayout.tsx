import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <Sidebar />
      <main 
        className="flex-1 flex flex-col min-w-0"
        style={{ 
          backgroundColor: 'var(--bg-color)',
          position: 'relative'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
