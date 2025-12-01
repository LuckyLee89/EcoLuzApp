import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Use POST", { status: 405 });
    }

    const body = await req.json();
    const {
      dispositivo_id,
      tensao_v,
      corrente_a,
      potencia_w,
      energia_kwh,
      frequencia_hz,
      fator_potencia,
    } = body;

    if (!dispositivo_id) {
      return new Response("dispositivo_id é obrigatório", { status: 400 });
    }

    // Data/hora atual (corrigida pra UTC-3)
    const medido_em = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    // 🔹 Atualiza ou insere leitura em tempo real
    const { error: erroLeitura } = await supabase.from("leituras_tempo_real")
      .upsert(
        {
          dispositivo_id,
          tensao_v,
          corrente_a,
          potencia_w,
          energia_kwh,
          frequencia_hz,
          fator_potencia,
          medido_em,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "dispositivo_id" }, // 🔸 1 linha por dispositivo
      );

    if (erroLeitura) {
      console.error("Erro ao salvar leitura:", erroLeitura.message);
      return new Response(erroLeitura.message, { status: 500 });
    }

    // 🔹 Atualiza heartbeat (mantém status online)
    await supabase.from("dispositivo_heartbeat").upsert(
      {
        dispositivo_id,
        visto_em: new Date().toISOString(),
      },
      { onConflict: "dispositivo_id" },
    );

    console.log(
      `✅ Leitura registrada para ${dispositivo_id} (${energia_kwh} kWh)`,
    );

    return new Response(
      JSON.stringify({ success: true, dispositivo_id, energia_kwh }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});
