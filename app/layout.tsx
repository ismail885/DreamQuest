import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";


import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: "DreamQuest - RPG Textuel Interactif",
  description: "Créez votre personnage et partez à l'aventure dans des histoires interactives à embranchements multiples.",
  icons: {
    icon: "/Logo_DreamQuest.png",
    apple: "/Logo_DreamQuest.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Blocking inline script — lit le cookie theme avant le rendu pour éviter le FOIT */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var c=document.cookie.match(new RegExp("(?:^|; )dreamquest_theme=([^;]+)"));var dark=c?c[1]==="dark":true;if(dark)document.documentElement.classList.add("dark");document.documentElement.classList.add("disable-transition")}catch(e){}})()`
        }} />
        <link rel="icon" href="/Logo_DreamQuest.png" sizes="any" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${plusJakartaSans.variable} bg-[var(--surface-primary)] text-[var(--content-primary)] antialiased`}>
        <AuthProvider>
          <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-primary)] via-[var(--surface-secondary)] to-[var(--surface-primary)]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>

            </div>
            {children}
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--surface-secondary)',
                color: 'var(--content-primary)',
                border: '1px solid var(--surface-tertiary)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
