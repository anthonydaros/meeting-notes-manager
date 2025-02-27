
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/auth-layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        toast.success("Conta criada com sucesso! Você já pode fazer login.");
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        toast.success("Login realizado com sucesso");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro durante a autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isSignUp ? "Criar uma conta" : "Bem-vindo(a) de volta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? "Preencha os dados abaixo para criar sua conta"
              : "Digite suas credenciais para acessar sua conta"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                type="text"
                required={isSignUp}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="João Silva"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="joao@exemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading
              ? "Processando..."
              : isSignUp
              ? "Criar conta"
              : "Entrar"}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Já tem uma conta? Entre aqui"
              : "Não tem uma conta? Cadastre-se"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
