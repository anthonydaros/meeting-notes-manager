
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, LogOut, Users } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            className="font-semibold text-lg"
            onClick={() => navigate("/")}
          >
            Notas de Reunião
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate("/meetings")}
            >
              <Users size={18} />
              <span>Usuários</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate("/action-plans")}
            >
              <ClipboardList size={18} />
              <span>Importação</span>
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center gap-2"
          onClick={() => navigate("/login")}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </nav>
  );
}
