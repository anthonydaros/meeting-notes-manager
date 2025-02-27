
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  password?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, "id"> & { id?: string }) => void;
  user?: User;
  title: string;
}

export function UserFormModal({ isOpen, onClose, onSave, user, title }: UserFormModalProps) {
  const [formData, setFormData] = useState<Omit<User, "id"> & { id?: string }>({
    name: "",
    email: "",
    department: "",
    role: "",
    status: "active",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
        password: "", // Não exibir a senha atual
      });
    } else {
      setFormData({
        name: "",
        email: "",
        department: "",
        role: "",
        status: "active",
        password: "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!!user} // Desabilita edição de email para usuários existentes
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
                placeholder={user ? "Deixe em branco para manter a senha atual" : "Digite uma senha"}
              />
              <button
                type="button"
                className="absolute right-10 top-0 h-full px-3 flex items-center"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 flex items-center"
                onClick={generatePassword}
                tabIndex={-1}
                title="Gerar senha"
              >
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              type="text"
              required
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Input
              id="role"
              type="text"
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive",
                })
              }
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
