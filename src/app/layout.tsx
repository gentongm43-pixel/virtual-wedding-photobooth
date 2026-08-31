import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momen Kita — Virtual Wedding Photobooth",
  description: "Photobooth dan guest book digital untuk hari istimewa.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body className="min-h-screen">{children}</body></html>;
}
