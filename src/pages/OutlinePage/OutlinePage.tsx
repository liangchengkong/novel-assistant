import { useMemo, useState } from 'react';
import {
  createMockChapterSplit,
  createMockStoryline,
  mockProjects,
  type MockChapter,
  type MockProject,
} from '../../mocks/novelMockData';
import VolumeGroup from './VolumeGroup';
import './OutlinePage.css';

type TabType = 'setting' | 'chapter-outline';
type SettingForm = Pick<MockProject, 'inspiration' | 'worldbuilding' | 'characters'>;

export default function OutlinePage() {
  const [activeTab, setActiveTab] = useState<TabType>('setting');
  const [project, setProject] = useState<MockProject>(() => cloneProject(mockProjects[0]));
  const [form, setForm] = useState<SettingForm>({
    inspiration: project.inspiration,
    worldbuilding: project.worldbuilding,
    characters: project.characters,
  });
  const [generating, setGenerating] = useState(false);
  const [splitting, setSplitting] = useState(false);

  const storyline = useMemo(
    () => [...project.storyline].sort((a, b) => a.order - b.order),
    [project.storyline],
  );

  const volumes = useMemo(
    () => [...project.volumes].sort((a, b) => a.order - b.order),
    [project.volumes],
  );

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

  function handleTextChange(field: keyof SettingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleGenerateStoryline() {
    setGenerating(true);
    window.setTimeout(() => {
      setProject((prev) => {
        const updated = { ...prev, ...form };
        return {
          ...updated,
          storyline: createMockStoryline(updated),
          updatedAt: new Date().toISOString(),
        };
      });
      setGenerating(false);
    }, 450);
  }

  function handleSplitChapters() {
    setSplitting(true);
    window.setTimeout(() => {
      setProject((prev) => {
        const base = prev.storyline.length > 0 ? prev : { ...prev, storyline: createMockStoryline(prev) };
        const result = createMockChapterSplit(base);
        return {
          ...base,
          volumes: result.volumes,
          chapters: result.chapters,
          updatedAt: new Date().toISOString(),
        };
      });
      setActiveTab('chapter-outline');
      setSplitting(false);
    }, 450);
  }

  function handleAddChapter(volumeId?: string) {
    const targetVolume = project.volumes.find((volume) => volume.id === volumeId) || project.volumes[0];
    if (!targetVolume) return;

    const order = project.chapters.length + 1;
    const chapter: MockChapter = {
      id: `manual-chapter-${order}`,
      volumeId: targetVolume.id,
      order,
      title: `第${order}章：新的转折`,
      corePlot: '手动添加的章节大纲，可继续编辑为正式剧情节点。',
      characters: project.characters || '沿用当前人物设定',
      transition: '承接上一章冲突，并为下一章保留悬念。',
      content: '',
      revisedAt: null,
    };

    setProject((prev) => ({
      ...prev,
      volumes: prev.volumes.map((volume) => (
        volume.id === targetVolume.id
          ? { ...volume, chapterIds: [...volume.chapterIds, chapter.id] }
          : volume
      )),
      chapters: [...prev.chapters, chapter],
      updatedAt: new Date().toISOString(),
    }));
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
              <button
                type="button"
                onClick={handleGenerateStoryline}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? '正在梳理故事线...' : '智能梳理故事线'}
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
                  <button
                    type="button"
                    onClick={handleSplitChapters}
                    disabled={splitting}
                    className="btn-outline"
                  >
                    {splitting ? '正在拆分章节...' : '前往章节大纲拆分'}
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="chapter-outline-list">
            <div className="outline-action-bar">
              <button
                type="button"
                onClick={handleSplitChapters}
                disabled={splitting}
                className="btn-primary"
              >
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
                暂无章节大纲，请先点击“按设定自动拆分章节”。
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

function cloneProject(project: MockProject): MockProject {
  return {
    ...project,
    keyEvents: [...project.keyEvents],
    storyline: project.storyline.map((item) => ({ ...item, constraints: [...item.constraints] })),
    volumes: project.volumes.map((volume) => ({ ...volume, chapterIds: [...volume.chapterIds] })),
    chapters: project.chapters.map((chapter) => ({ ...chapter })),
  };
}
