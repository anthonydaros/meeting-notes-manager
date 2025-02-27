import { Link } from "react-router-dom";
export function Navbar() {
  return <header className="fixed top-0 left-0 right-0 z-10 border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold">Meet Notes
        </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/users" className="text-sm font-medium transition-colors hover:text-primary px-3 py-1.5 rounded-md border border-gray-200 hover:border-primary">
              Usuários
            </Link>
            <Link to="/importacao" className="text-sm font-medium transition-colors hover:text-primary px-3 py-1.5 rounded-md border border-gray-200 hover:border-primary">
              Importação
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Olá, Usuário</span>
          <Link to="/login" className="ml-4 text-sm font-medium transition-colors hover:text-destructive px-3 py-1.5 rounded-md border border-gray-200 hover:border-destructive">
            Sair
          </Link>
        </div>
      </div>
    </header>;
}