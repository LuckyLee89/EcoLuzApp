import { supabase } from '../services/supabaseClient';

export const PzemService = {
  async enviarLeitura(payload: any) {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL}/ingest-pzem`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    return await response.json();
  },

  async listarLeituras(dispositivoId: string) {
    const { data, error } = await supabase
      .from('pzem_leituras')
      .select('*')
      .eq('dispositivo_id', dispositivoId)
      .order('medido_em', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  },
};
