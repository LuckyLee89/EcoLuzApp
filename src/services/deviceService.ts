import { supabase } from '../services/supabaseClient';
import { Dispositivo } from '../types/device';

export const DeviceService = {
  async listar(userId: string): Promise<Dispositivo[]> {
    const { data, error } = await supabase
      .from('dispositivos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async registrar(
    userId: string,
    nome: string,
    modelo: string,
    localizacao?: string,
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(
        'register-device',
        {
          body: { user_id: userId, nome, modelo, localizacao },
        },
      );

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Erro ao registrar dispositivo:', err.message);
      throw new Error('Falha ao comunicar com o servidor.');
    }
  },

  async deletar(id: string) {
    const { error } = await supabase.from('dispositivos').delete().eq('id', id);
    if (error) throw error;
  },
};
