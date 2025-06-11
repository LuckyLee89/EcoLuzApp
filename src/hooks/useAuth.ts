import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica se há sessão ativa ao iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Escuta mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.replace('/login');
  };

  return { isLoggedIn, logout };
}
