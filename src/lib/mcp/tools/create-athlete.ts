import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_athlete",
  title: "Cadastrar atleta",
  description: "Cadastra um novo atleta de categoria de base para o usuário autenticado.",
  inputSchema: {
    full_name: z.string().describe("Nome completo do atleta."),
    birth_date: z.string().optional().describe("Data de nascimento no formato AAAA-MM-DD."),
    category: z.string().optional().describe("Categoria, por exemplo 'sub-13'."),
    position: z.string().optional().describe("Posição em campo."),
    dominant_foot: z.string().optional().describe("Pé dominante: destro, canhoto ou ambidestro."),
    height_cm: z.number().optional().describe("Altura em centímetros."),
    weight_kg: z.number().optional().describe("Peso em quilos."),
    notes: z.string().optional().describe("Observações técnicas sobre o atleta."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const name = input.full_name.trim();
    if (!name) {
      return { content: [{ type: "text", text: "O nome do atleta é obrigatório." }], isError: true };
    }
    const row: Record<string, unknown> = { full_name: name, user_id: ctx.getUserId()! };
    for (const [key, value] of Object.entries(input)) {
      if (key !== "full_name" && value !== undefined) row[key] = value;
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("athletes")
      .insert(row as never)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { athlete: data },
    };
  },
});
