import { Link } from 'react-router-dom';

interface ChapterCardProps {
  id: string;
  title: string;
  corePlot: string;
  characters: string;
  transition: string;
}

export default function ChapterCard({ title, corePlot, characters, transition }: ChapterCardProps) {
  return (
    <div
      className="bg-panel border border-border rounded-lg p-5 mb-4 cursor-grab relative active:cursor-grabbing"
      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
    >
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#ccc] cursor-grab select-none">⋮⋮</span>
      <div className="pl-4">
        <h4 className="mb-3 flex justify-between items-center text-base">
          {title}
          <span className="text-[13px] text-primary cursor-pointer font-normal">编辑大纲</span>
        </h4>
        <p className="text-sm text-text-muted leading-relaxed">
          <strong className="text-text-main">核心情节：</strong>{corePlot}<br />
          <strong className="text-text-main">出场人物：</strong>{characters}<br />
          <strong className="text-text-main">过渡节点：</strong>{transition}
        </p>
        <div className="mt-3">
          <Link
            to={`/workspace?action=generate&chapter=${encodeURIComponent(title)}`}
            className="btn-outline text-xs py-1 px-3 inline-block no-underline"
          >
            生成正文
          </Link>
        </div>
      </div>
    </div>
  );
}
