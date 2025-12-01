// supabase/functions/consolidar_consumo/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const dataOntem = ontem.toISOString().split("T")[0];
  console.log("🔹 Consolidando consumo de", dataOntem);

  // 🔹 Busca as leituras do dia anterior com o user_id via relacionamento
  const { data: totais, error } = await supabase
    .from("leituras_tempo_real")
    .select(`
      energia_kwh,
      medido_em,
      dispositivos!inner(user_id)
    `)
    .gte("medido_em", `${dataOntem}T00:00:00Z`)
    .lt("medido_em", `${dataOntem}T23:59:59Z`);

  if (error) {
    console.error("Erro ao buscar leituras:", error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
    });
  }

  // 🔹 Tipagem corrigida — 'dispositivos' pode ser objeto único ou array
  type LinhaLeitura = {
    energia_kwh: number;
    medido_em: string;
    dispositivos: { user_id: string } | { user_id: string }[];
  };

  const totalPorUsuario: Record<string, number> = {};

  for (const linha of (totais as LinhaLeitura[]) || []) {
    const dispositivos = Array.isArray(linha.dispositivos)
      ? linha.dispositivos[0]
      : linha.dispositivos;

    const userId = dispositivos?.user_id;
    if (!userId) continue;

    const energia = Number(linha.energia_kwh) || 0;
    totalPorUsuario[userId] = (totalPorUsuario[userId] || 0) + energia;
  }

  // 🔹 Monta os registros agregados
  const registros = Object.entries(totalPorUsuario).map(([user_id, total]) => ({
    user_id,
    data: dataOntem,
    consumo_kwh: total,
  }));

  if (registros.length === 0) {
    console.log("Nenhum consumo a registrar.");
    return new Response(JSON.stringify({ success: true, inserted: 0 }), {
      status: 200,
    });
  }

  // 🔹 Insere na tabela consumo
  const { error: insertError } = await supabase.from("consumo").insert(
    registros,
  );
  if (insertError) {
    console.error("Erro ao inserir totais:", insertError);
    return new Response(JSON.stringify({ success: false, insertError }), {
      status: 500,
    });
  }

  console.log("✅ Registros inseridos:", registros.length);
  return new Response(JSON.stringify({ success: true, registros }), {
    status: 200,
  });
});
