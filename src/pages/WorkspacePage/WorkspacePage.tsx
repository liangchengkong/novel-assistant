import { useState } from 'react';

const mockChapterContent = `<p>昏暗的D级垃圾星永远笼罩在厚重的酸雨云层下，空气中弥漫着机油与铁锈混合的刺鼻气味。</p>
<p>林锐紧了紧身上那件破旧的防护服，手中的磁力探测仪发出微弱的"滴滴"声。这是他在这片废墟中连续搜寻的第七个小时，除了一堆毫无价值的废旧齿轮，一无所获。</p>
<p>"看来今天的配给粮又得减半了。"他喃喃自语，抹去护目镜上的污渍。</p>
<p>就在这时，探测仪的屏幕突然闪烁起刺眼的红光，指针疯狂地指向他脚下的那片塌陷区。没等林锐反应过来，脚下的废旧金属板发出一声沉闷的断裂声。</p>
<p>失重感瞬间袭来。</p>
<p>"该死！"</p>
<p>伴随着一阵金属碰撞的巨响，林锐直直地坠入了深不见底的黑暗裂隙之中。而在那无尽的黑暗深处，一抹幽蓝色的光芒正如同呼吸般缓缓闪烁，仿佛沉睡了千万年的巨兽，正等待着唤醒者的到来。</p>`;

const chapters = [
  { volume: '第一卷：废土崛起', items: ['第一章：废墟中的微光', '第二章：文明的遗赠', '第三章：重返地表'] },
  { volume: '第二卷：星际流亡', items: ['第四章：黑帮的追杀'] },
];

const timelineNodes = [
  { title: '准备拾荒', desc: '主角前往D级垃圾星深处寻找有价值的废弃物。', status: 'completed' as const },
  { title: '意外坠落', desc: '林锐在拾荒时遭遇塌陷，坠入深渊遗迹。这一事件打破了原本平静的生活。', status: 'current' as const },
  { title: '获得传承', desc: '在底部激活机械生命体"零"，完成初步基因改造。', status: 'upcoming' as const },
  { title: '黑帮的追杀', desc: '展示实力后引来当地黑帮觊觎，矛盾爆发。', status: 'upcoming' as const },
];

export default function WorkspacePage() {
  const [activeChapter, setActiveChapter] = useState('第一章：废墟中的微光');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [timeline, setTimeline] = useState(timelineNodes);
  const [generating] = useState(false);

  const handleCompleteNode = (index: number) => {
    setTimeline(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'completed' };
      if (index + 1 < next.length && next[index + 1].status === 'upcoming') {
        next[index + 1] = { ...next[index + 1], status: 'current' };
      }
      return next;
    });
  };

  const handleAddNode = () => {
    setTimeline(prev => [...prev, { title: '新增节点', desc: '输入该事件的具体描述内容...', status: 'upcoming' as const }]);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Chapter Sidebar */}
      <div 
        className="flex flex-col"
        style={{ 
          width: '220px',
          backgroundColor: 'var(--panel-bg)',
          borderRight: '1px solid var(--border-color)'
        }}
      >
        <div 
          className="flex justify-between items-center px-5"
          style={{ 
            paddingTop: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>章节目录</h3>
          <button 
            className="bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--primary-color)', fontSize: '16px' }}
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          {chapters.map((group) => (
            <div key={group.volume}>
              <div 
                className="px-5 font-semibold"
                style={{ 
                  paddingTop: '10px',
                  paddingBottom: '5px',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}
              >
                {group.volume}
              </div>
              {group.items.map((ch) => (
                <div
                  key={ch}
                  onClick={() => setActiveChapter(ch)}
                  className="cursor-pointer"
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    borderLeft: activeChapter === ch ? '2px solid var(--primary-color)' : '2px solid transparent',
                    backgroundColor: activeChapter === ch ? 'var(--hover-bg)' : 'transparent',
                    color: activeChapter === ch ? 'var(--primary-color)' : 'var(--text-main)',
                    fontWeight: activeChapter === ch ? 600 : 'normal'
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header 
          className="flex items-center justify-between px-6"
          style={{ 
            height: '60px',
            backgroundColor: 'var(--panel-bg)',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            《星际拾荒者》 <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '14px', marginLeft: '8px' }}>/ {activeChapter}</span>
          </div>
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="border-none cursor-pointer flex items-center"
            style={{ 
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            }}
          >
            🛠️ 辅助工具
          </button>
        </header>

        <div 
          className="flex-1 overflow-y-auto flex justify-center relative"
          style={{ padding: '24px' }}
        >
          <div
            className="editor-paper w-full min-h-full focus:outline-none"
            style={{ 
              maxWidth: '800px',
              backgroundColor: 'var(--panel-bg)',
              padding: '40px 60px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              fontSize: '17px',
              lineHeight: 2,
              color: '#333',
              textIndent: '2em'
            }}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: mockChapterContent }}
          />
          {generating && (
            <div 
              className="absolute flex flex-col items-center justify-center z-10"
              style={{ 
                top: '24px',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '800px',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(2px)',
                borderRadius: '8px'
              }}
            >
              <div 
                className="animate-spin mb-4"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--primary-color)',
                  borderRadius: '50%'
                }}
              />
              <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '14px' }}>
                AI 正在根据梗概扩写正文中...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tools Panel */}
      <aside
        className="flex flex-col absolute right-0 top-0 bottom-0"
        style={{ 
          width: '320px',
          backgroundColor: 'var(--panel-bg)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
          zIndex: 20,
          transform: toolsOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div 
          className="flex items-center justify-between px-5"
          style={{ 
            height: '60px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>创作辅助工具</h3>
          <button 
            onClick={() => setToolsOpen(false)} 
            className="bg-transparent border-none cursor-pointer"
            style={{ fontSize: '20px', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
          {/* Quick Actions */}
          <div style={{ marginBottom: '30px' }}>
            <div 
              style={{ 
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                fontWeight: 600
              }}
            >
              智能操作
            </div>
            <div 
              className="grid gap-2.5"
              style={{ gridTemplateColumns: '1fr 1fr' }}
            >
              <button 
                className="cursor-pointer flex flex-col items-center"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.color = 'var(--primary-color)';
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                }}
              >
                <span style={{ fontSize: '18px' }}>✨</span>一键排版规整
              </button>
              <button 
                className="cursor-pointer flex flex-col items-center"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.color = 'var(--primary-color)';
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                }}
              >
                <span style={{ fontSize: '18px' }}>🪄</span>AI 润色
              </button>
              <button 
                className="cursor-pointer flex flex-col items-center"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  gap: '6px',
                  gridColumn: 'span 2',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.color = 'var(--primary-color)';
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                }}
              >
                <span style={{ fontSize: '18px' }}>💾</span>导出 TXT 格式
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '30px' }}>
            <div 
              style={{ 
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                fontWeight: 600
              }}
            >
              本章故事线追踪 (点击文字即可编辑)
            </div>
            <div className="timeline">
              {timeline.map((node, index) => (
                <div key={index} className="timeline-item">
                  <div
                    className="inline-flex items-center rounded mb-1.5"
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      gap: '4px',
                      backgroundColor: node.status === 'completed'
                        ? '#e8f5e9'
                        : node.status === 'current'
                        ? 'var(--hover-bg)'
                        : '#f0f0f0',
                      color: node.status === 'completed'
                        ? '#388e3c'
                        : node.status === 'current'
                        ? 'var(--primary-color)'
                        : '#999'
                    }}
                  >
                    {node.status === 'completed' ? '已完结' : node.status === 'current' ? '当前节点' : '即将发生'}
                    {node.status === 'current' && (
                      <button
                        onClick={() => handleCompleteNode(index)}
                        className="btn-text ml-1"
                      >
                        标记完结
                      </button>
                    )}
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="font-semibold mb-1"
                    style={{ fontSize: '14px', marginBottom: '4px', outline: 'none', padding: '2px', borderRadius: '3px', transition: 'background 0.2s' }}
                  >
                    {node.title}
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, outline: 'none', padding: '2px', borderRadius: '3px', transition: 'background 0.2s' }}
                  >
                    {node.desc}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddNode}
              className="w-full cursor-pointer"
              style={{
                padding: '8px',
                border: '1px dashed var(--border-color)',
                background: 'transparent',
                color: 'var(--text-muted)',
                borderRadius: '4px',
                fontSize: '12px',
                marginTop: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              + 新增剧情节点
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
