import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createPost } from "../firebase/feed";
import { useNavigate } from "react-router-dom";

export default function CriarPost() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    if (!text.trim() || !currentUser) return;

    setLoading(true);

    const author = {
      uid: currentUser.uid,
      name: currentUser.displayName || "Atleta",
      photoURL: currentUser.photoURL || "",
      position: "Atleta",
    };

    await createPost({
      author,
      text,
      imageUrl: "", // se quiser depois inserir
    });

    navigate("/feed");
  };

  return (
    <div className="p-6">
      <textarea
        className="w-full p-4 rounded-lg bg-gray-800 text-white"
        placeholder="O que deseja compartilhar?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        disabled={loading}
        onClick={enviar}
        className="mt-4 bg-orange-500 px-5 py-2 rounded-lg text-white"
      >
        {loading ? "Enviando..." : "Publicar"}
      </button>
    </div>
  );
}
