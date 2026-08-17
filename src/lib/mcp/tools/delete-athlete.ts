import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_athlete",
  title: "Remover atleta",
  description: "Remove definitivamente um atleta cadastrado pelo usuário autenticado.",
  inputSchema: {
    id: z.string().describe("Identificador do atleta (obtido em list_athletes)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("athletes")
      .delete()
      .eq("id", id)
      .select("id, full_name")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "Atleta não encontrado." }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Atleta removido: ${data.full_name}` }],
      structuredContent: { deleted: data },
    };
  },
});
