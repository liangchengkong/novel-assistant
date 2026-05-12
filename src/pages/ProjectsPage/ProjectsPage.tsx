import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, createProject, getProject, type ProjectSummary } from '../../api/novelApi';
import { useApp } from '../../context/AppContext';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { dispatch } = useApp();

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateProject() {
    const title = window.prompt('请输入小说名称', '未命名小说');
    if (!title?.trim()) return;

    try {
      const project = await createProject({ title: title.trim() });
      const fullProject = await getProject(project.id);
      dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: fullProject });
      navigate('/outline');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  }

  async function handleSelectProject(project: ProjectSummary) {
    try {
      const fullProject = await getProject(project.id);
      dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: fullProject });
      navigate('/outline');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()),
    [projects],
  );

  if (loading) {
    return (
      <div className="page-loading">
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <p>加载失败：{error}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>我的作品</h2>
          <p>共 {projects.length} 部作品</p>
        </div>
        <button type="button" onClick={handleCreateProject} className="btn-primary">
          + 新建小说
        </button>
      </div>

      <section className="projects-container">
        {sortedProjects.length === 0 ? (
          <div className="projects-empty">
            <p>暂无作品，点击上方「新建小说」开始创作</p>
          </div>
        ) : (
          <div className="projects-grid">
            {sortedProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSelectProject(project)}
                className="project-card"
              >
                <div className={getCoverClassName(project.id)}>
                  <span>{project.title.replace(/[《》]/g, '').slice(0, 2)}</span>
                </div>
                <div className="project-info">
                  <div className="project-title">{project.title}</div>
                  <div className="project-summary">{project.summary || '暂未填写创作灵感'}</div>
                  <div className="project-meta">
                    <span>{project.genre}</span>
                    <span>{formatModifiedTime(project.lastModified)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function getCoverClassName(id: string) {
  const index = Math.abs([...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 3;
  return `project-cover tone-${index + 1}`;
}

function formatModifiedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
