# Novel Assistant Backend

轻量 Node 后端，不依赖 Express 等额外包。数据保存在 `server/data/db.json`，适合课程设计中的本地前后端一体应用。

## 启动

```bash
npm run backend
```

默认地址：

```text
http://127.0.0.1:3001
```

可通过环境变量修改端口：

```bash
PORT=3002 npm run backend
```

## API

- `GET /api/health`：健康检查
- `GET /api/projects`：作品列表
- `POST /api/projects`：新建作品
- `GET /api/projects/:id`：作品详情
- `PUT /api/projects/:id`：更新作品
- `DELETE /api/projects/:id`：删除作品
- `POST /api/projects/:id/storyline`：根据作者输入梳理故事线
- `POST /api/projects/:id/chapters/split`：根据故事线拆分分卷与章节大纲
- `POST /api/projects/:id/chapters/:chapterId/draft`：按章节大纲扩写正文
- `PUT /api/projects/:id/chapters/:chapterId`：保存人工修改后的章节
- `POST /api/format`：统一正文排版
- `GET /api/projects/:id/export.txt`：导出 TXT
- `GET /api/settings` / `PUT /api/settings`：读取或保存设置

## 设计边界

生成类接口遵循 `prompt.md` 的约束：只根据作者提供的信息做梳理、拆分、扩写和排版，不新增关键剧情，不改变核心设定与人物性格。
