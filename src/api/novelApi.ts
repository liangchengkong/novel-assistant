const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001';

export interface ProjectSummary {
  id: string;
  title: string;
  genre: string;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  chapterCount: number;
  wordCount?: number;
}

export interface StorylineItem {
  id: string;
  order: number;
  title: string;
  type: string;
  source: string;
  description: string;
  constraints: string[];
}

export interface BackendVolume {
  id: string;
  projectId: string;
  title: string;
  order: number;
  chapterIds: string[];
  wordCount?: number;
}

export interface BackendChapter {
  id: string;
  projectId: string;
  volumeId: string;
  order: number;
  title: string;
  wordCount?: number;
  corePlot: string;
  characters: string;
  transition: string;
  content: string;
  revisedAt: string | null;
}

export interface ProjectDetail {
  id: string;
  title: string;
  genre: string;
  inspiration: string;
  worldbuilding: string;
  characters: string;
  keyEvents: string[];
  storyline: StorylineItem[];
  volumes: BackendVolume[];
  chapters: BackendChapter[];
  createdAt: string;
  updatedAt: string;
}

export interface ChapterSplitResult {
  volumes: BackendVolume[];
  chapters: BackendChapter[];
}

export interface BackendSettings {
  apiProvider: string;
  apiBaseUrl?: string;
  apiKey: string;
  model?: string;
  autoSave: boolean;
  aiPolishLevel: 'conservative' | 'moderate' | 'aggressive';
  darkMode?: boolean;
  fontFamily?: string;
}

export interface LlmModel {
  id: string;
  name: string;
  ownedBy?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProjects() {
  return request<ProjectSummary[]>('/api/projects');
}

export function createProject(data: {
  title: string;
  genre?: string;
  inspiration?: string;
  worldbuilding?: string;
  characters?: string;
  keyEvents?: string[];
}) {
  return request<ProjectDetail>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getProject(projectId: string) {
  return request<ProjectDetail>(`/api/projects/${projectId}`);
}

export function updateProject(projectId: string, data: Partial<ProjectDetail>) {
  return request<ProjectDetail>(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function generateStoryline(projectId: string, data: Pick<ProjectDetail, 'keyEvents'>) {
  return request<StorylineItem[]>(`/api/projects/${projectId}/storyline`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function splitChapters(projectId: string) {
  return request<ChapterSplitResult>(`/api/projects/${projectId}/chapters/split`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function createChapter(projectId: string, data: { volumeId: string; title?: string; corePlot?: string }) {
  return request<BackendChapter>(`/api/projects/${projectId}/chapters`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateVolume(volumeId: string, data: Partial<BackendVolume>) {
  return request<BackendVolume>(`/api/volumes/${volumeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteVolume(volumeId: string) {
  return request<{ ok: true }>(`/api/volumes/${volumeId}`, {
    method: 'DELETE',
  });
}

export function generateChapterDraft(projectId: string, chapterId: string, data?: { targetWords?: number }) {
  return request<BackendChapter>(`/api/projects/${projectId}/chapters/${chapterId}/draft`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export function updateChapter(projectId: string, chapterId: string, data: Partial<BackendChapter>) {
  return request<BackendChapter>(`/api/projects/${projectId}/chapters/${chapterId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteChapter(projectId: string, chapterId: string) {
  return request<{ ok: true }>(`/api/projects/${projectId}/chapters/${chapterId}`, {
    method: 'DELETE',
  });
}

export function formatText(text: string) {
  return request<{ text: string }>('/api/format', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function getSettings() {
  return request<BackendSettings>('/api/settings');
}

export function updateSettings(data: Partial<BackendSettings>) {
  return request<BackendSettings>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function listLlmModels(data: { apiBaseUrl: string; apiKey: string }) {
  return request<{ models: LlmModel[] }>('/api/llm/models', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function testLlmConnection(data: { apiBaseUrl: string; apiKey: string; model: string }) {
  return request<{ text: string }>('/api/llm/test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getExportUrl(projectId: string) {
  return `${API_BASE_URL}/api/projects/${projectId}/export.txt`;
}
