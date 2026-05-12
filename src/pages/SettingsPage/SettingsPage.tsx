import { useEffect, useMemo, useState } from 'react';
import {
  getSettings,
  listLlmModels,
  testLlmConnection,
  updateSettings,
  type BackendSettings,
  type LlmModel,
} from '../../api/novelApi';
import {
  applyAppPreferences,
  fontFamilyOptions,
  getFontOption,
  getPolishLevelOption,
  polishLevelOptions,
} from '../../utils/appPreferences';
import './SettingsPage.css';

type SettingsState = Required<Pick<BackendSettings, 'apiKey' | 'autoSave' | 'aiPolishLevel'>> & {
  apiProvider: string;
  apiBaseUrl: string;
  model: string;
  darkMode: boolean;
  fontFamily: string;
};

const defaultSettings: SettingsState = {
  apiProvider: 'openai-compatible',
  apiBaseUrl: '',
  apiKey: '',
  model: '',
  darkMode: false,
  fontFamily: 'serif',
  autoSave: true,
  aiPolishLevel: 'moderate',
};

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    return parsed.error || error.message;
  } catch {
    return error.message || fallback;
  }
}

function stripThinkContent(text: string) {
  return text
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '')
    .replace(/<think\b[^>]*>[\s\S]*$/gi, '')
    .trim();
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [models, setModels] = useState<LlmModel[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState('正在读取后端设置...');
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState('');

  const modelOptions = useMemo(() => {
    if (!settings.model || models.some((model) => model.id === settings.model)) {
      return models;
    }
    return [{ id: settings.model, name: settings.model }, ...models];
  }, [models, settings.model]);

  const selectedFont = getFontOption(settings.fontFamily);
  const selectedPolishLevel = getPolishLevelOption(settings.aiPolishLevel);
  const canTest = Boolean(settings.apiBaseUrl.trim() && settings.apiKey.trim() && settings.model.trim());

  useEffect(() => {
    let alive = true;

    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSettings();
        if (!alive) return;
        const mergedSettings = { ...defaultSettings, ...data };
        setSettings(mergedSettings);
        applyAppPreferences(mergedSettings);
        setStatus('设置已从后端加载。');
      } catch (err) {
        if (!alive) return;
        setError(getErrorMessage(err, '读取设置失败'));
        setStatus('读取设置失败，请确认后端服务已启动。');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      alive = false;
    };
  }, []);

  function updateLocalSettings(data: Partial<SettingsState>) {
    setSettings((prev) => {
      const next = { ...prev, ...data };
      applyAppPreferences(next);
      return next;
    });
    setError(null);
    setTestResult('');
  }

  async function saveSettings(nextSettings = settings) {
    const normalizedSettings = {
      ...nextSettings,
      apiProvider: 'openai-compatible',
      apiBaseUrl: normalizeBaseUrl(nextSettings.apiBaseUrl),
    };

    try {
      setSaving(true);
      setError(null);
      const saved = await updateSettings(normalizedSettings);
      const mergedSettings = { ...defaultSettings, ...saved };
      setSettings(mergedSettings);
      applyAppPreferences(mergedSettings);
      setStatus('设置已保存到后端。');
      return mergedSettings;
    } catch (err) {
      setError(getErrorMessage(err, '保存设置失败'));
      setStatus('保存失败，请稍后重试。');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function updateAndSave(data: Partial<SettingsState>) {
    const nextSettings = { ...settings, ...data };
    setSettings(nextSettings);
    applyAppPreferences(nextSettings);
    await saveSettings(nextSettings);
  }

  async function handleLoadModels() {
    const nextSettings = {
      ...settings,
      apiBaseUrl: normalizeBaseUrl(settings.apiBaseUrl),
    };

    if (!nextSettings.apiBaseUrl || !nextSettings.apiKey.trim()) {
      setError('请先填写模型接口地址和 API Key。');
      setStatus('无法获取模型列表。');
      return;
    }

    try {
      setLoadingModels(true);
      setError(null);
      setTestResult('');
      setStatus('正在获取模型列表...');
      await saveSettings(nextSettings);
      const result = await listLlmModels({
        apiBaseUrl: nextSettings.apiBaseUrl,
        apiKey: nextSettings.apiKey,
      });

      setModels(result.models);
      const nextModel = result.models.some((model) => model.id === nextSettings.model)
        ? nextSettings.model
        : result.models[0]?.id || '';

      if (nextModel && nextModel !== settings.model) {
        await updateAndSave({ apiBaseUrl: nextSettings.apiBaseUrl, model: nextModel });
      } else {
        setSettings((prev) => ({ ...prev, apiBaseUrl: nextSettings.apiBaseUrl }));
      }

      setStatus(`已获取 ${result.models.length} 个可用模型。`);
    } catch (err) {
      setModels([]);
      setError(getErrorMessage(err, '无法获取模型列表'));
      setStatus('无法获取模型列表。');
    } finally {
      setLoadingModels(false);
    }
  }

  async function handleTestApi() {
    const nextSettings = {
      ...settings,
      apiBaseUrl: normalizeBaseUrl(settings.apiBaseUrl),
    };

    if (!nextSettings.apiBaseUrl || !nextSettings.apiKey.trim() || !nextSettings.model.trim()) {
      setError('请先填写接口地址、API Key，并选择可用模型。');
      setStatus('测试连接失败。');
      return;
    }

    try {
      setTesting(true);
      setError(null);
      setTestResult('');
      setStatus('正在测试模型连接...');
      await saveSettings(nextSettings);
      const result = await testLlmConnection({
        apiBaseUrl: nextSettings.apiBaseUrl,
        apiKey: nextSettings.apiKey,
        model: nextSettings.model,
      });
      setTestResult(stripThinkContent(result.text) || '模型未返回可展示内容。');
      setStatus('模型连接测试成功。');
    } catch (err) {
      setError(getErrorMessage(err, '测试连接失败'));
      setStatus('测试连接失败。');
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>系统设置</h2>
          <p className={error ? 'settings-status-error' : undefined}>
            {error ? `${status} ${error}` : status}
          </p>
        </div>
      </div>

      <section className="settings-page">
        <div className="settings-container">
          <section className="settings-section">
            <h3>模型接口配置</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>模型接口地址</h4>
                <p>填写 OpenAI-compatible base URL，例如 https://api.openai.com/v1。</p>
              </div>
              <div className="api-input-wrapper">
                <input
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  value={settings.apiBaseUrl}
                  disabled={loading}
                  onChange={(event) => updateLocalSettings({ apiBaseUrl: event.target.value })}
                  onBlur={() => saveSettings()}
                />
                <button
                  type="button"
                  onClick={handleLoadModels}
                  disabled={loading || loadingModels || !settings.apiBaseUrl.trim() || !settings.apiKey.trim()}
                  className="btn-outline compact"
                >
                  {loadingModels ? '获取中...' : '获取模型列表'}
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>API Key</h4>
                <p>API Key 会保存到本地后端数据文件，后端仅用于代理测试请求。</p>
              </div>
              <div className="api-input-wrapper">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={settings.apiKey}
                  disabled={loading}
                  onChange={(event) => updateLocalSettings({ apiKey: event.target.value })}
                  onBlur={() => saveSettings()}
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="btn-outline compact">
                  {showApiKey ? '隐藏' : '显示'}
                </button>
                <button type="button" onClick={() => saveSettings()} disabled={loading || saving} className="btn-primary compact">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>

            <div className="setting-item row">
              <div className="setting-info">
                <h4>可用模型</h4>
                <p>模型列表来自当前接口地址的 /models 响应。</p>
              </div>
              <select
                value={settings.model}
                disabled={loading || loadingModels || modelOptions.length === 0}
                onChange={(event) => updateAndSave({ model: event.target.value })}
                className="form-select"
              >
                {modelOptions.length === 0 ? (
                  <option value="">请先获取模型列表</option>
                ) : (
                  modelOptions.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name || model.id}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="settings-actions">
              <button type="button" onClick={handleTestApi} disabled={loading || testing || !canTest} className="btn-primary">
                {testing ? '测试中...' : '测试连接'}
              </button>
            </div>

            {testResult && (
              <div className="llm-test-result">
                <h4>模型返回</h4>
                <pre>{testResult}</pre>
              </div>
            )}
          </section>

          <section className="settings-section">
            <h3>偏好设置</h3>
            <div className="preference-grid">
              <div className="setting-item row">
                <div className="setting-info">
                  <h4>深色模式</h4>
                  <p>切换后立即应用到当前界面，并保存到后端。</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    disabled={loading}
                    onChange={(event) => updateAndSave({ darkMode: event.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <h4>正文默认字体</h4>
                  <p>{selectedFont.description}</p>
                </div>
                <select
                  value={settings.fontFamily}
                  disabled={loading}
                  onChange={(event) => updateAndSave({ fontFamily: event.target.value })}
                  className="form-select"
                >
                  {fontFamilyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <h4>自动保存</h4>
                  <p>{settings.autoSave ? '已开启：工作区编辑失焦时会保存章节内容。' : '已关闭：工作区会显示手动保存按钮。'}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    disabled={loading}
                    onChange={(event) => updateAndSave({ autoSave: event.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <h4>AI 润色强度</h4>
                  <p>{selectedPolishLevel.description}</p>
                </div>
                <select
                  value={settings.aiPolishLevel}
                  disabled={loading}
                  onChange={(event) => updateAndSave({ aiPolishLevel: event.target.value as SettingsState['aiPolishLevel'] })}
                  className="form-select"
                >
                  {polishLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="preference-preview">
              <div>
                <span className="preview-label">当前偏好</span>
                <strong>{settings.darkMode ? '深色界面' : '浅色界面'} / {selectedFont.label} / {selectedPolishLevel.label}润色</strong>
              </div>
              <p className="font-preview">
                这是正文编辑区的字体预览。长篇写作需要稳定的行距、清晰的字面和较低的视觉噪音。
              </p>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
