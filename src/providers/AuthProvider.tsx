
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

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
        const { data } = await supabase.auth.getSession();
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
      }
    };

    setupSession();

    // Definir ouvintes para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user || null);
        
        // Atualizar perfil quando o estado de autenticação mudar
        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
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
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      setProfile(null);
      console.log("Sign out complete");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
