import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Cria dois clients: service_role (para inserir) e anon (para validar token)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

serve(async req => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1️⃣ Captura token JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // 2️⃣ Valida token e obtém o usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const user_id = user.id;

    // 3️⃣ Lê dados enviados
    const { nome, modelo, chip_id, mac_addr, localizacao, firmware } =
      await req.json();

    if (!nome) {
      return new Response(
        JSON.stringify({ error: 'Campo obrigatório: nome' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 4️⃣ Cria dispositivo
    const { data: dispositivo, error: dispError } = await supabaseAdmin
      .from('dispositivos')
      .insert([
        {
          user_id,
          nome,
          modelo: modelo || 'ESP32+PZEM',
          chip_id,
          mac_addr,
          localizacao,
          firmware,
        },
      ])
      .select('id')
      .single();

    if (dispError) throw dispError;
    const dispositivo_id = dispositivo.id;

    // 5️⃣ Gera chave segura e salva hash
    const rawKey = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const hashedKey = bcrypt.hashSync(rawKey, 10);

    const { error: keyError } = await supabaseAdmin
      .from('dispositivo_keys')
      .insert([
        {
          dispositivo_id,
          key_hash: hashedKey,
          descricao: 'Chave inicial do dispositivo',
          ativo: true,
        },
      ]);

    if (keyError) throw keyError;

    // 6️⃣ Cria canal padrão (1)
    await supabaseAdmin
      .from('pzem_canais')
      .insert([{ dispositivo_id, canal: 1 }]);

    // ✅ Resposta
    return new Response(
      JSON.stringify({
        success: true,
        dispositivo_id,
        device_key: rawKey, // chave original (enviada ao ESP32)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('❌ Erro register-device:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
