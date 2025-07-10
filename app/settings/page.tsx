// file: app/settings/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TOOL_CONFIGS } from '@/constants/tools';
import SettingsPageLayout from '@/components/SettingsPageLayout'; // Import the new layout

export default function SettingsDashboardPage() {
  return (
    <SettingsPageLayout
      title="Tool Integrations & Settings"
      description="Select a tool to configure its settings and credentials."
    >
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {TOOL_CONFIGS.map((tool) => (
          <Link
            href={`/settings/${tool.key}`}
            key={tool.key}
            className="group block rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500 hover:scale-105 hover:bg-gray-700/50"
          >
            <div className="flex flex-col items-center text-center">
              <Image
                src={tool.logo}
                alt={`${tool.name} Logo`}
                width={56}
                height={56}
                className="object-contain"
              />
              <h2 className="mt-4 font-semibold text-white">{tool.name}</h2>
              <p className="mt-1 text-xs text-gray-400">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </SettingsPageLayout>
  );
}


// // file: app/settings/page.tsx
// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { TOOL_CONFIGS } from '@/constants/tools';
// import SettingsPageLayout from '@/components/SettingsPageLayout'; // Import the new layout

// export default function SettingsDashboardPage() {
//   return (
//     <SettingsPageLayout
//       title="Tool Integrations & Settings"
//       description="Select a tool to configure its settings and credentials."
//     >
//       <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {TOOL_CONFIGS.map((tool) => (
//           <Link
//             href={`/settings/${tool.key}`}
//             key={tool.key}
//             className="group block rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500 hover:scale-105 hover:bg-gray-700/50"
//           >
//             <div className="flex flex-col items-center text-center">
//               <Image
//                 src={tool.logo}
//                 alt={`${tool.name} Logo`}
//                 width={56}
//                 height={56}
//                 className="object-contain"
//               />
//               <h2 className="mt-4 font-semibold text-white">{tool.name}</h2>
//               <p className="mt-1 text-xs text-gray-400">{tool.description}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </SettingsPageLayout>
//   );
// }
