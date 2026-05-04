import Link from "next/link";
import { Playfair_Display, EB_Garamond } from "next/font/google";
import "../globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400","500","600","700"], display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", weight: ["400","500"], display: "swap" });

const NAV = [
  { href: "/admin",            label: "Overview" },
  { href: "/admin/bookings",   label: "Bookings" },
  { href: "/admin/crm",        label: "Guests / CRM" },
  { href: "/admin/analytics",  label: "Analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${garamond.variable} antialiased bg-[#F8F5F0]`}>
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <aside className="w-60 bg-[#1A1A1A] text-white flex-shrink-0 flex flex-col">
            <div className="px-6 py-6 border-b border-white/10">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">Admin</p>
              <p className="font-playfair text-white mt-0.5">MET Art Tour</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-sm text-white/70 hover:text-white hover:bg-white/5 transition-all font-garamond text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 py-5 border-t border-white/10">
              <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors font-garamond tracking-widest uppercase">
                ← Public Site
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm px-8 py-4">
              <p className="font-garamond text-sm text-[#8B7D72]">
                European Art History Tour · Dashboard
              </p>
            </div>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
