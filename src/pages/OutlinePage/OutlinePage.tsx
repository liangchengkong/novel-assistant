import { useEffect, useMemo, useState } from 'react';
import {
  getProject,
  getProjects,
  updateProject,
  generateStoryline,
  splitChapters,
  createChapter,
  type ProjectDetail,
  type BackendVolume,
  type BackendChapter,
} from '../../api/novelApi';
import { useApp } from '../../context/AppContext';
import VolumeGroup from './VolumeGroup';
import './OutlinePage.css';

type TabType = 'setting' | 'chapter-outline';
type SettingForm = Pick<ProjectDetail, 'inspiration' | 'worldbuilding' | 'characters'>;

export default function OutlinePage() {
  const { state, dispatch } = useApp();
  const [project, setProject] = useState<ProjectDetail | null>(state.currentProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('setting');
  const [form, setForm] = useState<SettingForm>({
    inspiration: project?.inspiration || '',
    worldbuilding: project?.worldbuilding || '',
    characters: project?.characters || '',
  });
  const [generating, setGenerating] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({ inspiration: project.inspiration, worldbuilding: project.worldbuilding, characters: project.characters });
      return;
    }
    // Context 中没有项目，加载第一个
    setLoading(true);
    getProjects()
      .then((list) => {
        if (list.length === 0) {
          setError('暂无作品，请先在 ProjectsPage 创建作品');
          return null;
        }
        return getProject(list[0].id);
      })
      .then((p) => {
        if (p) {
          setProject(p);
          dispatch({ type: 'SET_CURRENT_PROJECT', projectId: p.id, project: p });
          setForm({ inspiration: p.inspiration, worldbuilding: p.worldbuilding, characters: p.characters });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const storyline = useMemo(
    () => [...(project?.storyline || [])].sort((a, b) => a.order - b.order),
    [project?.storyline],
  );

  const volumes = useMemo(
    () => [...(project?.volumes || [])].sort((a, b) => a.order - b.order),
    [project?.volumes],
  );

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

  function handleTextChange(field: keyof SettingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveSettings() {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await updateProject(project.id, form);
      setProject((prev) => prev ? { ...prev, ...updated } : prev);
      dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: { ...project, ...updated } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateStoryline() {
    if (!project) return;
    setGenerating(true);
    try {
      const items = await generateStoryline(project.id, { keyEvents: [] });
      const updated = { ...project, storyline: items };
      setProject(updated);
      dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSplitChapters() {
    if (!project) return;
    setSplitting(true);
    try {
      const result = await splitChapters(project.id);
      const updated = { ...project, volumes: result.volumes, chapters: [] };
      setProject(updated);
      dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: updated });
      setActiveTab('chapter-outline');
    } catch (err) {
      setError(err instanceof Error ? err.message : '拆分失败');
    } finally {
      setSplitting(false);
    }
  }

  async function handleAddChapter(volumeId: string) {
    if (!project) return;
    try {
      const chapter = await createChapter(project.id, { volumeId, title: '新章节' });
      setProject((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          chapters: [...prev.chapters, chapter],
          volumes: prev.volumes.map(v =>
            v.id === volumeId ? { ...v, chapterIds: [...v.chapterIds, chapter.id] } : v
          ),
        };
        dispatch({ type: 'SET_CURRENT_PROJECT', projectId: project.id, project: updated });
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    }
  }

  if (loading) {
    return <div className="page-loading"><p>加载中...</p></div>;
  }

  if (error || !project) {
    return (
      <div className="page-error">
        <p>{error || '加载失败'}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  return (
    <div className="outline-container">
      <div className="outline-tabs" role="tablist" aria-label="大纲视图">
        <button
          type="button"
          className={`outline-tab${activeTab === 'setting' ? ' active' : ''}`}
          onClick={() => setActiveTab('setting')}
        >
          剧情设定
        </button>
        <button
          type="button"
          className={`outline-tab${activeTab === 'chapter-outline' ? ' active' : ''}`}
          onClick={() => setActiveTab('chapter-outline')}
        >
          章节大纲
        </button>
      </div>

      <div className="outline-content-area">
        {activeTab === 'setting' ? (
          <section className="setting-form">
            <div className="outline-action-bar">
              <button type="button" onClick={handleGenerateStoryline} disabled={generating} className="btn-primary">
                {generating ? '正在梳理故事线...' : '智能梳理故事线'}
              </button>
              <button type="button" onClick={handleSaveSettings} disabled={saving} className="btn-outline">
                {saving ? '保存中...' : '保存设定'}
              </button>
            </div>

            <SettingTextarea
              label="小说灵感与核心剧情走向"
              value={form.inspiration}
              placeholder="输入小说的核心灵感，例如：普通拾荒者意外接触外星文明遗迹..."
              onChange={(value) => handleTextChange('inspiration', value)}
            />

            <SettingTextarea
              label="世界观规则"
              value={form.worldbuilding}
              placeholder="描述世界背景、力量体系、特殊规则等..."
              onChange={(value) => handleTextChange('worldbuilding', value)}
            />

            <SettingTextarea
              label="主要人物设定"
              value={form.characters}
              placeholder="主角及重要配角的姓名、性格、背景、核心动机..."
              onChange={(value) => handleTextChange('characters', value)}
            />

            {storyline.length > 0 && (
              <div className="storyline-preview">
                <h4>故事线梳理完成</h4>
                <div className="timeline">
                  {storyline.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-title">{item.title}</div>
                      <div className="timeline-desc">{item.description}</div>
                    </div>
                  ))}
                </div>
                <div className="storyline-actions">
                  <button type="button" onClick={handleSplitChapters} disabled={splitting} className="btn-outline">
                    {splitting ? '正在拆分章节...' : '前往章节大纲拆分'}
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="chapter-outline-list">
            <div className="outline-action-bar">
              <button type="button" onClick={handleSplitChapters} disabled={splitting} className="btn-primary">
                {splitting ? '正在拆分章节...' : '按设定自动拆分章节'}
              </button>
            </div>

            {volumes.length > 0 ? (
              volumes.map((volume, index) => {
                const chapters = chaptersByVolume.get(volume.id) || [];
                return (
                  <VolumeGroup
                    key={volume.id}
                    title={volume.title}
                    chapterCount={chapters.length}
                    isOpen={index === 0}
                    chapters={chapters}
                    onAddChapter={() => handleAddChapter(volume.id)}
                  />
                );
              })
            ) : (
              <div className="empty-state">
                暂无章节大纲，请先点击"按设定自动拆分章节"。
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function SettingTextarea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="input-group">
      <label className="field-label">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
