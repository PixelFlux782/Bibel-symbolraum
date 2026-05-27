import "reactflow/dist/style.css";
import "./globals.css";
import { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AmbientBackground from "../components/AmbientBackground";

export const metadata: Metadata = {
  title: {
    default: "Bibel-Symbolraum",
    template: "%s | Bibel-Symbolraum"
  },
  description: "Die verborgene Sprache der Bibel entdecken. Ein kontemplativer Raum für Symbole, innere Bilder und biblische Resonanz.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Bibel-Symbolraum",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className="relative min-h-screen overflow-x-hidden bg-[#0b0b0f] text-[#f5f1e8]">
        <AmbientBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="relative z-10 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
