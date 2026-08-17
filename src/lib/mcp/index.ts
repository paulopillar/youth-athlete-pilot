import { auth, defineMcp } from "@lovable.dev/mcp-js";
import type { AnyToolDefinition } from "@lovable.dev/mcp-js";
import listAthletes from "./tools/list-athletes";
import createAthlete from "./tools/create-athlete";
import updateAthlete from "./tools/update-athlete";
import deleteAthlete from "./tools/delete-athlete";

// The OAuth issuer must be the direct Supabase host; the project ref is inlined
// at build time and survives publish unchanged.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "talento-jovem",
  title: "Talento Jovem",
  version: "0.1.0",
  instructions:
    "Ferramentas para gerenciar atletas de categoria de base. Use list_athletes para consultar o elenco, create_athlete para cadastrar, update_athlete para editar e delete_athlete para remover. Todas as operações agem em nome do usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAthletes, createAthlete, updateAthlete, deleteAthlete] as unknown as AnyToolDefinition[],
});
