import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_athletes",
  title: "Listar atletas",
  description:
    "Lista os atletas de categoria de base cadastrados pelo usuário autenticado, opcionalmente filtrando por categoria ou por parte do nome.",
  inputSchema: {
    category: z.string().optional().describe("Filtra por categoria, por exemplo 'sub-15'."),
    search: z.string().optional().describe("Filtra por parte do nome do atleta."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("athletes")
      .select("id, full_name, birth_date, category, position, dominant_foot, height_cm, weight_kg, notes")
      .order("full_name");
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("full_name", `%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { athletes: data ?? [] },
    };
  },
});
