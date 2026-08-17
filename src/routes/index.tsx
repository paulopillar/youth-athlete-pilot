import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Athlete = {
  id: string;
  full_name: string;
  birth_date: string | null;
  category: string | null;
  position: string | null;
  dominant_foot: string | null;
};

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Talento Jovem — Gestão de atletas de base" },
      {
        name: "description",
        content:
          "Cadastre e acompanhe atletas das categorias de base: dados físicos, posição, categoria e observações técnicas.",
      },
      { property: "og:title", content: "Talento Jovem — Gestão de atletas de base" },
      {
        property: "og:description",
        content: "Cadastre e acompanhe atletas das categorias de base em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
      if (data.user) await load(setAthletes, setError);
    });
    return () => {
      active = false;
    };
  }, []);

  async function addAthlete(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const { error: err } = await supabase.from("athletes").insert({
      full_name: name.trim(),
      category: category.trim() || null,
      position: position.trim() || null,
    });
    if (err) return setError(err.message);
    setName("");
    setCategory("");
    setPosition("");
    await load(setAthletes, setError);
  }

  async function removeAthlete(id: string) {
    const { error: err } = await supabase.from("athletes").delete().eq("id", id);
    if (err) return setError(err.message);
    await load(setAthletes, setError);
  }

  if (!ready) {
    return <main className="min-h-screen bg-background" />;
  }

  if (!email) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Talento Jovem</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Gestão de atletas das categorias de base — cadastro, categorias, posições e observações
          técnicas, acessíveis também por assistentes de IA conectados ao app.
        </p>
        <Link
          to="/auth"
          search={{ next: "/" }}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Entrar
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-background px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Talento Jovem</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Sair
        </button>
      </header>

      <form onSubmit={addAthlete} className="mt-8 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do atleta"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Categoria"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Posição"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <ul className="mt-8 space-y-2">
        {athletes.map((athlete) => (
          <li
            key={athlete.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium text-card-foreground">{athlete.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {[athlete.category, athlete.position].filter(Boolean).join(" · ") || "Sem detalhes"}
              </p>
            </div>
            <button
              onClick={() => removeAthlete(athlete.id)}
              className="text-sm text-muted-foreground transition-colors hover:text-destructive"
            >
              Remover
            </button>
          </li>
        ))}
        {athletes.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum atleta cadastrado ainda.
          </li>
        )}
      </ul>
    </main>
  );
}

async function load(
  setAthletes: (rows: Athlete[]) => void,
  setError: (message: string | null) => void,
) {
  const { data, error } = await supabase
    .from("athletes")
    .select("id, full_name, birth_date, category, position, dominant_foot")
    .order("full_name");
  if (error) return setError(error.message);
  setError(null);
  setAthletes(data ?? []);
}
