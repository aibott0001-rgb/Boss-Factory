import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boss Factory | Autonomous Wealth Engine",
  description: "Build, Deploy, and Scale AI Ventures Automatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        <Navbar />
        <main className="pt-16"> {/* Padding top for fixed navbar */}
          {children}
        </main>
      </body>
    </html>
  );
}

// ... imports
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }: ...) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider> {/* Add this */}
           <Navbar />
           <main className="pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
