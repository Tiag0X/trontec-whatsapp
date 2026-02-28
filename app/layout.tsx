import type { Metadata } from 'next';
import { Fira_Sans, Fira_Code } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Trontec AI',
  description: 'Plataforma Inteligente de Gestão de Comunicações',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className={firaSans.className}>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 ml-[260px] bg-[#FAF5FF] min-h-screen">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
