import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://seefood-hotdog-classifier.vercel.app",
  ),
  title: {
    default: "SeeFood™ — Visual Cuisine Intelligence Platform",
    template: "%s",
  },
  description:
    "Enterprise-grade image classification. Determine, with confidence, whether an image contains a hot dog. Powered by Amazon Bedrock.",
  applicationName: "SeeFood",
  keywords: [
    "hot dog classifier",
    "image classification",
    "computer vision",
    "Amazon Bedrock",
    "enterprise AI",
    "visual cuisine intelligence",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "SeeFood",
    title: "SeeFood™ — Visual Cuisine Intelligence Platform",
    description:
      "Upload any image and receive a single, definitive verdict — Hot Dog or Not Hot Dog — scored, explained, and logged for audit.",
    images: [
      { url: "/marketing/og.webp", width: 1200, height: 675, alt: "SeeFood" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeeFood™ — Visual Cuisine Intelligence Platform",
    description:
      "Enterprise hot dog classification. Definitive verdicts, scored and audit-ready.",
    images: ["/marketing/og.webp"],
  },
  robots: { index: true, follow: true },
};

// Organization + SoftwareApplication structured data for rich results.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "SeeFood Technologies, Inc.",
      description:
        "Enterprise visual cuisine intelligence — deterministic hot dog classification at scale.",
      url: "https://seefood-hotdog-classifier.vercel.app",
    },
    {
      "@type": "SoftwareApplication",
      name: "SeeFood",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Upload an image and receive a definitive Hot Dog / Not Hot Dog verdict with a confidence score, rationale, and audit log.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
