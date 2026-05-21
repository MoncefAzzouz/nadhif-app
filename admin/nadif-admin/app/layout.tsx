import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

const gilmer = localFont({
  src: [
    {
      path: "../public/fonts/Gilmer-Regular.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilmer-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilmer-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gilmer",
});

export const metadata: Metadata = {
  title: "Nadif - Premium Laundry & Cleaning Service",
  description: "Experience the ultimate cleanliness with Nadif. Professional, reliable, and premium laundry services at your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${gilmer.variable} ${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
