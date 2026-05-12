import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createChapter,
  deleteChapter,
  deleteVolume,
  formatText,
  generateChapterDraft,
  getExportUrl,
  getProject,
  getProjects,
  getSettings,
  updateChapter,
  updateVolume,
  type BackendChapter,
  type ProjectDetail,
  type StorylineItem,
} from '../../api/novelApi';
import { useApp } from '../../context/AppContext';
import './WorkspacePage.css';

type TimelineStatus = 'completed' | 'current' | 'upcoming';

type TimelineNode = {
  id: string;
  title: string;
  desc: string;
  status: TimelineStatus;
};

type ContextMenuState =
  | {
      x: number;
      y: number;
      target: { type: 'volume'; volumeId: string; title: string };
    }
  | {
      x: number;
      y: number;
      target: { type: 'chapter'; chapter: BackendChapter };
    };

export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const projectParam = searchParams.get('project');
  const chapterParam = searchParams.get('chapter');
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activeChapterId, setActiveChapterId] = useState('');
  const [selectedVolumeId, setSelectedVolumeId] = useState('');
  const [expandedVolumeIds, setExpandedVolumeIds] = useState<Set<string>>(() => new Set());
  const [toolsOpen, setToolsOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener('click', closeContextMenu);
    window.addEventListener('blur', closeContextMenu);
    return () => {
      window.removeEventListener('click', closeContextMenu);
      window.removeEventListener('blur', closeContextMenu);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadWorkspaceSettings() {
      try {
        const settings = await getSettings();
        if (alive) setAutoSaveEnabled(settings.autoSave);
      } catch {
        if (alive) setAutoSaveEnabled(true);
      }
    }

    loadWorkspaceSettings();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadProject() {
      try {
        setLoading(true);
        setError(null);

        const projectId = projectParam || state.currentProjectId || (await getProjects())[0]?.id;
        if (!projectId) {
          if (alive) {
            setProject(null);
            setActiveChapterId('');
            setSelectedVolumeId('');
            setExpandedVolumeIds(new Set());
            setTimeline([]);
            setError('暂无作品，请先在作品管理页新建作品。');
          }
          return;
        }

        const detail = await getProject(projectId);
        if (!alive) return;

        const nextChapterId = chapterParam || detail.chapters[0]?.id || '';
        const nextChapter = detail.chapters.find((chapter) => chapter.id === nextChapterId);
        const nextVolumeId = nextChapter?.volumeId || detail.volumes[0]?.id || '';
        setProject(detail);
        setActiveChapterId(nextChapterId);
        setSelectedVolumeId(nextVolumeId);
        setExpandedVolumeIds(nextVolumeId ? new Set([nextVolumeId]) : new Set());
        setTimeline(buildTimeline(detail.storyline || []));
        dispatch({ type: 'SET_CURRENT_PROJECT', projectId: detail.id, project: detail });
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : '加载工作区失败');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProject();
    return () => {
      alive = false;
    };
  }, [chapterParam, dispatch, projectParam, state.currentProjectId]);

  const chaptersByVolume = useMemo(() => {
    const grouped = new Map<string, BackendChapter[]>();
    for (const chapter of project?.chapters || []) {
      const chapters = grouped.get(chapter.volumeId) || [];
      chapters.push(chapter);
      grouped.set(chapter.volumeId, chapters);
    }
    for (const chapters of grouped.values()) {
      chapters.sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [project?.chapters]);

  const volumes = useMemo(
    () => [...(project?.volumes || [])].sort((a, b) => a.order - b.order),
    [project?.volumes],
  );

  const activeChapter = useMemo(
    () => project?.chapters.find((chapter) => chapter.id === activeChapterId) || null,
    [activeChapterId, project?.chapters],
  );

  const activeVolumeId = activeChapter?.volumeId || selectedVolumeId;

  function syncProject(updated: ProjectDetail) {
    dispatch({ type: 'SET_CURRENT_PROJECT', projectId: updated.id, project: updated });
  }

  function applyProjectDetail(detail: ProjectDetail, preferredChapterId?: string, preferredVolumeId?: string) {
    const sortedChapters = [...detail.chapters].sort((a, b) => a.order - b.order);
    const nextChapter = preferredChapterId
      ? sortedChapters.find((chapter) => chapter.id === preferredChapterId) || null
      : null;
    const fallbackChapter = nextChapter || sortedChapters[0] || null;
    const nextVolumeId = preferredVolumeId || fallbackChapter?.volumeId || detail.volumes[0]?.id || '';

    setProject(detail);
    setActiveChapterId(fallbackChapter?.id || '');
    setSelectedVolumeId(nextVolumeId);
    setExpandedVolumeIds(nextVolumeId ? new Set([nextVolumeId]) : new Set());
    syncProject(detail);
  }

  function replaceChapter(chapter: BackendChapter) {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        chapters: prev.chapters.map((item) => item.id === chapter.id ? chapter : item),
        updatedAt: new Date().toISOString(),
      };
      syncProject(updated);
      return updated;
    });
  }

  function expandVolume(volumeId: string) {
    setExpandedVolumeIds((prev) => {
      const next = new Set(prev);
      next.add(volumeId);
      return next;
    });
  }

  function handleSelectVolume(volumeId: string) {
    setSelectedVolumeId(volumeId);
    setExpandedVolumeIds((prev) => {
      const next = new Set(prev);
      if (next.has(volumeId)) {
        next.delete(volumeId);
      } else {
        next.add(volumeId);
      }
      return next;
    });
  }

  function handleSelectChapter(chapter: BackendChapter) {
    setSelectedVolumeId(chapter.volumeId);
    expandVolume(chapter.volumeId);
    setActiveChapterId(chapter.id);
  }

  function openVolumeContextMenu(event: MouseEvent, volumeId: string, title: string) {
    event.preventDefault();
    setSelectedVolumeId(volumeId);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      target: { type: 'volume', volumeId, title },
    });
  }

  function openChapterContextMenu(event: MouseEvent, chapter: BackendChapter) {
    event.preventDefault();
    setSelectedVolumeId(chapter.volumeId);
    setActiveChapterId(chapter.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      target: { type: 'chapter', chapter },
    });
  }

  function handleContextRename() {
    if (!contextMenu) return;
    const { target } = contextMenu;
    setContextMenu(null);
    if (target.type === 'volume') {
      void handleRenameVolume(target.volumeId, target.title);
    } else {
      void handleRenameChapter(target.chapter);
    }
  }

  function handleContextDelete() {
    if (!contextMenu) return;
    const { target } = contextMenu;
    setContextMenu(null);
    if (target.type === 'volume') {
      void handleDeleteVolume(target.volumeId);
    } else {
      void handleDeleteChapter(target.chapter);
    }
  }

  async function handleAddChapter() {
    if (!project) return;

    const targetVolumeId = activeVolumeId || volumes[0]?.id;
    if (!targetVolumeId) {
      setError('请先在剧情大纲页拆分章节，生成卷后再新增章节。');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const chapter = await createChapter(project.id, {
        volumeId: targetVolumeId,
        title: `新章节 ${Date.now().toString().slice(-4)}`,
      });

      setProject((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          chapters: [...prev.chapters, chapter],
          volumes: prev.volumes.map((volume) => (
            volume.id === targetVolumeId
              ? { ...volume, chapterIds: [...(volume.chapterIds || []), chapter.id] }
              : volume
          )),
          updatedAt: new Date().toISOString(),
        };
        syncProject(updated);
        return updated;
      });
      setSelectedVolumeId(targetVolumeId);
      expandVolume(targetVolumeId);
      setActiveChapterId(chapter.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增章节失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleRenameVolume(volumeId: string, currentTitle: string) {
    const nextTitle = window.prompt('请输入新的卷名', currentTitle)?.trim();
    if (!project || !nextTitle || nextTitle === currentTitle) return;

    try {
      setSaving(true);
      setError(null);
      const volume = await updateVolume(volumeId, { title: nextTitle });
      setProject((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          volumes: prev.volumes.map((item) => item.id === volume.id ? volume : item),
          updatedAt: new Date().toISOString(),
        };
        syncProject(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名卷失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVolume(volumeId: string) {
    if (!project) return;
    const volume = project.volumes.find((item) => item.id === volumeId);
    if (!volume) return;
    const volumeChapters = chaptersByVolume.get(volumeId) || [];
    const confirmed = window.confirm(`确定删除“${volume.title}”吗？该卷下 ${volumeChapters.length} 个章节也会被删除。`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await deleteVolume(volumeId);
      setProject((prev) => {
        if (!prev) return prev;
        const remainingVolumes = prev.volumes.filter((item) => item.id !== volumeId);
        const remainingChapters = prev.chapters.filter((chapter) => chapter.volumeId !== volumeId);
        const nextChapter = remainingChapters.sort((a, b) => a.order - b.order)[0];
        const nextVolumeId = nextChapter?.volumeId || remainingVolumes[0]?.id || '';
        const updated = {
          ...prev,
          volumes: remainingVolumes,
          chapters: remainingChapters,
          updatedAt: new Date().toISOString(),
        };
        setSelectedVolumeId(nextVolumeId);
        setActiveChapterId(nextChapter?.id || '');
        setExpandedVolumeIds(nextVolumeId ? new Set([nextVolumeId]) : new Set());
        syncProject(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除卷失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleRenameChapter(chapter: BackendChapter) {
    const nextTitle = window.prompt('请输入新的章节名', chapter.title)?.trim();
    if (!project || !nextTitle || nextTitle === chapter.title) return;

    try {
      setSaving(true);
      setError(null);
      const updatedChapter = await updateChapter(project.id, chapter.id, { title: nextTitle });
      replaceChapter(updatedChapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名章节失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChapter(chapter: BackendChapter) {
    if (!project) return;
    const confirmed = window.confirm(`确定删除“${chapter.title}”吗？`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await deleteChapter(project.id, chapter.id);
      const detail = await getProject(project.id);
      const sameVolumeNextChapter = [...detail.chapters]
        .filter((item) => item.volumeId === chapter.volumeId)
        .sort((a, b) => a.order - b.order)[0];
      applyProjectDetail(detail, sameVolumeNextChapter?.id, sameVolumeNextChapter?.volumeId || chapter.volumeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除章节失败');
      window.alert(`删除章节失败：${err instanceof Error ? err.message : '请确认后端服务已重启'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateDraft() {
    if (!project || !activeChapter) return;

    try {
      setGenerating(true);
      setError(null);
      const chapter = await generateChapterDraft(project.id, activeChapter.id);
      replaceChapter(chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成正文失败');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveChapter() {
    if (!project || !activeChapter || !editorRef.current) return;

    const content = htmlToText(editorRef.current.innerHTML);
    if (content === activeChapter.content) return;

    try {
      setSaving(true);
      setError(null);
      const chapter = await updateChapter(project.id, activeChapter.id, { content });
      replaceChapter(chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存章节失败');
    } finally {
      setSaving(false);
    }
  }

  function handleEditorBlur() {
    if (autoSaveEnabled) {
      void handleSaveChapter();
    }
  }

  async function handleFormatChapter() {
    if (!project || !activeChapter || !editorRef.current) return;

    try {
      setFormatting(true);
      setError(null);
      const formatted = await formatText(editorRef.current.innerText);
      const chapter = await updateChapter(project.id, activeChapter.id, { content: formatted.text });
      replaceChapter(chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '排版失败');
    } finally {
      setFormatting(false);
    }
  }

  function handleExportTxt() {
    if (!project) return;
    window.location.href = getExportUrl(project.id);
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

  if (loading) {
    return <div className="page-loading"><p>加载工作区中...</p></div>;
  }

  if (error && !project) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  return (
    <div className="workspace-layout">
      <aside className="chapter-sidebar">
        <div className="chapter-sidebar-header">
          <h3>章节目录</h3>
          <button
            type="button"
            onClick={handleAddChapter}
            disabled={!project || volumes.length === 0 || saving}
            className="add-chapter-btn"
            title="添加章节"
          >
            +
          </button>
        </div>
        <div className="chapter-list">
          {volumes.length > 0 ? (
            volumes.map((volume) => {
              const volumeChapters = chaptersByVolume.get(volume.id) || [];
              const expanded = expandedVolumeIds.has(volume.id);
              return (
                <div key={volume.id} className="chapter-volume-group">
                  <div
                    className={`chapter-volume-row${activeVolumeId === volume.id ? ' active' : ''}`}
                    onContextMenu={(event) => openVolumeContextMenu(event, volume.id, volume.title)}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectVolume(volume.id)}
                      className="chapter-volume"
                      aria-expanded={expanded}
                    >
                      <span className="chapter-volume-arrow" aria-hidden="true">{expanded ? 'v' : '>'}</span>
                      <span className="chapter-volume-title">{volume.title}</span>
                    </button>
                  </div>
                  {expanded && (
                    <div className="chapter-volume-children">
                      {volumeChapters.length > 0 ? (
                        volumeChapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className={`chapter-item-row${activeChapterId === chapter.id ? ' active' : ''}`}
                            onContextMenu={(event) => openChapterContextMenu(event, chapter)}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectChapter(chapter)}
                              className="chapter-item"
                            >
                              <span className="chapter-item-title">{chapter.title}</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="chapter-empty">该卷暂无章节</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">暂无章节，请先在剧情大纲页拆分章节。</div>
          )}
        </div>
      </aside>

      <section className="workspace-content">
        <header className="workspace-header">
          <div className="workspace-title">
            {project?.title || '未选择作品'}<span>/ {activeChapter?.title || '未选择章节'}</span>
          </div>
          <div className="workspace-header-actions">
            {saving && <span className="workspace-save-status">保存中...</span>}
            {error && <span className="workspace-error">{error}</span>}
            {!autoSaveEnabled && (
              <button type="button" onClick={handleSaveChapter} disabled={!activeChapter || saving} className="btn-outline compact">
                {saving ? '保存中...' : '保存'}
              </button>
            )}
            <button type="button" onClick={() => setToolsOpen(true)} className="tools-toggle-btn">
              辅助工具
            </button>
          </div>
        </header>

        <div className="editor-container">
          <div
            key={activeChapter?.id || activeVolumeId}
            ref={editorRef}
            className="editor-paper"
            contentEditable={Boolean(activeChapter)}
            suppressContentEditableWarning
            onBlur={handleEditorBlur}
            dangerouslySetInnerHTML={{ __html: textToHtml(activeChapter?.content || '') }}
          />
          {generating && (
            <div className="generating-overlay">
              <div className="spinner" />
              <div className="generating-text">正在根据大纲生成正文...</div>
            </div>
          )}
        </div>
      </section>

      <aside className={`tools-panel${toolsOpen ? ' open' : ''}`}>
        <div className="tools-header">
          <h3>创作辅助工具</h3>
          <button type="button" onClick={() => setToolsOpen(false)} className="close-btn" aria-label="关闭工具面板">
            x
          </button>
        </div>
        <div className="tools-content">
          <section className="tool-section">
            <div className="tool-section-title">智能操作</div>
            <div className="action-grid">
              <ToolButton onClick={handleFormatChapter} disabled={!activeChapter || formatting} icon="T">
                {formatting ? '排版中...' : '一键排版'}
              </ToolButton>
              <ToolButton onClick={handleGenerateDraft} disabled={!activeChapter || generating} icon="A">
                生成正文
              </ToolButton>
              <ToolButton onClick={handleExportTxt} disabled={!project} icon="TXT" fullWidth>
                导出 TXT
              </ToolButton>
            </div>
          </section>

          <section className="tool-section">
            <div className="tool-section-title">本章故事线追踪</div>
            {timeline.length > 0 ? (
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
            ) : (
              <div className="empty-state">暂无故事线节点。</div>
            )}
            <button type="button" onClick={handleAddNode} className="add-timeline-btn">
              + 新增剧情节点
            </button>
          </section>
        </div>
      </aside>

      {contextMenu && (
        <div
          className="workspace-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
          role="menu"
        >
          <button type="button" onClick={handleContextRename} role="menuitem">
            重命名
          </button>
          <button type="button" onClick={handleContextDelete} className="danger" role="menuitem">
            删除
          </button>
        </div>
      )}
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

function buildTimeline(storyline: StorylineItem[]): TimelineNode[] {
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
