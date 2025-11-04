import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRole);

serve(async req => {
  try {
    const body = await req.json();
    const {
      device_key,
      canal,
      tensao_v,
      corrente_a,
      potencia_w,
      energia_kwh,
      frequencia_hz,
      fator_potencia,
      rssi,
      ip,
    } = body;

    if (!device_key) {
      return new Response(JSON.stringify({ error: 'device_key ausente' }), {
        status: 400,
      });
    }

    // 1️⃣ Busca chaves ativas
    const { data: keys, error: keyError } = await supabase
      .from('dispositivo_keys')
      .select('dispositivo_id, key_hash, ativo, expira_em')
      .eq('ativo', true);

    if (keyError) throw new Error('Erro ao consultar dispositivo_keys');
    if (!keys || keys.length === 0)
      throw new Error('Nenhuma chave ativa encontrada');

    // 2️⃣ Valida a key comparando com o hash
    let validKey = null;
    for (const k of keys) {
      const match = bcrypt.compareSync(device_key, k.key_hash);

      if (match && (!k.expira_em || new Date(k.expira_em) > new Date())) {
        validKey = k;
        break;
      }
    }

    if (!validKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired device key' }),
        { status: 401 },
      );
    }

    const dispositivo_id = validKey.dispositivo_id;

    // 3️⃣ Insere leitura
    const { error: insertError } = await supabase.from('pzem_leituras').insert([
      {
        dispositivo_id,
        canal,
        tensao_v,
        corrente_a,
        potencia_w,
        energia_kwh,
        frequencia_hz,
        fator_potencia,
        medido_em: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    // 4️⃣ Atualiza heartbeat
    const { error: hbError } = await supabase
      .from('dispositivo_heartbeat')
      .insert([
        {
          dispositivo_id,
          visto_em: new Date().toISOString(),
          ip,
          rssi,
          status: 'online',
        },
      ]);

    if (hbError) console.warn('⚠️ Falha ao atualizar heartbeat:', hbError);

    // ✅ Sucesso
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌ Erro ingest-pzem:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
