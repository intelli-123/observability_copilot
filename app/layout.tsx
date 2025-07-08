// app/layout.tsx
import "../styles/globals.css"
//import "./globals.css";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Observability-CIG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Global Logo in Top-Right Corner */}
        <div className="fixed top-4 right-4 z-50">
          <Link href="/dashboard">
            <Image
              src="/Intelliswift-1.png"
              alt="Intelliswift Logo"
              width={120}
              height={30}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}


// import "../styles/globals.css";

// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-50`}>{children}</body>
//     </html>
//   );
// }
