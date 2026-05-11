import { useState } from 'react';
import type { MockChapter } from '../../mocks/novelMockData';
import ChapterCard from './ChapterCard';

interface VolumeGroupProps {
  title: string;
  chapterCount: number;
  isOpen?: boolean;
  chapters?: MockChapter[];
  onAddChapter?: () => void;
}

export default function VolumeGroup({ title, chapterCount, isOpen = false, chapters = [], onAddChapter }: VolumeGroupProps) {
  const [open, setOpen] = useState(isOpen);

  return (
    <section className={`volume-group${open ? ' open' : ''}`}>
      <button type="button" className="volume-header" onClick={() => setOpen(!open)}>
        <h4>{title}</h4>
        <span className="volume-meta">
          {chapterCount > 0 ? `共 ${chapterCount} 章 ▾` : '未拆分章节 ▾'}
        </span>
      </button>
      <div className="volume-content">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <ChapterCard key={chapter.id} {...chapter} />
          ))
        ) : (
          <div className="empty-state">
            暂无章节大纲，可点击上方“按设定自动拆分章节”生成。
          </div>
        )}
        <button type="button" className="add-timeline-btn" onClick={onAddChapter}>
          + 在此卷添加章节
        </button>
      </div>
    </section>
  );
}
