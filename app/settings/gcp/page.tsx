// file: app/settings/gcp/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { TOOL_CONFIGS } from '@/constants/tools';
import Link from 'next/link';
import { ArrowLeft, Save, PlusCircle, XCircle } from 'lucide-react';

export default function GcpSettingsPage() {
  const toolConfig = TOOL_CONFIGS.find(t => t.key === 'gcp');

  // State now holds an array of JSON key strings
  const [projectKeys, setProjectKeys] = useState<string[]>(['']);
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from the API
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
    
    // Filter out any empty text areas before saving
    const validKeys = projectKeys.filter(key => key.trim() !== '');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          configs: { 
            gcp: { GCP_PROJECT_KEYS_JSON: validKeys } 
          } 
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setSaveStatus({ message: result.message, type: 'success' });
    } catch (error: any) {
      setSaveStatus({ message: error.message, type: 'error' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!toolConfig) return <div>Tool not found.</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/settings" className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to All Settings
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">{toolConfig.name} Settings</h1>
          <p className="mt-2 text-gray-400">{toolConfig.description}</p>
        </div>

        {isLoading ? <p>Loading...</p> : (
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
      </div>
    </main>
  );
}
