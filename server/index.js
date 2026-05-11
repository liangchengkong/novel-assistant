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

const seedDb = {
  schemaVersion: 1,
  settings: {
    apiProvider: 'local',
    apiKey: '',
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
      storyline: [],
      volumes: [],
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
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

function publicProject(project) {
  return {
    id: project.id,
    title: project.title,
    genre: project.genre,
    lastModified: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    summary: project.inspiration,
    chapterCount: project.chapters?.length || 0,
  };
}

function touch(project) {
  project.updatedAt = new Date().toISOString();
  return project;
}

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
    volumes: [],
    chapters: [],
    createdAt: now,
    updatedAt: now,
  };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
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

function buildStoryline(project, input = {}) {
  const events = normalizeList(input.keyEvents).length
    ? normalizeList(input.keyEvents)
    : project.keyEvents?.length
      ? project.keyEvents
      : extractSentences(`${project.inspiration}\n${project.worldbuilding}`, 6);

  const safeEvents = events.length ? events : ['确认主线目标', '整理关键冲突', '推进阶段结局'];
  return safeEvents.map((event, index) => ({
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
}

function buildStorylineDescription(project, event, index, total) {
  const position = index === 0 ? '开篇阶段' : index === total - 1 ? '阶段收束' : '承接推进';
  const characterHint = project.characters ? `人物约束：${project.characters}` : '人物约束：沿用作者设定。';
  return `${position}围绕“${event}”整理因果关系，明确前置条件、冲突来源与后续影响。${characterHint}`;
}

function splitChapters(project, input = {}) {
  const storyline = Array.isArray(input.storyline) && input.storyline.length
    ? input.storyline
    : project.storyline?.length
      ? project.storyline
      : buildStoryline(project);

  const chaptersPerVolume = Number(input.chaptersPerVolume || 4);
  const volumes = [];
  const chapters = [];

  storyline.forEach((node, index) => {
    const volumeIndex = Math.floor(index / chaptersPerVolume);
    if (!volumes[volumeIndex]) {
      volumes[volumeIndex] = {
        id: randomUUID(),
        title: `第${toChineseNumber(volumeIndex + 1)}卷：${volumeTitle(node.title)}`,
        order: volumeIndex + 1,
        chapterIds: [],
      };
    }

    const chapter = {
      id: randomUUID(),
      volumeId: volumes[volumeIndex].id,
      order: index + 1,
      title: `第${toChineseNumber(index + 1)}章：${chapterTitle(node.title)}`,
      corePlot: node.description || node.title,
      transition: '承接上一节点的因果，不跳脱作者给定主线。',
      characters: project.characters || '沿用作者设定人物',
      content: '',
      revisedAt: null,
    };
    chapters.push(chapter);
    volumes[volumeIndex].chapterIds.push(chapter.id);
  });

  return { volumes, chapters };
}

function expandDraft(project, chapter, options = {}) {
  const length = Number(options.targetWords || 900);
  const paragraphs = [
    `${chapter.title}。${chapter.corePlot}`,
    `场景从作者已经设定的世界规则中展开。${project.worldbuilding || '世界背景保持作者原始设定，不额外添加新的力量体系。'}`,
    `人物行动遵循既有人设。${chapter.characters || project.characters || '主要人物按照作者设定推进。'}`,
    `冲突推进聚焦本章核心情节，所有描写只服务于“${chapter.corePlot}”。`,
    `本章结尾落在过渡节点上：${chapter.transition || '为下一章保留明确承接。'}`,
  ];

  let text = paragraphs.join('\n\n');
  while (text.length < length) {
    text += `\n\n${chapter.title}继续围绕既定事件展开，补足环境、动作和常规对话节奏，但不新增关键剧情，不改变人物动机。`;
  }
  return formatNovelText(text);
}

function extractSentences(text, limit) {
  return cleanText(text)
    .split(/[。！？\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function volumeTitle(title) {
  return title.replace(/^节点\s*\d+[:：]\s*/, '').slice(0, 12) || '主线推进';
}

function chapterTitle(title) {
  return title.replace(/^节点\s*\d+[:：]\s*/, '').slice(0, 16) || '剧情推进';
}

function toChineseNumber(value) {
  const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (value <= 10) return chars[value];
  if (value < 20) return `十${chars[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${chars[tens]}十${ones ? chars[ones] : ''}`;
}

function exportProject(project) {
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

  const sorted = [...(project.chapters || [])].sort((a, b) => a.order - b.order);
  for (const chapter of sorted) {
    lines.push('', chapter.title, '', chapter.content || '（本章尚未生成正文）');
  }
  return `${lines.join('\n')}\n`;
}

async function handleApi(req, res, url) {
  const segments = url.pathname.split('/').filter(Boolean);
  const db = await readDb();

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'novel-assistant-backend' });
    return;
  }

  if (url.pathname === '/api/settings') {
    if (req.method === 'GET') {
      sendJson(res, 200, db.settings);
      return;
    }
    if (req.method === 'PUT') {
      db.settings = { ...db.settings, ...(await readBody(req)) };
      await writeDb(db);
      sendJson(res, 200, db.settings);
      return;
    }
    methodNotAllowed(res);
    return;
  }

  if (url.pathname === '/api/format' && req.method === 'POST') {
    const body = await readBody(req);
    sendJson(res, 200, { text: formatNovelText(body.text || '') });
    return;
  }

  if (segments[1] !== 'projects') {
    notFound(res);
    return;
  }

  const projectId = segments[2];

  if (!projectId) {
    if (req.method === 'GET') {
      sendJson(res, 200, db.projects.map(publicProject));
      return;
    }
    if (req.method === 'POST') {
      const project = createProject(await readBody(req));
      db.projects.unshift(project);
      await writeDb(db);
      sendJson(res, 201, project);
      return;
    }
    methodNotAllowed(res);
    return;
  }

  const project = db.projects.find((item) => item.id === projectId);
  if (!project) {
    notFound(res);
    return;
  }

  if (segments.length === 3) {
    if (req.method === 'GET') {
      sendJson(res, 200, project);
      return;
    }
    if (req.method === 'PUT' || req.method === 'PATCH') {
      Object.assign(project, await readBody(req));
      touch(project);
      await writeDb(db);
      sendJson(res, 200, project);
      return;
    }
    if (req.method === 'DELETE') {
      db.projects = db.projects.filter((item) => item.id !== projectId);
      await writeDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  if (segments[3] === 'storyline' && req.method === 'POST') {
    project.storyline = buildStoryline(project, await readBody(req));
    touch(project);
    await writeDb(db);
    sendJson(res, 200, project.storyline);
    return;
  }

  if (segments[3] === 'chapters' && segments[4] === 'split' && req.method === 'POST') {
    const result = splitChapters(project, await readBody(req));
    project.volumes = result.volumes;
    project.chapters = result.chapters;
    touch(project);
    await writeDb(db);
    sendJson(res, 200, result);
    return;
  }

  if (segments[3] === 'chapters' && segments[4] && segments[5] === 'draft' && req.method === 'POST') {
    const chapter = project.chapters.find((item) => item.id === segments[4]);
    if (!chapter) {
      notFound(res);
      return;
    }
    chapter.content = expandDraft(project, chapter, await readBody(req));
    chapter.revisedAt = new Date().toISOString();
    touch(project);
    await writeDb(db);
    sendJson(res, 200, chapter);
    return;
  }

  if (segments[3] === 'chapters' && segments[4] && req.method === 'PUT') {
    const chapter = project.chapters.find((item) => item.id === segments[4]);
    if (!chapter) {
      notFound(res);
      return;
    }
    Object.assign(chapter, await readBody(req), { revisedAt: new Date().toISOString() });
    touch(project);
    await writeDb(db);
    sendJson(res, 200, chapter);
    return;
  }

  if (segments[3] === 'export.txt' && req.method === 'GET') {
    sendText(res, 200, exportProject(project), `${project.title}.txt`);
    return;
  }

  notFound(res);
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
