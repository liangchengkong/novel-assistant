export type MockStorylineItem = {
  id: string;
  order: number;
  title: string;
  type: 'opening' | 'progress' | 'turning-point';
  source: string;
  description: string;
  constraints: string[];
};

export type MockVolume = {
  id: string;
  title: string;
  order: number;
  chapterIds: string[];
};

export type MockChapter = {
  id: string;
  volumeId: string;
  order: number;
  title: string;
  corePlot: string;
  characters: string;
  transition: string;
  content: string;
  revisedAt: string | null;
};

export type MockProject = {
  id: string;
  title: string;
  genre: string;
  inspiration: string;
  worldbuilding: string;
  characters: string;
  keyEvents: string[];
  storyline: MockStorylineItem[];
  volumes: MockVolume[];
  chapters: MockChapter[];
  createdAt: string;
  updatedAt: string;
};

export type MockSettings = {
  apiProvider: string;
  apiKey: string;
  autoSave: boolean;
  aiPolishLevel: 'conservative' | 'moderate' | 'aggressive';
  darkMode: boolean;
  fontFamily: string;
};

export const mockProjects: MockProject[] = [
  {
    id: 'demo-stargazer',
    title: '《星际拾荒者》',
    genre: '科幻 / 废土',
    inspiration: '底层拾荒者林铮在垃圾星发现远古机械文明遗迹，被迫卷入财阀与黑帮争夺，并逐步理解自身使命。',
    worldbuilding: '人类散落在废弃星域中，资源由财阀和黑帮控制。远古机械遗迹被视为禁区，遗迹技术能够改变星际秩序。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。零：沉睡的机械生命体，只提供信息与辅助，不直接替主角解决问题。',
    keyEvents: ['D级垃圾星拾荒', '发现地下遗迹', '激活机械生命体', '黑帮追杀', '逃离垃圾星'],
    storyline: [
      {
        id: 'story-1',
        order: 1,
        title: '垃圾星上的异常信号',
        type: 'opening',
        source: 'author-input',
        description: '林铮在日常拾荒中发现不属于当前时代的机械信号，进入地下遗迹后唤醒零，也暴露了自己的位置。',
        constraints: ['只使用已给定世界观', '不新增核心势力', '主角能力来自遗迹线索'],
      },
      {
        id: 'story-2',
        order: 2,
        title: '黑帮追杀与第一次逃亡',
        type: 'progress',
        source: 'author-input',
        description: '黑帮察觉遗迹异常并追杀林铮，林铮借助零的提示修复旧飞行器，尝试逃离垃圾星。',
        constraints: ['冲突围绕遗迹信息展开', '零只提供辅助', '逃亡过程保留代价'],
      },
      {
        id: 'story-3',
        order: 3,
        title: '进入废弃星域',
        type: 'turning-point',
        source: 'author-input',
        description: '林铮成功离开垃圾星，但发现遗迹信号连接着更大的机械文明网络，故事进入星际流亡阶段。',
        constraints: ['阶段性收束垃圾星篇章', '为后续星域探索埋线', '不提前揭开全部真相'],
      },
    ],
    volumes: [
      {
        id: 'volume-1',
        title: '第一卷：垃圾星微光',
        order: 1,
        chapterIds: ['chapter-1', 'chapter-2', 'chapter-3'],
      },
    ],
    chapters: [
      {
        id: 'chapter-1',
        volumeId: 'volume-1',
        order: 1,
        title: '第一章：酸雨下的信号',
        corePlot: '林铮在酸雨夜进入废弃回收区，发现一段异常机械信号，并决定冒险追踪。',
        characters: '林铮、零',
        transition: '以信号源打开地下遗迹入口，承接下一章的遗迹探索。',
        content: '酸雨敲在废铁棚顶，像无数细小的金属针。林铮蹲在回收区边缘，把探测器贴近一块烧焦的合金板。\n\n屏幕上跳出的频率不属于垃圾星的任何公开频道。它稳定、古老，像某种沉睡很久的呼吸。\n\n他知道自己不该继续靠近，但在这颗星球上，谨慎只能让人多活一天，机会才可能让人离开。',
        revisedAt: '2026-05-10T09:00:00.000Z',
      },
      {
        id: 'chapter-2',
        volumeId: 'volume-1',
        order: 2,
        title: '第二章：地下遗迹',
        corePlot: '林铮进入地下结构，发现机械生命体零，并被迫在追兵到来前完成第一次激活。',
        characters: '林铮、零、黑帮追兵',
        transition: '零的苏醒引发外部能量波动，黑帮发现异常。',
        content: '',
        revisedAt: null,
      },
      {
        id: 'chapter-3',
        volumeId: 'volume-1',
        order: 3,
        title: '第三章：逃离垃圾星',
        corePlot: '黑帮封锁回收区，林铮修复旧飞行器并带着零的数据核心逃离。',
        characters: '林铮、零、黑帮头目',
        transition: '飞行器跃入废弃星域，开启新的流亡线。',
        content: '',
        revisedAt: null,
      },
    ],
    createdAt: '2026-05-08T08:00:00.000Z',
    updatedAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'demo-sword',
    title: '《剑道长生》',
    genre: '仙侠 / 修真',
    inspiration: '被逐出宗门的外门弟子，在荒山古剑冢中重建道心。',
    worldbuilding: '宗门林立，灵脉衰退，剑修一脉逐渐式微。',
    characters: '顾青舟：沉默克制的剑修。沈照雪：冷静的丹修盟友。',
    keyEvents: ['逐出宗门', '发现剑冢', '重修剑心'],
    storyline: [],
    volumes: [],
    chapters: [],
    createdAt: '2026-05-07T08:00:00.000Z',
    updatedAt: '2026-05-09T12:30:00.000Z',
  },
  {
    id: 'demo-mystery',
    title: '《都市诡闻录》',
    genre: '悬疑 / 灵异',
    inspiration: '调查记者追踪一座旧楼的连环失踪案。',
    worldbuilding: '现代都市表层秩序稳定，暗处流传着被遗忘的地方禁忌。',
    characters: '许知言：调查记者。周棠：民俗学研究者。',
    keyEvents: ['旧楼失踪案', '发现民俗档案', '午夜回访'],
    storyline: [],
    volumes: [],
    chapters: [],
    createdAt: '2026-05-06T08:00:00.000Z',
    updatedAt: '2026-05-08T18:20:00.000Z',
  },
];

export const mockSettings: MockSettings = {
  apiProvider: 'local',
  apiKey: '',
  autoSave: true,
  aiPolishLevel: 'moderate',
  darkMode: false,
  fontFamily: 'serif',
};

export function createMockStoryline(project: Pick<MockProject, 'keyEvents' | 'characters' | 'inspiration'>): MockStorylineItem[] {
  const events = project.keyEvents.length > 0 ? project.keyEvents : ['确认主线目标', '制造关键冲突', '完成阶段转折'];

  return events.map((event, index) => ({
    id: `mock-story-${Date.now()}-${index}`,
    order: index + 1,
    title: `节点 ${index + 1}：${event}`,
    type: index === 0 ? 'opening' : index === events.length - 1 ? 'turning-point' : 'progress',
    source: 'mock',
    description: `围绕“${event}”整理因果关系，明确前置条件、冲突来源和后续影响。人物约束：${project.characters || '沿用作者设定'}`,
    constraints: ['只梳理已提供信息', '不新增关键设定', '不改变人物核心动机'],
  }));
}

export function createMockChapterSplit(project: MockProject): { volumes: MockVolume[]; chapters: MockChapter[] } {
  const storyline = project.storyline.length > 0 ? project.storyline : createMockStoryline(project);
  const volume: MockVolume = {
    id: `mock-volume-${Date.now()}`,
    title: '第一卷：主线启动',
    order: 1,
    chapterIds: [],
  };

  const chapters = storyline.map((node, index) => {
    const chapter: MockChapter = {
      id: `mock-chapter-${Date.now()}-${index}`,
      volumeId: volume.id,
      order: index + 1,
      title: `第${index + 1}章：${node.title.replace(/^节点\s*\d+：/, '')}`,
      corePlot: node.description,
      characters: project.characters || '沿用作者设定人物',
      transition: index === storyline.length - 1 ? '阶段性收束，并为下一卷留下悬念。' : '承接上一节点，并推动下一场冲突。',
      content: '',
      revisedAt: null,
    };
    volume.chapterIds.push(chapter.id);
    return chapter;
  });

  return { volumes: [volume], chapters };
}

export function createMockDraft(project: MockProject, chapter: MockChapter) {
  return [
    `${chapter.title}`,
    `本章围绕“${chapter.corePlot}”展开，场景严格沿用《${project.title.replace(/[《》]/g, '')}》当前设定。`,
    `主要人物保持既有动机：${chapter.characters}`,
    `冲突推进到关键处时，主角必须付出代价才能得到新的线索。${chapter.transition}`,
    '这一段 mock 正文用于前端演示，后续接入真实接口后可由后端或大模型生成完整章节。',
  ].join('\n\n');
}

export function formatMockText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `\u3000\u3000${line}`)
    .join('\n\n');
}
