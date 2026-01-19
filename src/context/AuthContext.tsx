import { createContext, useContext, useEffect, useState } from "react";
import { clienteSupabase } from "../lib/supabase";

type Usuario = {
  id: string;
  email: string;
  is_premium?: boolean;
};

type AuthContextType = {
  usuario: Usuario | null;
  carregando: boolean;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  carregando: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const session = clienteSupabase.auth.getSession();

    session.then(({ data }) => {
      if (data.session?.user) {
        setUsuario({
          id: data.session.user.id,
          email: data.session.user.email!,
        });
      }
      setCarregando(false);
    });

    const { data: listener } = clienteSupabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUsuario({
            id: session.user.id,
            email: session.user.email!,
          });
        } else {
          setUsuario(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
