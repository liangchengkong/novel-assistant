import { useState } from 'react';
import { mockSettings, type MockSettings } from '../../mocks/novelMockData';
import './SettingsPage.css';

type SettingsState = MockSettings;

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({ ...mockSettings });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('当前为前端 mock 设置，刷新后恢复初始值。');

  function updateLocalSettings(data: Partial<SettingsState>) {
    setSettings((prev) => ({ ...prev, ...data }));
  }

  function saveSettings(nextSettings = settings) {
    setSaving(true);
    window.setTimeout(() => {
      setSettings({ ...nextSettings });
      setSaving(false);
      setStatus('设置已在前端内存中保存。');
    }, 250);
  }

  function updateAndSave(data: Partial<SettingsState>) {
    const nextSettings = { ...settings, ...data };
    setSettings(nextSettings);
    saveSettings(nextSettings);
  }

  function handleTestApi() {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      setStatus('mock 连接测试通过，未请求真实模型接口。');
    }, 400);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>系统设置</h2>
          <p>{status}</p>
        </div>
      </div>

      <section className="settings-page">
        <div className="settings-container">
          <section className="settings-section">
            <h3>模型接口配置</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>API Key 配置</h4>
                <p>本阶段仅保存到前端 mock state，不会向外部服务发送请求。</p>
              </div>
              <div className="api-input-wrapper">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={settings.apiKey}
                  onChange={(event) => updateLocalSettings({ apiKey: event.target.value })}
                  onBlur={() => saveSettings()}
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="btn-outline compact">
                  {showApiKey ? '隐藏' : '显示'}
                </button>
                <button type="button" onClick={handleTestApi} disabled={testing} className="btn-outline compact">
                  {testing ? '测试中...' : '测试连接'}
                </button>
                <button type="button" onClick={() => saveSettings()} disabled={saving} className="btn-primary compact">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>

            <div className="setting-item row">
              <div className="setting-info">
                <h4>模型供应商</h4>
                <p>选择后只更新前端展示状态。</p>
              </div>
              <select
                value={settings.apiProvider}
                onChange={(event) => updateAndSave({ apiProvider: event.target.value })}
                className="form-select"
              >
                <option value="openai">OpenAI 通用格式</option>
                <option value="zhipu">智谱 AI</option>
                <option value="ernie">百度千帆 ERNIE</option>
                <option value="qwen">阿里云通义千问</option>
                <option value="local">本地模拟接口</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>偏好设置</h3>
            <div className="setting-item row">
              <div className="setting-info">
                <h4>深色模式</h4>
                <p>当前仅切换设置值，视觉主题后续接入。</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(event) => updateAndSave({ darkMode: event.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-item row">
              <div className="setting-info">
                <h4>正文默认字体</h4>
                <p>设置工作区编辑器使用的字体偏好。</p>
              </div>
              <select
                value={settings.fontFamily}
                onChange={(event) => updateAndSave({ fontFamily: event.target.value })}
                className="form-select"
              >
                <option value="serif">宋体 / Noto Serif</option>
                <option value="simsun">仿宋 / SimSun</option>
                <option value="sans">微软雅黑 / Microsoft YaHei</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>创作辅助</h3>
            <div className="setting-item row">
              <div className="setting-info">
                <h4>自动保存</h4>
                <p>模拟每隔 5 分钟保存当前进度。</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(event) => updateAndSave({ autoSave: event.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-item row">
              <div className="setting-info">
                <h4>AI 润色强度</h4>
                <p>后续接入真实接口时用于控制文本改写幅度。</p>
              </div>
              <select
                value={settings.aiPolishLevel}
                onChange={(event) => updateAndSave({ aiPolishLevel: event.target.value as SettingsState['aiPolishLevel'] })}
                className="form-select"
              >
                <option value="conservative">保守：仅修正错别字和语病</option>
                <option value="moderate">适中：优化修辞与过渡</option>
                <option value="aggressive">积极：丰富环境描写与细节</option>
              </select>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
