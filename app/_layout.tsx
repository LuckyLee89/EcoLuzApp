import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/login') {
        // Aguarda o próximo frame antes de redirecionar
        setTimeout(() => {
          router.replace('/login');
        }, 0);
      }
    });
  }, [router, pathname]);

  return <Slot />;
}
