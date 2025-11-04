import { supabase } from './supabaseClient';

export async function verificarAssinaturaAtiva(userId: string) {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('ativa, expira_em')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar assinatura:', error.message);
      return false;
    }

    // Se existir e ainda estiver válida
    if (data?.ativa && new Date(data.expira_em) > new Date()) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('Erro ao verificar assinatura:', err);
    return false;
  }
}
