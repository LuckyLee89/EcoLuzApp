// src/hooks/useLeiturasTempoReal.ts
import { supabase } from '@services/supabaseClient';
import { useCallback, useEffect, useRef, useState } from 'react';

type LeituraTempoReal = {
  dispositivo_id: string;
  canal?: number;
  tensao_v?: number;
  corrente_a?: number;
  potencia_w?: number;
  energia_kwh?: number;
  frequencia_hz?: number;
  fator_potencia?: number;
  medido_em: string; // ISO
  updated_at?: string;
};

export function useLeiturasTempoReal(dispositivoId?: string | null) {
  const [leituras, setLeituras] = useState<LeituraTempoReal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [online, setOnline] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // guardamos o timestamp atual para evitar “andar pra trás”
  const ultimoISORef = useRef<string | null>(null);

  const isMaisRecente = (novoISO?: string | null) => {
    if (!novoISO) return false;
    if (!ultimoISORef.current) return true;
    return (
      new Date(novoISO).getTime() > new Date(ultimoISORef.current).getTime()
    );
  };

  const aplicarLeitura = (l: LeituraTempoReal) => {
    if (isMaisRecente(l?.medido_em)) {
      ultimoISORef.current = l.medido_em;
      setLeituras(l);
    }
  };

  const refresh = useCallback(async () => {
    if (!dispositivoId) return;
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from('leituras_tempo_real')
      .select('*')
      .eq('dispositivo_id', dispositivoId)
      .order('medido_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setErro(error.message);
    } else if (data) {
      aplicarLeitura(data as LeituraTempoReal);
    }
    setCarregando(false);
  }, [dispositivoId]);

  useEffect(() => {
    if (!dispositivoId) return;
    ultimoISORef.current = null;
    setLeituras(null);
    setOnline(false);
    setErro(null);
    refresh();

    // 🔸 Realtime: leituras (INSERT/UPDATE) — filtradas por dispositivo_id
    const canalLeituras = supabase
      .channel(`leituras-${dispositivoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leituras_tempo_real',
          filter: `dispositivo_id=eq.${dispositivoId}`,
        },
        payload => {
          const row = (payload.new ?? payload.old) as
            | LeituraTempoReal
            | undefined;
          if (row?.dispositivo_id === dispositivoId) {
            aplicarLeitura(row);
          }
        },
      )
      .subscribe();

    // 🔸 Realtime: heartbeat do dispositivo para status “online”
    // Considera online se houve batimento nos últimos 30s
    const janelaMs = 30_000;
    let hbTimer: ReturnType<typeof setTimeout> | null = null;

    const avaliarOnline = async () => {
      const { data, error } = await supabase
        .from('dispositivo_heartbeat')
        .select('visto_em')
        .eq('dispositivo_id', dispositivoId)
        .order('visto_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.visto_em) {
        const ok = Date.now() - new Date(data.visto_em).getTime() <= janelaMs;
        setOnline(ok);
      }
    };

    // checagem inicial + ping periódico leve
    avaliarOnline();
    hbTimer = setInterval(avaliarOnline, 10_000);

    const canalHB = supabase
      .channel(`hb-${dispositivoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispositivo_heartbeat',
          filter: `dispositivo_id=eq.${dispositivoId}`,
        },
        () => avaliarOnline(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalLeituras);
      supabase.removeChannel(canalHB);
      if (hbTimer) clearInterval(hbTimer);
    };
  }, [dispositivoId, refresh]);

  return { leituras, carregando, online, erro, refresh };
}
