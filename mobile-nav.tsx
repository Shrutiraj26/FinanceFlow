import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-2 px-3 cursor-pointer ${
            location === "/" ? "text-primary" : "text-mutedForeground"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs">Dashboard</span>
          </div>
        </Link>
        <Link href="/transactions">
          <div className={`flex flex-col items-center py-2 px-3 cursor-pointer ${
            location === "/transactions" ? "text-primary" : "text-mutedForeground"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Transactions</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
