import React, { useEffect, useState } from "react";
import { getAllPosts } from "../firebase/feed";
import PostCard from "../components/PostCard";

export default function FeedAtletas() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const data = await getAllPosts();
      setPosts(data);
      setLoading(false);
    };
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-300">Carregando feed...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white mb-4">Feed de Atletas</h1>

      {posts.length === 0 && (
        <p className="text-gray-400">Nenhuma publicação encontrada.</p>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
