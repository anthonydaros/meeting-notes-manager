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

const clearLocalStorage = () => {
  console.log("[Auth] Clearing localStorage...");
  try {
    // Salvar tema atual se existir
    const currentTheme = localStorage.getItem('theme');
    
    // Limpar todo o localStorage
    localStorage.clear();
    
    // Restaurar tema se existia
    if (currentTheme) {
      localStorage.setItem('theme', currentTheme);
    }
    
    console.log("[Auth] localStorage cleared successfully");
  } catch (error) {
    console.error("[Auth] Error clearing localStorage:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[Auth] Fetching user profile for userId:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[Auth] Error fetching user profile:", error);
        return null;
      }

      console.log("[Auth] Profile data retrieved:", data);
      return data as UserProfile;
    } catch (error) {
      console.error("[Auth] Error fetching user profile:", error);
      return null;
    }
  };

  const resetAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    clearLocalStorage();
  };

  // Função para verificar e renovar a sessão se necessário
  const checkAndRefreshSession = async (currentSession: Session) => {
    const expiresAt = new Date(currentSession.expires_at || '').getTime();
    const now = new Date().getTime();
    const timeLeft = expiresAt - now;
    
    console.log("[Auth] Session expires in:", Math.round(timeLeft / (1000 * 60 * 60)), "hours");
    
    // Se a sessão estiver próxima de expirar (menos de 1 hora), renovar
    if (timeLeft < 60 * 60 * 1000) {
      console.log("[Auth] Session near expiration, refreshing...");
      try {
        const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("[Auth] Error refreshing session:", error);
          return null;
        }
        return newSession;
      } catch (error) {
        console.error("[Auth] Error during session refresh:", error);
        return null;
      }
    }
    
    return currentSession;
  };

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        console.log("[Auth] Setting up auth...");
        
        // Limpar localStorage inicialmente para garantir um estado limpo
        clearLocalStorage();
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Error getting initial session:", sessionError);
          setInitializationError(sessionError);
          resetAuthState();
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log("[Auth] Initial session:", initialSession ? "Found" : "None");
          
          if (initialSession?.user) {
            // Verificar e renovar sessão se necessário
            const validSession = await checkAndRefreshSession(initialSession);
            if (!validSession) {
              console.error("[Auth] Session validation failed");
              resetAuthState();
              return;
            }
            
            setSession(validSession);
            setUser(validSession.user);
            const profileData = await fetchUserProfile(validSession.user.id);
            if (mounted) {
              if (!profileData) {
                console.error("[Auth] No profile found for user, clearing session");
                resetAuthState();
              } else {
                setProfile(profileData);
              }
            }
          } else {
            resetAuthState();
          }
        }
      } catch (error) {
        console.error("[Auth] Error in setup:", error);
        setInitializationError(error as Error);
        resetAuthState();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[Auth] Auth state changed:", event);
        
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            resetAuthState();
          } else if (currentSession?.user) {
            // Verificar e renovar sessão se necessário
            const validSession = await checkAndRefreshSession(currentSession);
            if (!validSession) {
              console.error("[Auth] Session validation failed");
              resetAuthState();
              return;
            }
            
            setSession(validSession);
            setUser(validSession.user);
            const profileData = await fetchUserProfile(validSession.user.id);
            if (mounted) {
              if (!profileData) {
                console.error("[Auth] No profile found for user, clearing session");
                resetAuthState();
              } else {
                setProfile(profileData);
              }
            }
          } else {
            resetAuthState();
          }
        }
      }
    );

    // Initial setup
    setupAuth();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("[Auth] Attempting sign in for:", email);
      
      // Limpar localStorage antes do login
      clearLocalStorage();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("[Auth] Login error:", error);
        toast.error("Falha ao fazer login: " + error.message);
        resetAuthState();
        return { data: null, error };
      }

      console.log("[Auth] Sign in successful");
      return { data: data.session, error: null };
    } catch (error) {
      console.error("[Auth] Error during sign in:", error);
      resetAuthState();
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("[Auth] Signing out...");
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      resetAuthState();
      console.log("[Auth] Sign out complete");
    } catch (error) {
      console.error("[Auth] Error during sign out:", error);
      toast.error("Erro ao fazer logout");
      // Tentar limpar estado mesmo com erro
      resetAuthState();
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

  console.log("[Auth] Provider state:", {
    hasUser: !!user,
    hasProfile: !!profile,
    hasSession: !!session,
    loading,
    hasError: !!initializationError
  });

  // Se houver erro de inicialização, mostrar mensagem de erro
  if (initializationError && !loading) {
    toast.error("Erro ao inicializar autenticação. Por favor, recarregue a página.");
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
