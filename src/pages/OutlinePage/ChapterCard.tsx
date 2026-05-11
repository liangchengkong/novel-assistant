import { Link } from 'react-router-dom';
import type { MockChapter } from '../../mocks/novelMockData';

type ChapterCardProps = Pick<MockChapter, 'id' | 'title' | 'corePlot' | 'characters' | 'transition'>;

export default function ChapterCard({ id, title, corePlot, characters, transition }: ChapterCardProps) {
  return (
    <article className="outline-card" draggable>
      <span className="drag-handle" aria-hidden="true">⋮⋮</span>
      <div className="outline-card-body">
        <h4>
          {title}
          <span>编辑大纲</span>
        </h4>
        <p>
          <strong>核心情节：</strong>{corePlot}<br />
          <strong>出场人物：</strong>{characters}<br />
          <strong>过渡节点：</strong>{transition}
        </p>
        <div className="outline-card-actions">
          <Link
            to={`/workspace?chapter=${encodeURIComponent(id)}`}
            className="btn-outline outline-card-link"
          >
            生成正文
          </Link>
        </div>
      </div>
    </article>
  );
}
