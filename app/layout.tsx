import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AmbientBackground from "../components/AmbientBackground";

export const metadata = {
  title: "Bibel-Symbolraum",
  description: "Die verborgene Sprache der Bibel entdecken.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen overflow-x-hidden">
        <div className="relative flex min-h-screen flex-col">
          <AmbientBackground />

          <Header />

          <main className="relative z-10 flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}