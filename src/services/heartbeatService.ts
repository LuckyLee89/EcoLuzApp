import { supabase } from './supabaseClient';
export const HeartbeatService = {
  async listar(dispositivoId: string) {
    const { data, error } = await supabase
      .from('dispositivo_heartbeat')
      .select('*')
      .eq('dispositivo_id', dispositivoId)
      .order('visto_em', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },
};
