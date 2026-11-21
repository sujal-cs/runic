import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Layout({ children, fullWidth = false }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Navbar />
      <main className="flex-1">
        {fullWidth ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-[1120px] px-6 max-sm:px-4">
            {children}
          </div>
        )}
      </main>
      {!fullWidth && <Footer />}
    </div>
  );
}
