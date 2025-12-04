import React, { useEffect, useState } from "react";
import { getPostById, updatePost } from "../firebase/feed";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!id) return;

      const post = await getPostById(id);
      if (!post) return;

      setText(post.text);
      setLoading(false);
    }

    carregar();
  }, [id]);

  const salvar = async () => {
    if (!id) return;

    await updatePost(id, { text });

    navigate("/feed");
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <textarea
        className="w-full p-4 rounded-lg bg-gray-800 text-white"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={salvar}
        className="mt-4 bg-green-500 px-5 py-2 rounded-lg text-white"
      >
        Salvar
      </button>
    </div>
  );
}
