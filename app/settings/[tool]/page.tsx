// file: app/settings/[tool]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { TOOL_CONFIGS } from '@/constants/tools';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import SettingsPageLayout from '@/components/SettingsPageLayout';

type AllConfigs = Record<string, Record<string, string>>;

export default function ToolSettingsPage() {
  const params = useParams();
  const toolKey = typeof params?.tool === 'string' ? params.tool : '';
  const toolConfig = TOOL_CONFIGS.find(t => t.key === toolKey);

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [allConfigs, setAllConfigs] = useState<AllConfigs>({});
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        
        const fullConfigs = data.configs || {};
        setAllConfigs(fullConfigs);
        
        if (toolKey && fullConfigs[toolKey]) {
          setFormState(fullConfigs[toolKey]);
        }
      } catch (error) {
        console.error("Failed to load settings from API", error);
        setSaveStatus({ message: "Could not load settings.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    if (toolKey) loadSettings();
  }, [toolKey]);

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormState(prev => ({ ...prev, [fieldKey]: value }));
    setSaveStatus(null);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus({ message: 'Saving...', type: 'success' });

    const newConfigsToSave = {
      ...allConfigs,
      [toolKey]: formState,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: newConfigsToSave }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      
      setSaveStatus({ message: result.message, type: 'success' });
    } catch (error: any) {
      setSaveStatus({ message: error.message || 'Failed to save settings.', type: 'error' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!toolConfig) {
    return (
      <SettingsPageLayout
        title="Error"
        description="Tool configuration not found."
      >
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
      {isLoading ? <p className="text-center py-10">Loading settings...</p> : (
        <form onSubmit={handleSave} className="space-y-6 bg-gray-800 p-8 rounded-2xl border border-gray-700">
          {toolConfig.fields.map(field => (
            <div key={field.key}>
              <label htmlFor={field.key} className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              {/* This logic now correctly renders different input types */}
              {field.type === 'textarea' || field.isJson ? (
                <textarea
                  id={field.key}
                  value={formState[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full h-32 pl-4 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs"
                />
              ) : (
                <input
                  id={field.key}
                  // This now correctly sets the input type to 'password' for secret fields
                  type={field.type === 'password' ? 'password' : 'text'}
                  value={formState[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              )}
            </div>
          ))}
          <footer className="flex items-center justify-end pt-6 border-t border-gray-700 gap-4">
            {saveStatus && <div className={`text-sm ${saveStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{saveStatus.message}</div>}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
            >
              <Save size={16} />
              Save Changes
            </button>
          </footer>
        </form>
      )}
    </SettingsPageLayout>
  );
}