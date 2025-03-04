
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

// Interface para o perfil do usuário
interface UserProfile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for userId:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        return null;
      }

      console.log("Profile data retrieved:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }
  };

  useEffect(() => {
    const setupSession = async () => {
      try {
        console.log("Setting up auth session...");
        
        // Verificar se já temos uma sessão ativa
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          setAuthChecked(true);
          return;
        }
        
        console.log("Current session data:", data);
        
        setSession(data.session);
        setUser(data.session?.user || null);

        // Buscar perfil do usuário se estiver logado
        if (data.session?.user) {
          console.log("User is logged in, fetching profile");
          const profileData = await fetchUserProfile(data.session.user.id);
          setProfile(profileData);
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        console.log("Auth loading complete");
        setLoading(false);
        setAuthChecked(true);
      }
    };

    setupSession();

    // Definir ouvintes para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, "Session:", !!currentSession);
        
        // Apenas atualizar se o estado for diferente do atual
        // ou se ainda não tivermos verificado a autenticação
        if (!authChecked || session !== currentSession) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          // Atualizar perfil quando o estado de autenticação mudar
          if (currentSession?.user) {
            const profileData = await fetchUserProfile(currentSession.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [authChecked, session]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error("Falha ao fazer login: " + error.message);
        throw error;
      }

      console.log("Sign in successful:", data);
      if (data.user) {
        const profileData = await fetchUserProfile(data.user.id);
        setProfile(profileData);
      }

      return { data: data.session, error: null };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out...");
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
      console.log("Sign out complete");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
  };

  console.log("AuthProvider rendering with state:", {
    user: !!user,
    profile: !!profile,
    loading,
    authChecked
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
