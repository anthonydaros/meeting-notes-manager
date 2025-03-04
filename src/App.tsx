
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Importacao from "./pages/Importacao";
import { Toaster } from "sonner";

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - Auth state:", { user: !!user, loading });

  if (loading) {
    console.log("ProtectedRoute - Still loading auth state");
    return <div>Carregando...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("ProtectedRoute - User authenticated, rendering content");
  return <>{children}</>;
};

// Componente para redirecionar usuários logados
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  console.log("PublicRoute - Auth state:", { user: !!user, loading });

  if (loading) {
    console.log("PublicRoute - Still loading auth state");
    return <div>Carregando...</div>;
  }

  if (user) {
    console.log("PublicRoute - User logged in, redirecting to home");
    return <Navigate to="/" />;
  }

  console.log("PublicRoute - No user, rendering public content");
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/importacao"
        element={
          <ProtectedRoute>
            <Importacao />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  console.log("App component rendering");
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
