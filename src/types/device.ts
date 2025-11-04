export interface Dispositivo {
  id: string;
  user_id: string;
  nome: string;
  modelo?: string;
  localizacao?: string;
  firmware?: string;
  created_at: string;
}

export interface PzemLeitura {
  id: string;
  dispositivo_id: string;
  canal: number;
  medido_em: string;
  tensao_v: number;
  corrente_a: number;
  potencia_w: number;
  energia_kwh: number;
  frequencia_hz: number;
  fator_potencia: number;
  created_at: string;
}

export interface Heartbeat {
  id: string;
  dispositivo_id: string;
  visto_em: string;
  ip?: string;
  rssi?: number;
  status?: string;
}
