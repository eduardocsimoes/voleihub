// src/components/PostCard.tsx
import React from "react";
import { FeedPost, toggleLike } from "../firebase/feed";
import { Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface PostCardProps {
  post: FeedPost;
  full?: boolean;
}

export default function PostCard({ post, full = false }: PostCardProps) {
  const { currentUser } = useAuth();
  const liked = post.likes.some((l) => l.userId === currentUser?.uid);

  const handleLike = async () => {
    if (!currentUser) return;
    await toggleLike(post.id, currentUser.uid);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg hover:border-orange-500/40 transition">
      {/* Cabeçalho do Autor */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.author.photoURL || "/placeholder.png"}
          alt={post.author.name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <p className="font-semibold text-white">{post.author.name}</p>
          {post.author.position && (
            <p className="text-xs text-gray-400">{post.author.position}</p>
          )}
        </div>
      </div>

      {/* Texto do post */}
      <p className="text-gray-300 whitespace-pre-wrap mb-3">
        {full ? post.text : post.text.substring(0, 180) + (post.text.length > 180 ? "..." : "")}
      </p>

      {/* Imagem opcional */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full rounded-lg mt-2 border border-gray-700"
        />
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-300 hover:text-white transition"
        >
          <Heart
            size={20}
            fill={liked ? "red" : "none"}
            className={liked ? "text-red-500" : "text-gray-400"}
          />
          <span>{post.likes.length}</span>
        </button>

        <span className="text-xs text-gray-500">
          {post.createdAt.toLocaleDateString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
