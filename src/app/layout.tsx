import type { Metadata } from "next"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { FirestoreSyncMount } from "@/components/firestore-sync-mount"
import "./globals.css"

export const metadata: Metadata = {
  title: "Slovak Learning Game",
  description: "Learn Slovak through interactive games, conversations, and grammar lessons.",
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <AuthProvider>
              <FirestoreSyncMount />
              {children}
            </AuthProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
