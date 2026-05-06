import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function ProjectsPage() {
  const { state } = useApp();

  const getCoverGradient = (id: string) => {
    if (id === '1') return 'linear-gradient(135deg, #a8caba, #5b8c85)';
    if (id === '2') return 'linear-gradient(135deg, #d4b8b8, #a37c7c)';
    return 'linear-gradient(135deg, #b8c1d4, #7c8ea3)';
  };

  return (
    <>
      <div className="page-header">
        <h2>我的作品</h2>
        <button className="btn-primary">+ 新建小说</button>
      </div>
      <div 
        className="overflow-y-auto flex-1"
        style={{ padding: '32px' }}
      >
        <div 
          className="grid gap-6"
          style={{ 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
          }}
        >
          {state.projects.map((project) => (
            <Link
              key={project.id}
              to="/workspace"
              className="block overflow-hidden cursor-pointer no-underline"
              style={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{ 
                  height: '140px',
                  background: getCoverGradient(project.id)
                }} 
              />
              <div style={{ padding: '16px' }}>
                <div 
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    marginBottom: '8px',
                    color: 'var(--text-main)'
                  }}
                >
                  {project.title}
                </div>
                <div 
                  style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{project.genre}</span>
                  <span>{project.lastModified}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
