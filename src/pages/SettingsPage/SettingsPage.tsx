import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTestApi = () => {
    setTesting(true);
    setTimeout(() => {
      alert('API 连接测试成功！');
      setTesting(false);
    }, 1000);
  };

  return (
    <>
      <div className="page-header">
        <h2>系统设置</h2>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '32px' }}>
        <div style={{ maxWidth: '600px' }}>
          {/* API Configuration */}
          <div
            className="rounded-lg border mb-6"
            style={{
              backgroundColor: 'var(--panel-bg)',
              borderColor: 'var(--border-color)',
              padding: '24px'
            }}
          >
            <h3
              className="pb-3 mb-5 font-semibold"
              style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)' }}
            >
              模型接口配置 (LLM API)
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>API Key 配置</h4>
              <p
                className="mb-2.5"
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}
              >
                本工具不提供内置模型，请在此输入您自己的大模型 API Key（如 OpenAI、智谱、文心等）。
              </p>
              <div className="flex gap-2.5">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={state.settings.apiKey}
                  onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { apiKey: e.target.value } })}
                  className="flex-1 outline-none"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
                <button
                  onClick={handleTestApi}
                  disabled={testing}
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '4px 12px', opacity: testing ? 0.6 : 1 }}
                >
                  {testing ? '测试中...' : '测试连接'}
                </button>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '4px 16px' }}>
                  保存验证
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>模型供应商选择</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>选择您正在使用的 API 服务商接口格式</p>
              </div>
              <select
                className="outline-none"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'inherit',
                  color: 'var(--text-main)'
                }}
              >
                <option>OpenAI (通用格式)</option>
                <option>智谱 AI (Zhipu)</option>
                <option>百度千帆 (ERNIE)</option>
                <option>阿里云千问 (Qwen)</option>
              </select>
            </div>
          </div>

          {/* Preferences */}
          <div
            className="rounded-lg border mb-6"
            style={{
              backgroundColor: 'var(--panel-bg)',
              borderColor: 'var(--border-color)',
              padding: '24px'
            }}
          >
            <h3
              className="pb-3 mb-5 font-semibold"
              style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)' }}
            >
              偏好设置
            </h3>

            <div className="flex justify-between items-center mb-5">
              <div>
                <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>深色模式</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>在低光环境下保护眼睛</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={state.settings.darkMode}
                  onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { darkMode: e.target.checked } })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>正文默认字体</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>设置工作区编辑器使用的字体</p>
              </div>
              <select
                className="outline-none"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'inherit',
                  color: 'var(--text-main)'
                }}
              >
                <option>宋体 / Noto Serif (推荐)</option>
                <option>黑体 / SimSun</option>
                <option>无衬线 / Microsoft YaHei</option>
              </select>
            </div>
          </div>

          {/* Writing Assistance */}
          <div
            className="rounded-lg border mb-6"
            style={{
              backgroundColor: 'var(--panel-bg)',
              borderColor: 'var(--border-color)',
              padding: '24px'
            }}
          >
            <h3
              className="pb-3 mb-5 font-semibold"
              style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)' }}
            >
              创作辅助
            </h3>

            <div className="flex justify-between items-center mb-5">
              <div>
                <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>自动保存</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>每隔5分钟自动将当前进度保存至本地</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={state.settings.autoSave}
                  onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { autoSave: e.target.checked } })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="mb-1" style={{ fontSize: '14px', fontWeight: 'normal' }}>AI 润色强度</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>调整AI在润色正文时修改的幅度</p>
              </div>
              <select
                value={state.settings.aiPolishLevel}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { aiPolishLevel: e.target.value as 'conservative' | 'moderate' | 'aggressive' } })}
                className="outline-none"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'inherit',
                  color: 'var(--text-main)'
                }}
              >
                <option value="conservative">保守 (仅修正错别字/语病)</option>
                <option value="moderate">适中 (优化修辞与过渡)</option>
                <option value="aggressive">激进 (丰富环境描写与细节)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
