// file: app/settings/gcp/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { TOOL_CONFIGS } from '@/constants/tools';
import { Save, PlusCircle, XCircle } from 'lucide-react';
import SettingsPageLayout from '@/components/SettingsPageLayout';

export default function GcpSettingsPage() {
  const toolConfig = TOOL_CONFIGS.find(t => t.key === 'gcp');

  const [projectKeys, setProjectKeys] = useState<string[]>(['']);
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        const gcpConfigs = data.configs?.gcp?.GCP_PROJECT_KEYS_JSON;
        if (gcpConfigs && Array.isArray(gcpConfigs) && gcpConfigs.length > 0) {
          setProjectKeys(gcpConfigs);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleKeyChange = (index: number, value: string) => {
    const newKeys = [...projectKeys];
    newKeys[index] = value;
    setProjectKeys(newKeys);
    setSaveStatus(null);
  };

  const addProject = () => {
    setProjectKeys([...projectKeys, '']);
  };

  const removeProject = (index: number) => {
    const newKeys = projectKeys.filter((_, i) => i !== index);
    setProjectKeys(newKeys);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus({ message: 'Saving...', type: 'success' });
    
    const validKeys = projectKeys.filter(key => key.trim() !== '');

    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      const allConfigs = settingsData.configs || {};

      const newSettings = {
        ...allConfigs,
        gcp: { GCP_PROJECT_KEYS_JSON: validKeys },
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: newSettings }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setSaveStatus({ message: result.message, type: 'success' });
    } catch (error: any) {
      setSaveStatus({ message: error.message, type: 'error' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!toolConfig) {
    return (
      <SettingsPageLayout
        title="Error"
        description="Tool configuration for GCP not found."
      >
        {/* This empty fragment satisfies the 'children' requirement */}
        <></>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title={`${toolConfig.name} Settings`}
      description={toolConfig.description}
      iconSrc={toolConfig.logo}
      backLink={{ href: '/settings', text: 'Back to All Settings' }}
    >
      {isLoading ? <p className="text-center py-10">Loading...</p> : (
        <form onSubmit={handleSave} className="space-y-6 bg-gray-800 p-8 rounded-2xl border border-gray-700">
          {projectKeys.map((key, index) => (
            <div key={index} className="space-y-2 relative group">
              <label className="block text-sm font-medium text-gray-300">
                Project {index + 1} - Service Account JSON
              </label>
              <textarea
                value={key}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                placeholder="Paste the entire content of your service account key file here..."
                className="w-full h-32 pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs"
              />
              {projectKeys.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="absolute top-0 right-0 mt-1 mr-1 p-1 text-gray-500 hover:text-red-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove Project"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <PlusCircle size={16} />
            Add Another Project
          </button>

          <footer className="flex items-center justify-end pt-6 border-t border-gray-700 gap-4">
            {saveStatus && <div className={`text-sm ${saveStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{saveStatus.message}</div>}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
            >
              <Save size={16} />
              Save GCP Settings
            </button>
          </footer>
        </form>
      )}
    </SettingsPageLayout>
  );
}
