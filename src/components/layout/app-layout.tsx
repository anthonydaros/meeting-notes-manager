
import { ReactNode } from "react";
import { Navbar } from "./navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container pt-24 pb-8">{children}</main>
    </div>
  );
}
