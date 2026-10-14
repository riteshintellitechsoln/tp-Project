//  import type { Metadata } from "next";
// import { Inter, Plus_Jakarta_Sans } from "next/font/google";
// import { Toaster } from "sonner";

// import { ThemeProvider } from "@/components/providers/theme-provider";
// import { SessionProvider } from "@/components/providers/session-provider";
// import { SessionWatcher } from "@/components/admin/session-watcher";
// import { CookieConsent } from "@/components/shared/cookie-consent";
// import { siteConfig } from "@/config/site";
import "./globals.css";

// const fontSans = Inter({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   display: "swap",
// });

// const fontDisplay = Plus_Jakarta_Sans({
//   subsets: ["latin"],
//   weight: ["600", "700", "800"],
//   variable: "--font-display",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
//   title: {
//     default: siteConfig.name,
//     template: `%s | ${siteConfig.name}`,
//   },
//   description: siteConfig.description,
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning
//       className={`${fontSans.variable} ${fontDisplay.variable}`}
//     >
//       <body className="font-sans antialiased">
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <SessionProvider>
//             <SessionWatcher />
//             {children}
//             <CookieConsent />
//             <Toaster richColors position="top-right" />
//           </SessionProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { SessionWatcher } from "@/components/admin/session-watcher";
import { SavedBooksSync } from "@/components/providers/saved-books-sync";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { siteConfig } from "@/config/site";
// import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <SessionWatcher />
            <SavedBooksSync />
            <NavigationProgress />
            <OfflineIndicator />
            {children}
            <CookieConsent />
            <Toaster richColors position="top-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}