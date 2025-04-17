import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-border overflow-y-auto">
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
          <h1 className="text-lg font-semibold">Finance Visualizer</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link href="/">
            <div className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              location === "/" ? "bg-primary text-primaryForeground" : "hover:bg-secondary"
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </div>
          </Link>
          <Link href="/transactions">
            <div className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
              location === "/transactions" ? "bg-primary text-primaryForeground" : "hover:bg-secondary"
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Transactions
            </div>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
