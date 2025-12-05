// src/pages/SeguidoresSeguindoAtleta.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getFollowers, getFollowing, FollowUserSummary } from "../firebase/follow";
import FollowUserList from "../components/follow/FollowUserList";
import { ArrowLeft } from "lucide-react";

type Mode = "followers" | "following";

interface FollowListPageProps {
  mode: Mode;
}

function FollowListPage({ mode }: FollowListPageProps) {
  const { id: uid } = useParams();
  const [users, setUsers] = useState<FollowUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoading(true);
      try {
        const data =
          mode === "followers"
            ? await getFollowers(uid)
            : await getFollowing(uid);
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid, mode]);

  const title = mode === "followers" ? "Seguidores" : "Seguindo";

  if (!uid) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Perfil inválido.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/perfil/${uid}`}
              className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white"
            >
              <ArrowLeft size={14} />
              Voltar ao perfil
            </Link>
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
        </header>

        <section className="bg-gray-900/80 border border-gray-700/70 rounded-2xl p-4">
          {loading ? (
            <p className="text-sm text-gray-300">Carregando...</p>
          ) : (
            <FollowUserList
              users={users}
              emptyMessage={
                mode === "followers"
                  ? "Nenhum seguidor até o momento."
                  : "Ainda não está seguindo ninguém."
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

// Wrappers para usar nas rotas
export function SeguidoresAtletaPage() {
  return <FollowListPage mode="followers" />;
}

export function SeguindoAtletaPage() {
  return <FollowListPage mode="following" />;
}
