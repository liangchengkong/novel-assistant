import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createMockDraft,
  formatMockText,
  mockProjects,
  type MockChapter,
  type MockProject,
  type MockStorylineItem,
} from '../../mocks/novelMockData';
import './WorkspacePage.css';

type TimelineStatus = 'completed' | 'current' | 'upcoming';

type TimelineNode = {
  id: string;
  title: string;
  desc: string;
  status: TimelineStatus;
};

export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get('project');
  const requestedChapterId = searchParams.get('chapter');
  const initialProject = mockProjects.find((item) => item.id === requestedProjectId) || mockProjects[0];

  return (
    <WorkspaceView
      key={`${initialProject.id}:${requestedChapterId || ''}`}
      initialProject={initialProject}
      initialChapterId={requestedChapterId}
    />
  );
}

function WorkspaceView({
  initialProject,
  initialChapterId,
}: {
  initialProject: MockProject;
  initialChapterId: string | null;
}) {
  const [project, setProject] = useState<MockProject>(() => cloneProject(initialProject));
  const [activeChapterId, setActiveChapterId] = useState(initialChapterId || initialProject.chapters[0]?.id || '');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineNode[]>(() => buildTimeline(project.storyline));
  const [generating, setGenerating] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const chaptersByVolume = useMemo(() => {
    const grouped = new Map<string, MockChapter[]>();
    for (const chapter of project.chapters) {
      const chapters = grouped.get(chapter.volumeId) || [];
      chapters.push(chapter);
      grouped.set(chapter.volumeId, chapters);
    }
    for (const chapters of grouped.values()) {
      chapters.sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [project.chapters]);

  const volumes = useMemo(
    () => [...project.volumes].sort((a, b) => a.order - b.order),
    [project.volumes],
  );

  const activeChapter = useMemo(
    () => project.chapters.find((chapter) => chapter.id === activeChapterId) || null,
    [activeChapterId, project.chapters],
  );

  function replaceChapter(chapter: MockChapter) {
    setProject((prev) => ({
      ...prev,
      chapters: prev.chapters.map((item) => item.id === chapter.id ? chapter : item),
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleGenerateDraft() {
    if (!activeChapter) return;
    setGenerating(true);
    window.setTimeout(() => {
      replaceChapter({
        ...activeChapter,
        content: createMockDraft(project, activeChapter),
        revisedAt: new Date().toISOString(),
      });
      setGenerating(false);
    }, 500);
  }

  function handleSaveChapter() {
    if (!activeChapter || !editorRef.current) return;
    replaceChapter({
      ...activeChapter,
      content: htmlToText(editorRef.current.innerHTML),
      revisedAt: new Date().toISOString(),
    });
  }

  function handleFormatChapter() {
    if (!activeChapter || !editorRef.current) return;
    setFormatting(true);
    window.setTimeout(() => {
      replaceChapter({
        ...activeChapter,
        content: formatMockText(editorRef.current?.innerText || activeChapter.content),
        revisedAt: new Date().toISOString(),
      });
      setFormatting(false);
    }, 300);
  }

  function handleExportTxt() {
    const lines = [
      project.title,
      project.genre,
      '',
      ...project.chapters
        .sort((a, b) => a.order - b.order)
        .flatMap((chapter) => [chapter.title, '', chapter.content || '（本章暂无正文）', '']),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/[《》]/g, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleCompleteNode(index: number) {
    setTimeline((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'completed' };
      if (index + 1 < next.length && next[index + 1].status === 'upcoming') {
        next[index + 1] = { ...next[index + 1], status: 'current' };
      }
      return next;
    });
  }

  function handleAddNode() {
    setTimeline((prev) => [
      ...prev,
      {
        id: `timeline-${Date.now()}`,
        title: '新增剧情节点',
        desc: '输入该事件的具体描述内容。',
        status: prev.some((node) => node.status === 'current') ? 'upcoming' : 'current',
      },
    ]);
  }

  return (
    <div className="workspace-layout">
      <aside className="chapter-sidebar">
        <div className="chapter-sidebar-header">
          <h3>章节目录</h3>
          <button type="button" className="add-chapter-btn" title="添加章节">+</button>
        </div>
        <div className="chapter-list">
          {volumes.length > 0 ? (
            volumes.map((volume) => (
              <div key={volume.id}>
                <div className="chapter-volume">{volume.title}</div>
                {(chaptersByVolume.get(volume.id) || []).map((chapter) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`chapter-item${activeChapterId === chapter.id ? ' active' : ''}`}
                  >
                    {chapter.title}
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="empty-state">暂无章节，请先在剧情大纲页拆分章节。</div>
          )}
        </div>
      </aside>

      <section className="workspace-content">
        <header className="workspace-header">
          <div className="workspace-title">
            {project.title}<span>/ {activeChapter?.title || '未选择章节'}</span>
          </div>
          <button type="button" onClick={() => setToolsOpen(true)} className="tools-toggle-btn">
            辅助工具
          </button>
        </header>

        <div className="editor-container">
          <div
            key={activeChapter?.id}
            ref={editorRef}
            className="editor-paper"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleSaveChapter}
            dangerouslySetInnerHTML={{ __html: textToHtml(activeChapter?.content || '') }}
          />
          {generating && (
            <div className="generating-overlay">
              <div className="spinner" />
              <div className="generating-text">正在根据大纲生成 mock 正文...</div>
            </div>
          )}
        </div>
      </section>

      <aside className={`tools-panel${toolsOpen ? ' open' : ''}`}>
        <div className="tools-header">
          <h3>创作辅助工具</h3>
          <button type="button" onClick={() => setToolsOpen(false)} className="close-btn" aria-label="关闭工具面板">
            ×
          </button>
        </div>
        <div className="tools-content">
          <section className="tool-section">
            <div className="tool-section-title">智能操作</div>
            <div className="action-grid">
              <ToolButton onClick={handleFormatChapter} disabled={formatting} icon="✓">
                {formatting ? '排版中...' : '一键排版'}
              </ToolButton>
              <ToolButton onClick={handleGenerateDraft} disabled={generating} icon="✦">
                生成正文
              </ToolButton>
              <ToolButton onClick={handleExportTxt} icon="⇩" fullWidth>
                导出 TXT
              </ToolButton>
            </div>
          </section>

          <section className="tool-section">
            <div className="tool-section-title">本章故事线追踪</div>
            <div className="timeline">
              {timeline.map((node, index) => (
                <div key={node.id} className="timeline-item">
                  <div className={`timeline-badge ${node.status}`}>
                    {getStatusLabel(node.status)}
                    {node.status === 'current' && (
                      <button type="button" onClick={() => handleCompleteNode(index)} className="btn-text">
                        标记完成
                      </button>
                    )}
                  </div>
                  <div contentEditable suppressContentEditableWarning className="timeline-title">
                    {node.title}
                  </div>
                  <div contentEditable suppressContentEditableWarning className="timeline-desc">
                    {node.desc}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddNode} className="add-timeline-btn">
              + 新增剧情节点
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ToolButton({
  children,
  icon,
  fullWidth,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  icon: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`action-btn${fullWidth ? ' full-width' : ''}`}
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </button>
  );
}

function buildTimeline(storyline: MockStorylineItem[]): TimelineNode[] {
  return [...storyline]
    .sort((a, b) => a.order - b.order)
    .map((node, index) => ({
      id: node.id,
      title: node.title,
      desc: node.description,
      status: index === 0 ? 'current' : 'upcoming',
    }));
}

function getStatusLabel(status: TimelineStatus) {
  if (status === 'completed') return '已完成';
  if (status === 'current') return '当前节点';
  return '即将发生';
}

function textToHtml(text: string) {
  if (!text.trim()) return '<p></p>';
  return text
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

function htmlToText(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.innerText.trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cloneProject(project: MockProject): MockProject {
  return {
    ...project,
    keyEvents: [...project.keyEvents],
    storyline: project.storyline.map((item) => ({ ...item, constraints: [...item.constraints] })),
    volumes: project.volumes.map((volume) => ({ ...volume, chapterIds: [...volume.chapterIds] })),
    chapters: project.chapters.map((chapter) => ({ ...chapter })),
  };
}
