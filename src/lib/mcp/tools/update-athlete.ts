import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_athlete",
  title: "Atualizar atleta",
  description:
    "Atualiza os dados de um atleta já cadastrado. Somente os campos enviados são alterados.",
  inputSchema: {
    id: z.string().describe("Identificador do atleta (obtido em list_athletes)."),
    full_name: z.string().optional(),
    birth_date: z.string().optional().describe("Data de nascimento no formato AAAA-MM-DD."),
    category: z.string().optional(),
    position: z.string().optional(),
    dominant_foot: z.string().optional(),
    height_cm: z.number().optional(),
    weight_kg: z.number().optional(),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, ...changes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "Nenhum campo para atualizar." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("athletes")
      .update(patch as never)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "Atleta não encontrado." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { athlete: data },
    };
  },
});
