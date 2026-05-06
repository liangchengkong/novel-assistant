import { useState } from 'react';
import VolumeGroup from './VolumeGroup';

type TabType = 'setting' | 'chapter-outline';

const mockStoryline = [
  { title: '第一卷：废土崛起', desc: '主角在D级垃圾星意外获得外星引擎，完成初步基因改造。在应对黑帮追杀的过程中展露锋芒，最终抢夺飞船逃离垃圾星，踏入星际。' },
  { title: '第二卷：星际流亡', desc: '主角在混乱星域成为通缉犯，结识了落魄的机械师同伴，通过修复遗迹装备赚取第一桶金，并引出背后的大型财阀势力。' },
  { title: '第三卷：机械觉醒', desc: '主角体内的引擎开始第二阶段共鸣，揭开远古机械文明覆灭的真相。主角组建自己的舰队，正式与财阀展开正面冲突。' },
];

const mockChapters = [
  {
    id: '1',
    title: '第一章：废墟中的微光',
    corePlot: '主角林锐在D级垃圾星进行日常拾荒，遭到同行抢劫，意外掉入未知的地下遗迹。',
    characters: '林锐、独眼老李',
    transition: '展示废土环境，引出金手指线索。',
  },
  {
    id: '2',
    title: '第二章：文明的遗赠',
    corePlot: '在遗迹中发现休眠的机械生命体，激活引擎，身体被初步改造。',
    characters: '林锐、机械生命体"零"',
    transition: '解释部分世界观，主角获得初始力量。',
  },
];

export default function OutlinePage() {
  const [activeTab, setActiveTab] = useState<TabType>('setting');
  const [showStoryline, setShowStoryline] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateStoryline = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowStoryline(true);
    }, 1500);
  };

  return (
    <div 
      className="flex flex-col flex-1 overflow-hidden"
      style={{ backgroundColor: 'var(--panel-bg)' }}
    >
      {/* Tabs */}
      <div 
        className="flex px-5"
        style={{ 
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--panel-bg)'
        }}
      >
        <div
          className="cursor-pointer px-5 py-4"
          style={{
            fontSize: '15px',
            borderBottom: activeTab === 'setting' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'setting' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'setting' ? 600 : 'normal'
          }}
          onClick={() => setActiveTab('setting')}
        >
          剧情设定
        </div>
        <div
          className="cursor-pointer px-5 py-4"
          style={{
            fontSize: '15px',
            borderBottom: activeTab === 'chapter-outline' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'chapter-outline' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'chapter-outline' ? 600 : 'normal'
          }}
          onClick={() => setActiveTab('chapter-outline')}
        >
          章节大纲
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ 
          padding: '24px 32px',
          backgroundColor: 'var(--bg-color)'
        }}
      >
        {activeTab === 'setting' ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div 
              className="flex justify-end gap-3"
              style={{ marginBottom: '20px' }}
            >
              <button
                onClick={handleGenerateStoryline}
                disabled={generating}
                className="btn-primary"
                style={{ opacity: generating ? 0.6 : 1 }}
              >
                {generating ? 'AI 正在梳理故事线...' : '智能梳理故事线'}
              </button>
            </div>

            <div 
              className="mb-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--panel-bg)',
                padding: '24px',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <label 
                className="block mb-3 font-semibold"
                style={{ fontSize: '15px', color: 'var(--text-main)' }}
              >
                小说灵感 & 核心剧情走向
              </label>
              <textarea
                className="w-full outline-none resize-y"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  minHeight: '120px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.3s'
                }}
                placeholder="输入小说的核心灵感，比如：一个普通的拾荒者意外捡到外星文明的核心引擎..."
              />
            </div>

            <div 
              className="mb-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--panel-bg)',
                padding: '24px',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <label 
                className="block mb-3 font-semibold"
                style={{ fontSize: '15px', color: 'var(--text-main)' }}
              >
                世界观规则
              </label>
              <textarea
                className="w-full outline-none resize-y"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  minHeight: '120px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.3s'
                }}
                placeholder="描述世界背景、力量体系、特殊规则等..."
              />
            </div>

            <div 
              className="mb-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--panel-bg)',
                padding: '24px',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <label 
                className="block mb-3 font-semibold"
                style={{ fontSize: '15px', color: 'var(--text-main)' }}
              >
                主要人物设定
              </label>
              <textarea
                className="w-full outline-none resize-y"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  minHeight: '120px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.3s'
                }}
                placeholder="主角及重要配角的名字、性格、背景、核心动机..."
              />
            </div>

            {/* Storyline Preview */}
            {showStoryline && (
              <div 
                className="rounded-lg border border-dashed"
                style={{ 
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: 'var(--hover-bg)',
                  borderColor: 'var(--primary-color)'
                }}
              >
                <h4 
                  className="mb-4 font-semibold"
                  style={{ color: 'var(--primary-color)', fontSize: '15px' }}
                >
                  ✨ 全书故事线梳理完成
                </h4>
                <div className="timeline">
                  {mockStoryline.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div 
                        className="font-semibold mb-1"
                        style={{ fontSize: '14px' }}
                      >
                        {item.title}
                      </div>
                      <div 
                        style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-muted)',
                          lineHeight: 1.6
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                  <button
                    onClick={() => setActiveTab('chapter-outline')}
                    className="btn-outline"
                  >
                    前往章节大纲拆分
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div 
              className="flex justify-end gap-3"
              style={{ marginBottom: '20px' }}
            >
              <button className="btn-primary">
                按设定自动拆分章节
              </button>
            </div>

            <VolumeGroup
              title="第一卷：废土崛起"
              chapterCount={2}
              isOpen={true}
              chapters={mockChapters}
            />
            <VolumeGroup
              title="第二卷：星际流亡"
              chapterCount={0}
              isOpen={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
