import "./globals.css";
import { Inter } from "next/font/google";
import { Overlay } from "@/components/Store";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wallet",
  description: "Personal Wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main id="content">{children}</main>
        <Overlay />
      </body>
    </html>
  );
}
