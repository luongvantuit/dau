import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";

import { GlassScrollbar } from "@/components/site/glass-scrollbar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteBackground } from "@/components/shaders/site-background";
import { SITE } from "@/data/site";
import { getAllEvents } from "@/lib/events";
import { MotionProvider } from "@/providers/motion-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
});

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

// Địa chỉ tuyệt đối, không phải "/og.png": metadataBase là
// https://.../dau, mà new URL("/og.png", base) cắt mất phần "/dau" — thẻ og
// sẽ trỏ ra ngoài gốc tên miền, nơi không có tệp nào.
export const OG_IMAGE = {
  url: `${SITE.url}/og.png`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${SITE.name}, ${SITE.fullName}`,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    // Không dùng dấu ngăn gõ tay: thẻ <title> chỉ nhận chữ nên không vẽ được
    // chấm thật, mà ghép bằng lời thì đọc tự nhiên hơn hẳn.
    default: `${SITE.name}, ${SITE.fullName}`,
    template: `%s của ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE.name,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            {/* Ngoài template.tsx: xem ghi chú trong SiteBackground. */}
            <SiteBackground />
            <SiteHeader events={getAllEvents()} />
            {children}
            <SiteFooter events={getAllEvents()} />
            <GlassScrollbar />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
