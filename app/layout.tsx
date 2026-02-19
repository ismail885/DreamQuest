import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#00d4ff" />
      </head>
      <body className="bg-[#0b0d1e] text-white antialiased" suppressHydrationWarning>
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b0d1e] via-[#151829] to-[#0b0d1e]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse"></div>

            </div>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
