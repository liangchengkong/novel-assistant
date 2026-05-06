import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/workspace', icon: '✍️', label: '创作工作区' },
  { path: '/projects', icon: '📚', label: '作品管理' },
  { path: '/outline', icon: '🗺️', label: '剧情大纲' },
  { path: '/settings', icon: '⚙️', label: '系统设置' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside
      className="flex flex-col"
      style={{
        width: state.sidebarCollapsed ? '68px' : '200px',
        backgroundColor: 'var(--panel-bg)',
        borderRight: '1px solid var(--border-color)',
        zIndex: 30,
        transition: 'width 0.3s ease'
      }}
    >
      <div
        className="flex items-center justify-between px-5 whitespace-nowrap overflow-hidden"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <h2
          className="text-lg font-semibold transition-opacity duration-300"
          style={{
            color: 'var(--primary-color)',
            opacity: state.sidebarCollapsed ? 0 : 1,
            width: state.sidebarCollapsed ? 0 : 'auto',
            margin: state.sidebarCollapsed ? 0 : 'inherit'
          }}
        >
          创作助手
        </h2>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="flex items-center justify-center w-7 h-7 border-none bg-transparent"
          style={{
            fontSize: '20px',
            color: 'var(--text-muted)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.3s',
            transform: state.sidebarCollapsed ? 'rotate(180deg)' : 'none',
            margin: state.sidebarCollapsed ? '0 auto' : 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="收起/展开侧边栏"
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '12px 0' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              `flex items-center no-underline cursor-pointer whitespace-nowrap transition-all duration-200 ${
                state.sidebarCollapsed ? 'justify-center' : ''
              }`
            }
            style={({ isActive }) => ({
              padding: state.sidebarCollapsed ? '12px 0' : '12px 24px',
              color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
              fontWeight: isActive ? 600 : 'normal',
              backgroundColor: isActive ? 'var(--hover-bg)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent'
            })}
          >
            <span
              className="text-lg min-w-[24px] text-center"
              style={{
                marginRight: state.sidebarCollapsed ? 0 : '12px',
                transition: 'margin 0.3s'
              }}
            >
              {item.icon}
            </span>
            {!state.sidebarCollapsed && (
              <span className="text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
