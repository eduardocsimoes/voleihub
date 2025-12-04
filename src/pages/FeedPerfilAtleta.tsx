// src/pages/FeedPerfilAtleta.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { FeedPost, getUserPosts } from "../firebase/feed";

export default function FeedPerfilAtleta() {
  // rota algo como: /feed/perfil/:uid
  const { uid } = useParams<{ uid: string }>();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      // se não tiver uid na rota, não tenta buscar nada
      if (!uid) {
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserPosts(uid); // uid aqui é string
        setPosts(data);
      } catch (err) {
        console.error("Erro ao carregar posts do atleta:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <p className="text-gray-300 text-lg">Carregando publicações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Publicações do atleta</h1>
          <p className="text-sm text-gray-400">
            Histórico de posts públicos desse atleta na VôleiHub.
          </p>
        </header>

        {posts.length === 0 && (
          <p className="text-gray-400 text-sm">
            Nenhuma publicação encontrada para esse atleta.
          </p>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} full={true} />
        ))}
      </main>
    </div>
  );
}
