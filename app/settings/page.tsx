// app/settings/page.tsx

'use client';

import { useEffect, useState, FormEvent } from 'react';

// Assume TOOL_CONFIGS is defined similar to this for context:
// interface ToolConfig {
//   key: string;
//   name: string;
//   fields: string[];
//   description?: string;
// }
// export const TOOL_CONFIGS: ToolConfig[] = [
//   { key: 'analytics', name: 'Analytics Tool', description: 'Configure your analytics preferences.', fields: ['API Key', 'Tracking ID'] },
//   { key: 'featureFlags', name: 'Feature Flags', description: 'Manage experimental features.', fields: ['Client ID'] },
//   { key: 'notifications', name: 'Notification Service', description: 'Set up how you receive notifications.', fields: ['Webhook URL', 'Auth Token'] },
// ];
// Replace with your actual TOOL_CONFIGS import
import { TOOL_CONFIGS } from '@/constants/tools'; // Using your import path

export default function SettingsPage() {
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('dashboard_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setEnabledTools(parsed.enabledTools || {});
          setConfigs(parsed.configs || {});
        }
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSaveStatus({ message: "Could not load previous settings.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  function handleToggle(toolKey: string) {
    setEnabledTools(prev => ({
      ...prev,
      [toolKey]: !prev[toolKey],
    }));
    setSaveStatus(null);
  }

  function handleFieldChange(toolKey: string, field: string, value: string) {
    setConfigs(prev => ({
      ...prev,
      [toolKey]: {
        ...(prev[toolKey] || {}),
        [field]: value,
      },
    }));
    setSaveStatus(null);
  }

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      localStorage.setItem('dashboard_settings', JSON.stringify({ enabledTools, configs }));
      setSaveStatus({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
      setSaveStatus({ message: 'Failed to save settings.', type: 'error' });
    }
    setTimeout(() => setSaveStatus(null), 30);
  }

  if (isLoading) {
    return (
      // Updated background for loading state
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading settings...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  return (
    // Updated page background color here
    <div className="min-h-screen bg-slate-100 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <header className="mb-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your application tools and configurations.
          </p>
        </div>
      </header>

      <form className="max-w-4xl mx-auto space-y-10" onSubmit={handleSave}>
        {TOOL_CONFIGS.map(({ key, name, fields, description }) => (
          // Cards remain bg-white, creating contrast with bg-slate-100 page background
          <section key={key} aria-labelledby={`${key}-heading`} className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id={`${key}-heading`} className="text-xl font-semibold text-slate-700">{name}</h2>
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <label htmlFor={`${key}-toggle`} className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`${key}-toggle`}
                        checked={!!enabledTools[key]}
                        onChange={() => handleToggle(key)}
                        className="sr-only peer"
                      />
                      <div className="block w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-full"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-600">
                      {enabledTools[key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              {enabledTools[key] && (
                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {fields.map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={`${key}-${field.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        {field}
                      </label>
                      <input
                        id={`${key}-${field.toLowerCase().replace(/\s+/g, '-')}`}
                        type="text"
                        value={configs[key]?.[field] || ''}
                        onChange={(e) => handleFieldChange(key, field, e.target.value)}
                        placeholder={`Enter ${field.toLowerCase()}`}
                        autoComplete="off"
                        className="w-full border-slate-300 rounded-md shadow-sm px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        <footer className="flex flex-col sm:flex-row items-center justify-end pt-6 gap-4">
          {saveStatus && (
            <div className={`text-sm ${saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveStatus.message}
            </div>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
          >
            Save All Settings
          </button>
        </footer>
      </form>
    </div>
  );
}

// // app/settings/page.tsx

// 'use client';

// import { useEffect, useState } from 'react';
// import { TOOL_CONFIGS } from '@/constants/tools';

// export default function SettingsPage() {
//   const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
//   const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});

//   useEffect(() => {
//     // Optionally load from localStorage or API
//     const stored = localStorage.getItem('dashboard_settings');
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       setEnabledTools(parsed.enabledTools || {});
//       setConfigs(parsed.configs || {});
//     }
//   }, []);

//   function handleToggle(toolKey: string) {
//     setEnabledTools(prev => ({
//       ...prev,
//       [toolKey]: !prev[toolKey],
//     }));
//   }

//   function handleFieldChange(toolKey: string, field: string, value: string) {
//     setConfigs(prev => ({
//       ...prev,
//       [toolKey]: {
//         ...(prev[toolKey] || {}),
//         [field]: value,
//       },
//     }));
//   }

//   function handleSave() {
//     // Save to localStorage or API
//     localStorage.setItem('dashboard_settings', JSON.stringify({ enabledTools, configs }));
//     alert('Settings saved!');
//   }

//   return (
//     <div className="p-6 space-y-6 text-white bg-gray-900 min-h-screen">
//       <h1 className="text-3xl font-bold text-indigo-400">⚙️ Settings</h1>

//       {TOOL_CONFIGS.map(({ key, name, fields }) => (
//         <div key={key} className="border p-4 rounded-md bg-gray-800 border-gray-700 space-y-4">
//           <label className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={!!enabledTools[key]}
//               onChange={() => handleToggle(key)}
//               className="form-checkbox h-4 w-4 text-indigo-500"
//             />
//             <span className="text-lg font-semibold">{name}</span>
//           </label>

//           {enabledTools[key] && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {fields.map((field) => (
//                 <div key={field}>
//                   <label className="block text-sm mb-1">{field}</label>
//                   <input
//                     type="text"
//                     value={configs[key]?.[field] || ''}
//                     onChange={(e) => handleFieldChange(key, field, e.target.value)}
//                     className="w-full px-3 py-1.5 rounded bg-gray-700 text-white border border-gray-600"
//                     placeholder={`Enter ${field}`}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         onClick={handleSave}
//         className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
//       >
//         Save Settings
//       </button>
//     </div>
//   );
// }
