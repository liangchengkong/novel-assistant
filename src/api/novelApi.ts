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
  title: string;
  order: number;
  chapterIds: string[];
}

export interface BackendChapter {
  id: string;
  volumeId: string;
  order: number;
  title: string;
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
  apiKey: string;
  autoSave: boolean;
  aiPolishLevel: 'conservative' | 'moderate' | 'aggressive';
  darkMode?: boolean;
  fontFamily?: string;
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

export function getExportUrl(projectId: string) {
  return `${API_BASE_URL}/api/projects/${projectId}/export.txt`;
}
