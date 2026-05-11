import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockProjects, type MockProject } from '../../mocks/novelMockData';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MockProject[]>(() => mockProjects.map((project) => ({ ...project })));

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects],
  );

  function handleCreateProject() {
    const title = window.prompt('请输入小说名称', '未命名小说');
    if (!title?.trim()) return;

    const now = new Date().toISOString();
    setProjects((prev) => [
      {
        id: `mock-project-${Date.now()}`,
        title: title.trim(),
        genre: '未分类',
        inspiration: '',
        worldbuilding: '',
        characters: '',
        keyEvents: [],
        storyline: [],
        volumes: [],
        chapters: [],
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>我的作品</h2>
          <p>当前使用前端 mock 数据，刷新后会恢复初始状态。</p>
        </div>
        <button type="button" onClick={handleCreateProject} className="btn-primary">
          + 新建小说
        </button>
      </div>

      <section className="projects-container">
        <div className="projects-grid">
          {sortedProjects.map((project) => (
            <Link
              key={project.id}
              to={`/workspace?project=${encodeURIComponent(project.id)}`}
              className="project-card"
            >
              <div className={getCoverClassName(project.id)}>
                <span>{project.title.replace(/[《》]/g, '').slice(0, 2)}</span>
              </div>
              <div className="project-info">
                <div className="project-title">{project.title}</div>
                <div className="project-summary">{project.inspiration || '暂未填写创作灵感'}</div>
                <div className="project-meta">
                  <span>{project.genre}</span>
                  <span>{formatModifiedTime(project.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
