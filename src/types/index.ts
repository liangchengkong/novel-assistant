export interface Project {
  id: string;
  title: string;
  genre: string;
  lastModified: string;
  coverColor: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  volumeId: string;
  order: number;
}

export interface Volume {
  id: string;
  title: string;
  projectId: string;
  chapters: Chapter[];
}

export interface StorylineNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface NovelSetting {
  inspiration: string;
  worldSetting: string;
  characters: string;
}

export interface AppSettings {
  apiKey: string;
  apiProvider: string;
  darkMode: boolean;
  fontFamily: string;
  autoSave: boolean;
  aiPolishLevel: 'conservative' | 'moderate' | 'aggressive';
}
