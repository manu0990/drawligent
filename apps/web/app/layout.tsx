import type { Metadata } from "next";
import { Handlee, EB_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";

const patrickHand = Handlee({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});


const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Drawligent",
  description: "Drawligent is a modern whiteboard application that can also use AI for solving maths from the drawing or shapes you create on the white board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ebGaramond.variable} ${patrickHand.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
