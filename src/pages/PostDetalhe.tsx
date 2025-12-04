import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../firebase/feed";
import PostCard from "../components/PostCard";

export default function PostDetalhe() {
  const { id } = useParams();
  const [post, setPost] = useState<any | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      const data = await getPostById(id);
      setPost(data);
    };

    carregar();
  }, [id]);

  if (!post) {
    return (
      <div className="p-6 text-center text-gray-400">
        Publicação não encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostCard post={post} full />
    </div>
  );
}
