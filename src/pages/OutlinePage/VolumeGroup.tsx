import { useState } from 'react';
import ChapterCard from './ChapterCard';

interface VolumeGroupProps {
  title: string;
  chapterCount: number;
  isOpen?: boolean;
  chapters?: Array<{
    id: string;
    title: string;
    corePlot: string;
    characters: string;
    transition: string;
  }>;
}

export default function VolumeGroup({ title, chapterCount, isOpen = false, chapters = [] }: VolumeGroupProps) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="mb-6 bg-panel border border-border rounded-lg overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className={`px-5 py-4 flex justify-between items-center cursor-pointer border-b border-border transition-colors ${
          open ? 'bg-[#eef5f3] border-b-primary' : 'bg-[#f8fbf9]'
        }`}
      >
        <h4 className="text-[15px] text-text-main m-0">{title}</h4>
        <span className="text-xs text-text-muted">
          {chapterCount > 0 ? `共 ${chapterCount} 章 ▼` : '未拆分章节 ▼'}
        </span>
      </div>
      {open && (
        <div className="p-5">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <ChapterCard key={chapter.id} {...chapter} />
            ))
          ) : (
            <div className="text-center py-5 text-text-muted text-sm">
              暂无章节大纲，可点击右上角"按设定自动拆分"或手动添加
            </div>
          )}
          <button className="w-full py-2 border border-dashed border-border bg-transparent text-text-muted rounded cursor-pointer text-xs mt-3 hover:border-primary hover:text-primary transition-colors">
            + 在此卷添加章节
          </button>
        </div>
      )}
    </div>
  );
}
