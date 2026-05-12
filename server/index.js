import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = normalize(join(__dirname, '..'));
const dataDir = join(__dirname, 'data');
const dbPath = join(dataDir, 'db.json');
const distDir = join(rootDir, 'dist');
const publicIndex = join(rootDir, 'index.html');

const port = Number(process.env.PORT || 3001);
const maxBodyBytes = 1024 * 1024 * 2;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const seedVolumes = [
  {
    id: 'vol-001',
    projectId: 'demo-stargazer',
    order: 1,
    title: '第一卷：拾荒者',
    wordCount: 0,
    chapterIds: [],
  },
  {
    id: 'vol-002',
    projectId: 'demo-stargazer',
    order: 2,
    title: '第二卷：遗迹',
    wordCount: 0,
    chapterIds: [],
  },
];

const seedChapters = [
  {
    id: 'ch-001',
    projectId: 'demo-stargazer',
    volumeId: 'vol-001',
    order: 1,
    title: '第一章：D级垃圾星',
    wordCount: 0,
    content: '',
    corePlot: '林铮在D级垃圾星进行例行拾荒，发现异常信号源。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。',
    transition: '林铮发现地下遗迹入口，为下一章探索遗迹埋下伏笔。',
    revisedAt: null,
  },
  {
    id: 'ch-002',
    projectId: 'demo-stargazer',
    volumeId: 'vol-001',
    order: 2,
    title: '第二章：地下遗迹',
    wordCount: 0,
    content: '',
    corePlot: '林铮进入地下遗迹，发现远古外星机械文明的遗迹核心。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。',
    transition: '遗迹核心激活沉睡的机械生命体零，林铮被迫逃亡。',
    revisedAt: null,
  },
  {
    id: 'ch-003',
    projectId: 'demo-stargazer',
    volumeId: 'vol-001',
    order: 3,
    title: '第三章：机械生命体',
    wordCount: 0,
    content: '',
    corePlot: '机械生命体零被激活，向林铮揭示其身份的真相。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。零：沉睡的机械生命体，只提供信息与辅助。',
    transition: '零告知林铮关于远古文明的秘密，黑帮追踪而至。',
    revisedAt: null,
  },
  {
    id: 'ch-004',
    projectId: 'demo-stargazer',
    volumeId: 'vol-002',
    order: 4,
    title: '第四章：黑帮追杀',
    wordCount: 0,
    content: '',
    corePlot: '黑帮追踪到遗迹，零协助林铮逃离垃圾星。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。零：沉睡的机械生命体，只提供信息与辅助。',
    transition: '林铮与零逃离垃圾星，进入星际逃亡阶段。',
    revisedAt: null,
  },
  {
    id: 'ch-005',
    projectId: 'demo-stargazer',
    volumeId: 'vol-002',
    order: 5,
    title: '第五章：星际逃亡',
    wordCount: 0,
    content: '',
    corePlot: '林铮与零穿越星域，逐步理解自身使命，确立新目标。',
    characters: '林铮：谨慎、坚韧、重承诺的拾荒者。零：沉睡的机械生命体，只提供信息与辅助。',
    transition: '章节收束，为后续故事留下悬念。',
    revisedAt: null,
  },
];

// Link chapters to volumes
seedChapters.forEach(ch => {
  const vol = seedVolumes.find(v => v.id === ch.volumeId);
  if (vol) {
    vol.chapterIds = vol.chapterIds || [];
    vol.chapterIds.push(ch.id);
  }
});

const seedStoryline = [
  {
    id: 'node-001',
    order: 1,
    title: '节点 1：D级垃圾星拾荒',
    type: 'opening',
    source: 'author-input',
    description: '开篇阶段围绕"林铮在D级垃圾星拾荒"整理因果关系，明确前置条件、冲突来源与后续影响。人物约束：林铮，谨慎、坚韧、重承诺的拾荒者。',
    constraints: ['只梳理作者已提供的信息', '不新增关键设定', '不改变人物核心性格'],
  },
  {
    id: 'node-002',
    order: 2,
    title: '节点 2：发现地下遗迹',
    type: 'progress',
    source: 'author-input',
    description: '承接推进围绕"发现地下遗迹"整理因果关系，明确前置条件、冲突来源与后续影响。人物约束：林铮，谨慎、坚韧、重承诺的拾荒者。',
    constraints: ['只梳理作者已提供的信息', '不新增关键设定', '不改变人物核心性格'],
  },
  {
    id: 'node-003',
    order: 3,
    title: '节点 3：激活机械生命体',
    type: 'progress',
    source: 'author-input',
    description: '承接推进围绕"激活机械生命体"整理因果关系，明确前置条件、冲突来源与后续影响。人物约束：林铮，谨慎、坚韧、重承诺的拾荒者。零，沉睡的机械生命体，只提供信息与辅助。',
    constraints: ['只梳理作者已提供的信息', '不新增关键设定', '不改变人物核心性格'],
  },
  {
    id: 'node-004',
    order: 4,
    title: '节点 4：黑帮追杀',
    type: 'progress',
    source: 'author-input',
    description: '承接推进围绕"黑帮追杀"整理因果关系，明确前置条件、冲突来源与后续影响。人物约束：林铮，谨慎、坚韧、重承诺的拾荒者。零，沉睡的机械生命体，只提供信息与辅助。',
    constraints: ['只梳理作者已提供的信息', '不新增关键设定', '不改变人物核心性格'],
  },
  {
    id: 'node-005',
    order: 5,
    title: '节点 5：逃离垃圾星',
    type: 'turning-point',
    source: 'author-input',
    description: '阶段收束围绕"逃离垃圾星"整理因果关系，明确前置条件、冲突来源与后续影响。人物约束：林铮，谨慎、坚韧、重承诺的拾荒者。零，沉睡的机械生命体，只提供信息与辅助。',
    constraints: ['只梳理作者已提供的信息', '不新增关键设定', '不改变人物核心性格'],
  },
];

const seedDb = {
  schemaVersion: 2,
  settings: {
    apiProvider: 'local',
    apiBaseUrl: '',
    apiKey: '',
    model: '',
    darkMode: false,
    fontFamily: 'serif',
    autoSave: true,
    aiPolishLevel: 'moderate',
  },
  projects: [
    {
      id: 'demo-stargazer',
      title: '《星际拾荒者》',
      genre: '科幻 / 废土',
      inspiration: '一个底层拾荒者意外接触远古外星机械文明，在逃亡中逐步理解自身使命。',
      worldbuilding: '人类散落在废弃星域中，资源由财阀与黑帮控制，远古机械遗迹被视为禁区。',
      characters: '林铮：谨慎、坚韧、重承诺的拾荒者。零：沉睡的机械生命体，只提供信息与辅助。',
      keyEvents: ['D级垃圾星拾荒', '发现地下遗迹', '激活机械生命体', '黑帮追杀', '逃离垃圾星'],
      storyline: seedStoryline,
      settings: { chaptersPerVolume: 4 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  volumes: seedVolumes,
  chapters: seedChapters,
  snapshots: [],
};

async function ensureDb() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dbPath, 'utf8');
  } catch {
    await writeJson(dbPath, seedDb);
  }
}

async function readDb() {
  await ensureDb();
  const raw = await readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await writeJson(dbPath, db);
}

async function writeJson(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2), 'utf8');
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function sendText(res, status, text, filename) {
  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Access-Control-Allow-Origin': '*',
  };
  if (filename) {
    headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
  }
  res.writeHead(status, headers);
  res.end(text);
}

function notFound(res) {
  sendJson(res, 404, { error: 'Not found' });
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: 'Method not allowed' });
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw Object.assign(new Error('Request body too large'), { status: 413 });
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeApiBaseUrl(value) {
  const apiBaseUrl = cleanText(value).replace(/\/+$/, '');
  if (!apiBaseUrl) {
    throw httpError(400, '模型接口地址不能为空');
  }

  try {
    const parsed = new URL(apiBaseUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('invalid protocol');
    }
  } catch {
    throw httpError(400, '模型接口地址格式不正确，请填写 OpenAI-compatible base URL');
  }

  return apiBaseUrl;
}

function normalizeApiKey(value) {
  const apiKey = cleanText(value);
  if (!apiKey) {
    throw httpError(400, 'API Key 不能为空');
  }
  return apiKey;
}

async function requestLlmJson(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const rawText = await response.text();
    let payload = {};

    if (rawText.trim()) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = { error: rawText };
      }
    }

    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || payload?.error || `上游模型接口请求失败：${response.status}`;
      throw httpError(502, String(message));
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw httpError(504, '模型接口请求超时');
    }
    if (error.status) {
      throw error;
    }
    throw httpError(502, error.message || '无法连接模型接口');
  } finally {
    clearTimeout(timeout);
  }
}

function mapLlmModels(payload) {
  const list = Array.isArray(payload?.data) ? payload.data : [];
  return list
    .map((item) => {
      const id = cleanText(item?.id);
      if (!id) return null;
      return {
        id,
        name: cleanText(item?.name) || id,
        ownedBy: cleanText(item?.owned_by || item?.ownedBy),
      };
    })
    .filter(Boolean);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }
  return cleanText(value)
    .split(/\r?\n|,|，|、/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatNovelText(value) {
  const normalized = cleanText(value)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/([。！？；])\s*/g, '$1\n')
    .replace(/\n{3,}/g, '\n\n');

  return normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `　　${normalizePunctuation(line)}`)
    .join('\n\n');
}

function normalizePunctuation(text) {
  return text
    .replace(/,/g, '，')
    .replace(/\?/g, '？')
    .replace(/!/g, '！')
    .replace(/;/g, '；')
    .replace(/:/g, '：');
}

function toChineseNumber(value) {
  const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (value <= 10) return chars[value];
  if (value < 20) return `十${chars[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${chars[tens]}十${ones ? chars[ones] : ''}`;
}

function volumeTitle(title) {
  return title.replace(/^节点\s*\d+[:：]\s*/, '').slice(0, 12) || '主线推进';
}

function chapterTitle(title) {
  return title.replace(/^节点\s*\d+[:：]\s*/, '').slice(0, 16) || '剧情推进';
}

function buildSplitChapterTitle(node, chapterIndex) {
  const baseTitle = chapterTitle(node.title);
  const suffixes = ['开端', '推进', '冲突', '收束'];
  return chapterIndex === 0 ? baseTitle : `${baseTitle}${suffixes[chapterIndex] || `阶段${chapterIndex + 1}`}`;
}

function buildSplitChapterPlot(project, node, chapterIndex, total) {
  const chapterRole = chapterIndex === 0
    ? '建立本卷核心场景、目标和冲突入口'
    : chapterIndex === total - 1
      ? '完成本卷阶段性收束，并为下一卷保留承接点'
      : '推进本卷关键事件，强化人物选择和外部阻力';
  const characterHint = project.characters ? `人物约束：${project.characters}` : '人物沿用当前设定。';
  return `${chapterRole}。本章围绕“${node.title}”展开，核心依据：${node.description || node.title}。${characterHint}`;
}

function buildSplitChapterTransition(chapterIndex, total) {
  if (chapterIndex === 0) return '承接本卷开端，抛出主要矛盾并引向下一章。';
  if (chapterIndex === total - 1) return '收束本卷核心事件，并留下进入下一卷的动因。';
  return '承接上一章冲突，继续推动本卷主线。';
}

function touchProject(project) {
  project.updatedAt = new Date().toISOString();
  return project;
}

function publicProject(project) {
  const projectChapters = db => db.chapters.filter(c => c.projectId === project.id);
  return (db) => ({
    id: project.id,
    title: project.title,
    genre: project.genre,
    lastModified: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    summary: project.inspiration,
    chapterCount: projectChapters(db).length,
    wordCount: projectChapters(db).reduce((sum, c) => sum + (c.wordCount || 0), 0),
  });
}

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await readDb();
  }
  return dbInstance;
}

async function saveDb(db) {
  dbInstance = db;
  await writeDb(db);
}

// =====================
// Project CRUD
// =====================

function createProject(input) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    title: cleanText(input.title) || '未命名小说',
    genre: cleanText(input.genre) || '未分类',
    inspiration: cleanText(input.inspiration),
    worldbuilding: cleanText(input.worldbuilding),
    characters: cleanText(input.characters),
    keyEvents: normalizeList(input.keyEvents),
    storyline: [],
    settings: { chaptersPerVolume: 4 },
    createdAt: now,
    updatedAt: now,
  };
}

async function handleProjects(req, res, url, db) {
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length === 2 && !segments[3]) {
    if (req.method === 'GET') {
      const publicList = db.projects.map(p => {
        const projectChapters = db.chapters.filter(c => c.projectId === p.id);
        return {
          id: p.id,
          title: p.title,
          genre: p.genre,
          lastModified: p.updatedAt,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          summary: p.inspiration,
          chapterCount: projectChapters.length,
          wordCount: projectChapters.reduce((sum, c) => sum + (c.wordCount || 0), 0),
        };
      });
      sendJson(res, 200, publicList);
      return;
    }
    if (req.method === 'POST') {
      const project = createProject(await readBody(req));
      db.projects.unshift(project);
      await saveDb(db);
      sendJson(res, 201, project);
      return;
    }
    methodNotAllowed(res);
    return;
  }

  const projectId = segments[2];
  const project = db.projects.find(p => p.id === projectId);
  if (!project) {
    notFound(res);
    return;
  }

  if (segments.length === 3) {
    if (req.method === 'GET') {
      const projectData = { ...project };
      projectData.volumes = db.volumes.filter(v => v.projectId === projectId).sort((a, b) => a.order - b.order);
      projectData.chapters = db.chapters.filter(c => c.projectId === projectId).sort((a, b) => a.order - b.order);
      sendJson(res, 200, projectData);
      return;
    }
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await readBody(req);
      Object.assign(project, {
        title: body.title !== undefined ? cleanText(body.title) : project.title,
        genre: body.genre !== undefined ? cleanText(body.genre) : project.genre,
        inspiration: body.inspiration !== undefined ? cleanText(body.inspiration) : project.inspiration,
        worldbuilding: body.worldbuilding !== undefined ? cleanText(body.worldbuilding) : project.worldbuilding,
        characters: body.characters !== undefined ? cleanText(body.characters) : project.characters,
        keyEvents: body.keyEvents !== undefined ? normalizeList(body.keyEvents) : project.keyEvents,
        settings: body.settings !== undefined ? { ...project.settings, ...body.settings } : project.settings,
      });
      touchProject(project);
      await saveDb(db);
      sendJson(res, 200, project);
      return;
    }
    if (req.method === 'DELETE') {
      db.projects = db.projects.filter(p => p.id !== projectId);
      db.volumes = db.volumes.filter(v => v.projectId !== projectId);
      db.chapters = db.chapters.filter(c => c.projectId !== projectId);
      db.snapshots = db.snapshots.filter(s => s.projectId !== projectId);
      await saveDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  // =====================
  // Storyline
  // =====================
  if (segments[3] === 'storyline' && segments.length === 4 && req.method === 'POST') {
    const body = await readBody(req);
    const events = normalizeList(body.keyEvents).length
      ? normalizeList(body.keyEvents)
      : project.keyEvents?.length
        ? project.keyEvents
        : extractSentences(`${project.inspiration}\n${project.worldbuilding}`, 6);

    const safeEvents = events.length ? events : ['确认主线目标', '整理关键冲突', '推进阶段结局'];
    project.storyline = safeEvents.map((event, index) => ({
      id: randomUUID(),
      order: index + 1,
      title: `节点 ${index + 1}：${event}`,
      type: index === 0 ? 'opening' : index === safeEvents.length - 1 ? 'turning-point' : 'progress',
      source: 'author-input',
      description: buildStorylineDescription(project, event, index, safeEvents.length),
      constraints: [
        '只梳理作者已提供的信息',
        '不新增关键设定',
        '不改变人物核心性格',
      ],
    }));
    touchProject(project);
    await saveDb(db);
    sendJson(res, 200, project.storyline);
    return;
  }

  // =====================
  // Chapters - Split
  // =====================
  if (segments[3] === 'chapters' && segments[4] === 'split' && req.method === 'POST') {
    const storyline = project.storyline?.length
      ? project.storyline
      : [
          {
            id: randomUUID(),
            order: 1,
            title: '节点 1：主线启动',
            description: project.inspiration || '围绕当前设定启动主线剧情。',
          },
        ];
    const chaptersPerVolume = Number(project.settings?.chaptersPerVolume || 4);
    const newVolumes = [];
    const newChapters = [];
    let chapterOrder = 1;

    storyline.forEach((node, index) => {
      const volume = {
        id: randomUUID(),
        projectId: projectId,
        order: index + 1,
        title: `第${toChineseNumber(index + 1)}卷：${volumeTitle(node.title)}`,
        wordCount: 0,
        chapterIds: [],
      };
      newVolumes.push(volume);

      for (let chapterIndex = 0; chapterIndex < chaptersPerVolume; chapterIndex += 1) {
        const chapter = {
          id: randomUUID(),
          projectId,
          volumeId: volume.id,
          order: chapterOrder,
          title: `第${toChineseNumber(chapterOrder)}章：${buildSplitChapterTitle(node, chapterIndex)}`,
          wordCount: 0,
          content: '',
          corePlot: buildSplitChapterPlot(project, node, chapterIndex, chaptersPerVolume),
          characters: project.characters || '',
          transition: buildSplitChapterTransition(chapterIndex, chaptersPerVolume),
          revisedAt: null,
        };
        chapterOrder += 1;
        volume.chapterIds.push(chapter.id);
        newChapters.push(chapter);
      }
    });

    // Remove old volumes/chapters for this project
    db.volumes = db.volumes.filter(v => v.projectId !== projectId);
    db.chapters = db.chapters.filter(c => c.projectId !== projectId);

    db.volumes.push(...newVolumes);
    db.chapters.push(...newChapters);
    touchProject(project);
    await saveDb(db);
    sendJson(res, 200, { volumes: newVolumes, chapters: newChapters });
    return;
  }

  // =====================
  // Create chapter
  // =====================
  if (segments[3] === 'chapters' && segments.length === 4 && req.method === 'POST') {
    const body = await readBody(req);
    const volumeId = body.volumeId;
    const volume = db.volumes.find(v => v.id === volumeId && v.projectId === projectId);
    if (!volume) {
      notFound(res);
      return;
    }

    const existingChapters = db.chapters.filter(c => c.volumeId === volumeId);
    const order = existingChapters.length + 1;
    const chapter = {
      id: randomUUID(),
      projectId,
      volumeId,
      order,
      title: cleanText(body.title) || `第${order}章`,
      wordCount: 0,
      content: '',
      corePlot: cleanText(body.corePlot) || '',
      characters: body.characters || project.characters || '',
      transition: cleanText(body.transition) || '',
      revisedAt: null,
    };
    db.chapters.push(chapter);
    volume.chapterIds = volume.chapterIds || [];
    volume.chapterIds.push(chapter.id);
    touchProject(project);
    await saveDb(db);
    sendJson(res, 201, chapter);
    return;
  }

  // =====================
  // Chapter operations
  // =====================
  const chapterId = segments[4];
  if (chapterId) {
    const chapter = db.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      notFound(res);
      return;
    }

    // Generate draft
    if (segments[5] === 'draft' && req.method === 'POST') {
      const body = await readBody(req);
      const length = Number(body.targetWords || 900);
      const paragraphs = [
        `${chapter.title}。${chapter.corePlot}`,
        `场景从作者已经设定的世界规则中展开。${project.worldbuilding || '世界背景保持作者原始设定，不额外添加新的力量体系。'}`,
        `人物行动遵循既有人设。${chapter.characters || project.characters || '主要人物按照作者设定推进。'}`,
        `冲突推进聚焦本章核心情节，所有描写只服务于"${chapter.corePlot}"。`,
        `本章结尾落在过渡节点上：${chapter.transition || '为下一章保留明确承接。'}`,
      ];

      let text = paragraphs.join('\n\n');
      while (text.length < length) {
        text += `\n\n${chapter.title}继续围绕既定事件展开，补足环境、动作和常规对话节奏，但不新增关键剧情，不改变人物动机。`;
      }
      const content = formatNovelText(text);
      chapter.content = content;
      chapter.wordCount = countWords(content);
      chapter.revisedAt = new Date().toISOString();
      touchProject(project);
      await saveDb(db);
      sendJson(res, 200, chapter);
      return;
    }

    // Update chapter
    if (req.method === 'PUT') {
      const body = await readBody(req);
      const oldContent = chapter.content;
      Object.assign(chapter, {
        title: body.title !== undefined ? cleanText(body.title) : chapter.title,
        content: body.content !== undefined ? body.content : chapter.content,
        corePlot: body.corePlot !== undefined ? cleanText(body.corePlot) : chapter.corePlot,
        characters: body.characters !== undefined ? cleanText(body.characters) : chapter.characters,
        transition: body.transition !== undefined ? cleanText(body.transition) : chapter.transition,
      });
      chapter.wordCount = countWords(chapter.content);
      chapter.revisedAt = new Date().toISOString();

      // Auto snapshot if content changed
      if (body.content !== undefined && body.content !== oldContent) {
        const snapshot = {
          id: randomUUID(),
          projectId,
          chapterId,
          content: oldContent,
          wordCount: countWords(oldContent),
          createdAt: new Date().toISOString(),
        };
        db.snapshots.push(snapshot);
      }

      touchProject(project);
      await saveDb(db);
      sendJson(res, 200, chapter);
      return;
    }

    if (req.method === 'DELETE') {
      const volume = db.volumes.find(v => v.id === chapter.volumeId);
      if (volume) {
        volume.chapterIds = (volume.chapterIds || []).filter(id => id !== chapter.id);
      }
      db.chapters = db.chapters.filter(c => c.id !== chapter.id);
      db.snapshots = db.snapshots.filter(s => s.chapterId !== chapter.id);
      touchProject(project);
      await saveDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  notFound(res);
}

// =====================
// Volume operations
// =====================

async function handleVolumes(req, res, url, db) {
  const segments = url.pathname.split('/').filter(Boolean);
  const volumeId = segments[2];
  const volume = db.volumes.find(v => v.id === volumeId);

  if (!volume) {
    notFound(res);
    return;
  }

  if (req.method === 'GET') {
    sendJson(res, 200, volume);
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    Object.assign(volume, {
      title: body.title !== undefined ? cleanText(body.title) : volume.title,
      order: body.order !== undefined ? Number(body.order) : volume.order,
    });
    await saveDb(db);
    sendJson(res, 200, volume);
    return;
  }

  if (req.method === 'DELETE') {
    const project = db.projects.find(p => p.id === volume.projectId);
    const deletedChapterIds = db.chapters
      .filter(c => c.volumeId === volumeId)
      .map(c => c.id);
    db.volumes = db.volumes.filter(v => v.id !== volumeId);
    db.chapters = db.chapters.filter(c => c.volumeId !== volumeId);
    db.snapshots = db.snapshots.filter(s => !deletedChapterIds.includes(s.chapterId));
    if (project) touchProject(project);
    await saveDb(db);
    sendJson(res, 200, { ok: true });
    return;
  }

  methodNotAllowed(res);
}

// =====================
// Snapshot operations
// =====================

async function handleSnapshots(req, res, url, db) {
  const segments = url.pathname.split('/').filter(Boolean);
  const chapterId = segments[3];

  if (req.method === 'GET' && chapterId) {
    const chapterSnapshots = db.snapshots
      .filter(s => s.chapterId === chapterId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, chapterSnapshots);
    return;
  }

  notFound(res);
}

// =====================
// Export
// =====================

function exportProject(project, db) {
  const lines = [
    project.title,
    project.genre,
    '',
    '【剧情梗概】',
    project.inspiration || '未填写',
    '',
    '【世界观】',
    project.worldbuilding || '未填写',
    '',
    '【人物设定】',
    project.characters || '未填写',
    '',
    '【正文】',
  ];

  const sortedChapters = db.chapters
    .filter(c => c.projectId === project.id)
    .sort((a, b) => a.order - b.order);

  for (const chapter of sortedChapters) {
    lines.push('', chapter.title, '', chapter.content || '（本章尚未生成正文）');
  }
  return `${lines.join('\n')}\n`;
}

// =====================
// Main handler
// =====================

async function handleApi(req, res, url) {
  const db = await getDb();
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'novel-assistant-backend' });
    return;
  }

  if (pathname === '/api/llm/models' && req.method === 'POST') {
    const body = await readBody(req);
    const apiBaseUrl = normalizeApiBaseUrl(body.apiBaseUrl);
    const apiKey = normalizeApiKey(body.apiKey);
    const payload = await requestLlmJson(`${apiBaseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const models = mapLlmModels(payload);
    if (models.length === 0) {
      throw httpError(502, '无法获取模型列表');
    }

    sendJson(res, 200, { models });
    return;
  }

  if (pathname === '/api/llm/test' && req.method === 'POST') {
    const body = await readBody(req);
    const apiBaseUrl = normalizeApiBaseUrl(body.apiBaseUrl);
    const apiKey = normalizeApiKey(body.apiKey);
    const model = cleanText(body.model);

    if (!model) {
      throw httpError(400, '请选择可用模型');
    }

    const payload = await requestLlmJson(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'hello' }],
        temperature: 0,
        max_tokens: 64,
        stream: false,
      }),
    });

    const text = cleanText(payload?.choices?.[0]?.message?.content || payload?.choices?.[0]?.text);
    if (!text) {
      throw httpError(502, '模型接口没有返回有效文本');
    }

    sendJson(res, 200, { text });
    return;
  }

  if (pathname === '/api/settings') {
    if (req.method === 'GET') {
      sendJson(res, 200, db.settings);
      return;
    }
    if (req.method === 'PUT') {
      db.settings = { ...db.settings, ...(await readBody(req)) };
      await saveDb(db);
      sendJson(res, 200, db.settings);
      return;
    }
    methodNotAllowed(res);
    return;
  }

  if (pathname === '/api/format' && req.method === 'POST') {
    const body = await readBody(req);
    sendJson(res, 200, { text: formatNovelText(body.text || '') });
    return;
  }

  if (pathname.startsWith('/api/volumes/')) {
    await handleVolumes(req, res, url, db);
    return;
  }

  if (pathname.startsWith('/api/snapshots/')) {
    await handleSnapshots(req, res, url, db);
    return;
  }

  if (pathname === '/api/projects' || pathname.startsWith('/api/projects/')) {
    const segments = pathname.split('/').filter(Boolean);

    // Export endpoint
    if (segments[3] === 'export.txt' && req.method === 'GET') {
      const project = db.projects.find(p => p.id === segments[2]);
      if (!project) {
        notFound(res);
        return;
      }
      sendText(res, 200, exportProject(project, db), `${project.title}.txt`);
      return;
    }

    await handleProjects(req, res, url, db);
    return;
  }

  notFound(res);
}

function buildStorylineDescription(project, event, index, total) {
  const position = index === 0 ? '开篇阶段' : index === total - 1 ? '阶段收束' : '承接推进';
  const characterHint = project.characters ? `人物约束：${project.characters}` : '人物约束：沿用作者设定。';
  return `${position}围绕"${event}"整理因果关系，明确前置条件、冲突来源与后续影响。${characterHint}`;
}

function extractSentences(text, limit) {
  return cleanText(text)
    .split(/[。！？\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

async function serveStatic(req, res, url) {
  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const distFile = normalize(join(distDir, requested));
  const fallbackFile = normalize(join(rootDir, requested));
  const safeFile = distFile.startsWith(distDir) ? distFile : join(distDir, 'index.html');

  try {
    await stat(safeFile);
    streamFile(res, safeFile);
    return;
  } catch {
    try {
      if (fallbackFile.startsWith(rootDir)) {
        await stat(fallbackFile);
        streamFile(res, fallbackFile);
        return;
      }
    } catch {
      streamFile(res, publicIndex);
    }
  }
}

function streamFile(res, path) {
  const type = mimeTypes[extname(path)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  createReadStream(path).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, { error: error.message || 'Internal server error' });
  }
});

await ensureDb();

server.listen(port, () => {
  console.log(`Novel Assistant backend listening on http://127.0.0.1:${port}`);
});
