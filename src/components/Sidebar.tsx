import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const navItems = [
  { path: '/workspace', icon: '✍', label: '创作工作区' },
  { path: '/projects', icon: '📚', label: '作品管理' },
  { path: '/outline', icon: '🧭', label: '剧情大纲' },
  { path: '/settings', icon: '⚙', label: '系统设置' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside className={`sidebar${state.sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1>创作助手</h1>
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="toggle-btn"
          title="收起或展开侧边栏"
          aria-label="收起或展开侧边栏"
        >
          ‹
        </button>
      </div>

      <nav className="nav-list" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={item.label}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
