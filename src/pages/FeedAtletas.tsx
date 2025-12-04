// src/pages/FeedAtletas.tsx
import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { FeedPost, getAllPosts } from "../firebase/feed";

export default function FeedAtletas() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(data);
      } catch (err) {
        console.error("Erro ao carregar feed geral:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <p className="text-gray-300 text-lg">Carregando publicações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold">Feed Geral dos Atletas</h1>
          <p className="text-sm text-gray-400">
            Veja as conquistas, publicações e atualizações dos atletas da VôleiHub.
          </p>
        </header>

        {posts.length === 0 && (
          <p className="text-gray-400 text-sm">
            Nenhuma publicação encontrada no momento.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} full={false} />
          ))}
        </div>
      </main>
    </div>
  );
}
