import type { BackendSettings } from '../api/novelApi';

export type AppPreferences = Pick<BackendSettings, 'autoSave' | 'aiPolishLevel'> & {
  darkMode?: boolean;
  fontFamily?: string;
};

export const fontFamilyOptions = [
  { value: 'serif', label: '宋体 / Noto Serif', description: '适合长篇正文阅读与沉浸式写作。' },
  { value: 'simsun', label: '仿宋 / SimSun', description: '更接近传统文稿排版。' },
  { value: 'sans', label: '微软雅黑 / Microsoft YaHei', description: '界面感更强，适合大纲和短文本编辑。' },
] as const;

export const polishLevelOptions = [
  { value: 'conservative', label: '保守', description: '仅修正错别字、标点和明显语病。' },
  { value: 'moderate', label: '适中', description: '优化修辞、节奏和段落衔接。' },
  { value: 'aggressive', label: '积极', description: '会补充环境、动作和情绪细节。' },
] as const;

export function applyAppPreferences(settings: AppPreferences) {
  document.body.dataset.theme = settings.darkMode ? 'dark' : 'light';
  document.body.dataset.editorFont = settings.fontFamily || 'serif';
  document.body.dataset.autoSave = settings.autoSave ? 'on' : 'off';
  document.body.dataset.polishLevel = settings.aiPolishLevel || 'moderate';
}

export function getFontOption(value: string) {
  return fontFamilyOptions.find((option) => option.value === value) || fontFamilyOptions[0];
}

export function getPolishLevelOption(value: AppPreferences['aiPolishLevel']) {
  return polishLevelOptions.find((option) => option.value === value) || polishLevelOptions[1];
}
